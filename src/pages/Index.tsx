import { useState, useCallback } from "react";
import { ConfigurationPanel, AnalysisConfig } from "@/components/ConfigurationPanel";
import { AdvancedAttackPanel, AttackConfig } from "@/components/AdvancedAttackPanel";
import { KeyRecoveryResults, RecoveryResult } from "@/components/KeyRecoveryResults";
import { ResearchDataPanel, DatasetConfig } from "@/components/ResearchDataPanel";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { VulnerabilityResults, Vulnerability } from "@/components/VulnerabilityResults";
import { SignatureChart } from "@/components/SignatureChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Activity, TrendingUp, AlertTriangle, Key, Zap, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisState {
  isRunning: boolean;
  progress: number;
  blocksAnalyzed: number;
  totalBlocks: number;
  transactionsProcessed: number;
  signaturesExtracted: number;
  vulnerabilitiesFound: number;
  errors: number;
  startTime?: Date;
  endTime?: Date;
}

interface ChartData {
  blockNumber: number;
  signatures: number;
  vulnerabilities: number;
}

const Index = () => {
  const { toast } = useToast();
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isRunning: false,
    progress: 0,
    blocksAnalyzed: 0,
    totalBlocks: 0,
    transactionsProcessed: 0,
    signaturesExtracted: 0,
    vulnerabilitiesFound: 0,
    errors: 0
  });

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recoveryResults, setRecoveryResults] = useState<RecoveryResult[]>([]);
  const [isAttackRunning, setIsAttackRunning] = useState(false);
  const [attackProgress, setAttackProgress] = useState(0);
  const [isDatasetGenerating, setIsDatasetGenerating] = useState(false);
  const [datasetProgress, setDatasetProgress] = useState(0);

  // Simulate ECDSA analysis process
  const simulateAnalysis = useCallback((config: AnalysisConfig) => {
    const totalBlocks = Math.min(config.endBlock - config.startBlock + 1, config.maxBlocks);
    let currentBlock = 0;
    let totalTransactions = 0;
    let totalSignatures = 0;
    let foundVulnerabilities = 0;
    const newChartData: ChartData[] = [];
    const newVulnerabilities: Vulnerability[] = [];

    const interval = setInterval(() => {
      currentBlock += Math.floor(Math.random() * 5) + 1;
      
      if (currentBlock >= totalBlocks) {
        // Analysis complete
        clearInterval(interval);
        
        setAnalysisState(prev => ({
          ...prev,
          isRunning: false,
          progress: 100,
          endTime: new Date()
        }));

        toast({
          title: "Analysis Complete",
          description: `Found ${foundVulnerabilities} vulnerabilities in ${totalSignatures.toLocaleString()} signatures`,
        });
        return;
      }

      // Simulate finding transactions and signatures
      const blockTransactions = Math.floor(Math.random() * 200) + 50;
      const blockSignatures = Math.floor(Math.random() * 150) + 25;
      const blockVulnerabilities = Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0;

      totalTransactions += blockTransactions;
      totalSignatures += blockSignatures;
      foundVulnerabilities += blockVulnerabilities;

      // Add chart data point
      newChartData.push({
        blockNumber: config.startBlock + currentBlock,
        signatures: blockSignatures,
        vulnerabilities: blockVulnerabilities
      });

      // Generate mock vulnerabilities
      if (blockVulnerabilities > 0) {
        const vulnTypes = ['r_value_reuse', 'affine_nonce', 'weak_signature'] as const;
        const severities = ['critical', 'high', 'medium', 'low'] as const;
        
        for (let i = 0; i < blockVulnerabilities; i++) {
          const vulnerability: Vulnerability = {
            id: `vuln-${Date.now()}-${i}`,
            type: vulnTypes[Math.floor(Math.random() * vulnTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            description: `Detected signature vulnerability in block ${config.startBlock + currentBlock}`,
            affectedTransactions: [`0x${Math.random().toString(16).substr(2, 64)}`],
            recoveredKey: Math.random() < 0.3 ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
            blockNumber: config.startBlock + currentBlock,
            details: {}
          };
          newVulnerabilities.push(vulnerability);
        }
      }

      const progress = (currentBlock / totalBlocks) * 100;

      setAnalysisState(prev => ({
        ...prev,
        progress,
        blocksAnalyzed: currentBlock,
        transactionsProcessed: totalTransactions,
        signaturesExtracted: totalSignatures,
        vulnerabilitiesFound: foundVulnerabilities
      }));

      setChartData([...newChartData]);
      setVulnerabilities([...newVulnerabilities]);
    }, 500);

    return () => clearInterval(interval);
  }, [toast]);

  const handleAnalysisStart = useCallback((config: AnalysisConfig) => {
    const totalBlocks = Math.min(config.endBlock - config.startBlock + 1, config.maxBlocks);
    
    setAnalysisState({
      isRunning: true,
      progress: 0,
      blocksAnalyzed: 0,
      totalBlocks,
      transactionsProcessed: 0,
      signaturesExtracted: 0,
      vulnerabilitiesFound: 0,
      errors: 0,
      startTime: new Date()
    });

    setVulnerabilities([]);
    setChartData([]);

    toast({
      title: "Analysis Started",
      description: `Beginning analysis of ${totalBlocks.toLocaleString()} blocks`,
    });

    simulateAnalysis(config);
  }, [simulateAnalysis]);

  // Advanced Attack Handlers
  const handleAttackStart = useCallback((config: AttackConfig) => {
    setIsAttackRunning(true);
    setAttackProgress(0);
    
    // Simulate advanced attack execution
    const interval = setInterval(() => {
      setAttackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAttackRunning(false);
          
          // Generate mock recovery result
          const mockResult: RecoveryResult = {
            success: Math.random() > 0.2, // 80% success rate
            attackMethod: config.type,
            executionTime: Math.random() * 5 + 1,
            confidence: Math.random() * 20 + 80,
            signaturesUsed: Math.floor(Math.random() * 10) + 2,
            recoveredKey: Math.random() > 0.2 ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
            originalKey: `0x${Math.random().toString(16).substr(2, 64)}`,
            affineParams: config.affineParams,
            validationResults: {
              keyMatch: Math.random() > 0.1,
              signatureValidation: Math.random() > 0.1,
              statisticalTests: Math.random() > 0.2
            }
          };
          
          setRecoveryResults(prev => [...prev, mockResult]);
          
          toast({
            title: mockResult.success ? "Attack Successful!" : "Attack Failed",
            description: mockResult.success 
              ? `Private key recovered using ${config.type} method`
              : `No vulnerability found with ${config.type} method`,
            variant: mockResult.success ? "default" : "destructive"
          });
          
          return 100;
        }
        return prev + Math.random() * 10 + 5;
      });
    }, 300);
  }, [toast]);

  // Dataset Generation Handler
  const handleDatasetGenerate = useCallback((config: DatasetConfig) => {
    setIsDatasetGenerating(true);
    setDatasetProgress(0);
    
    const interval = setInterval(() => {
      setDatasetProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDatasetGenerating(false);
          
          toast({
            title: "Dataset Generated",
            description: `Created ${config.vulnerablePairs * 2 + config.safeSignatures} signatures`,
          });
          
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);
  }, [toast]);

  // File Analysis Handler
  const handleFileAnalyze = useCallback((file: File) => {
    toast({
      title: "File Analysis Started",
      description: `Analyzing ${file.name} for signature vulnerabilities`,
    });
    
    // Simulate file analysis
    setTimeout(() => {
      const mockVulns: Vulnerability[] = [
        {
          id: `file-vuln-${Date.now()}`,
          type: 'r_value_reuse',
          severity: 'critical',
          description: `R-value reuse detected in ${file.name}`,
          affectedTransactions: [`file_tx_1`, `file_tx_2`],
          recoveredKey: `0x${Math.random().toString(16).substr(2, 64)}`,
          details: { source: file.name }
        }
      ];
      
      setVulnerabilities(prev => [...prev, ...mockVulns]);
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    const exportData = {
      analysis: analysisState,
      vulnerabilities,
      recoveryResults,
      chartData,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecdsa-complete-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Complete analysis results exported to JSON file",
    });
  }, [analysisState, vulnerabilities, recoveryResults, chartData, toast]);

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return 'N/A';
    const duration = (end || new Date()).getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ECDSA Affine Nonce Attack</h1>
                <p className="text-sm text-muted-foreground">
                  Professional blockchain signature vulnerability analysis tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-primary border-primary">
                Research Tool v1.0
              </Badge>
              {analysisState.startTime && (
                <div className="text-sm text-muted-foreground">
                  Duration: {formatDuration(analysisState.startTime, analysisState.endTime)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="blockchain" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Blockchain Analysis
            </TabsTrigger>
            <TabsTrigger value="attacks" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Advanced Attacks
            </TabsTrigger>
            <TabsTrigger value="recovery" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Key Recovery
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Research Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blockchain" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Configuration */}
              <div className="xl:col-span-1 space-y-6">
                <ConfigurationPanel 
                  onAnalysisStart={handleAnalysisStart}
                  isAnalyzing={analysisState.isRunning}
                />

                {/* Quick Stats */}
                <Card className="border border-border bg-gradient-to-br from-card to-card/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-chart-1" />
                      Analysis Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-chart-1">
                          {analysisState.signaturesExtracted.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Signatures</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-chart-5">
                          {analysisState.vulnerabilitiesFound}
                        </div>
                        <div className="text-xs text-muted-foreground">Vulnerabilities</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-chart-2">
                          {analysisState.transactionsProcessed.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Transactions</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-chart-3">
                          {recoveryResults.filter(r => r.success).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Keys Recovered</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Results */}
              <div className="xl:col-span-2 space-y-6">
                <AnalysisProgress
                  isRunning={analysisState.isRunning}
                  progress={analysisState.progress}
                  blocksAnalyzed={analysisState.blocksAnalyzed}
                  totalBlocks={analysisState.totalBlocks}
                  transactionsProcessed={analysisState.transactionsProcessed}
                  signaturesExtracted={analysisState.signaturesExtracted}
                  vulnerabilitiesFound={analysisState.vulnerabilitiesFound}
                  errors={analysisState.errors}
                />

                {chartData.length > 0 && (
                  <SignatureChart
                    data={chartData}
                    totalSignatures={analysisState.signaturesExtracted}
                    vulnerabilityCount={analysisState.vulnerabilitiesFound}
                  />
                )}

                <VulnerabilityResults
                  vulnerabilities={vulnerabilities}
                  onExport={handleExport}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attacks" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AdvancedAttackPanel 
                onAttackStart={handleAttackStart}
                isRunning={isAttackRunning}
              />
              <KeyRecoveryResults
                results={recoveryResults}
                isRunning={isAttackRunning}
                currentProgress={attackProgress}
              />
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-6">
            <KeyRecoveryResults
              results={recoveryResults}
              isRunning={isAttackRunning}
              currentProgress={attackProgress}
            />
            
            {recoveryResults.length > 0 && (
              <Card className="border border-border bg-gradient-to-br from-card to-card/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-1" />
                    Recovery Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-success">
                        {((recoveryResults.filter(r => r.success).length / Math.max(recoveryResults.length, 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-chart-1">
                        {(recoveryResults.reduce((sum, r) => sum + r.executionTime, 0) / Math.max(recoveryResults.length, 1)).toFixed(2)}s
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-chart-2">
                        {(recoveryResults.reduce((sum, r) => sum + r.confidence, 0) / Math.max(recoveryResults.length, 1)).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Confidence</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-chart-3">
                        {recoveryResults.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Attempts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <ResearchDataPanel
              onDatasetGenerate={handleDatasetGenerate}
              onFileAnalyze={handleFileAnalyze}
              isGenerating={isDatasetGenerating}
              generationProgress={datasetProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;