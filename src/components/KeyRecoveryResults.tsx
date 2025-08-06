import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Shield,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface RecoveryResult {
  success: boolean;
  recoveredKey?: string;
  originalKey?: string;
  attackMethod: string;
  executionTime: number;
  confidence: number;
  signaturesUsed: number;
  affineParams?: { a: number; b: number };
  errorMessage?: string;
  validationResults?: {
    keyMatch: boolean;
    signatureValidation: boolean;
    statisticalTests: boolean;
  };
}

interface KeyRecoveryResultsProps {
  results: RecoveryResult[];
  isRunning: boolean;
  currentProgress?: number;
}

export const KeyRecoveryResults = ({ results, isRunning, currentProgress = 0 }: KeyRecoveryResultsProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Private key has been copied to your clipboard",
    });
  };

  const formatKey = (key: string) => {
    if (key.length > 20) {
      return `${key.slice(0, 10)}...${key.slice(-10)}`;
    }
    return key;
  };

  const getSuccessRate = () => {
    if (results.length === 0) return 0;
    const successful = results.filter(r => r.success).length;
    return (successful / results.length) * 100;
  };

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    return totalTime / results.length;
  };

  const getMethodStats = () => {
    const methods = results.reduce((acc, result) => {
      acc[result.attackMethod] = (acc[result.attackMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(methods).map(([method, count]) => ({
      method,
      count,
      successRate: (results.filter(r => r.attackMethod === method && r.success).length / count) * 100
    }));
  };

  if (results.length === 0 && !isRunning) {
    return (
      <Card className="border border-border bg-gradient-to-br from-card to-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            Key Recovery Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Recovery Attempts Yet</h3>
            <p className="text-muted-foreground">
              Start an attack to see private key recovery results here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Key Recovery Results
          {results.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {results.filter(r => r.success).length} / {results.length} Successful
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recovery Progress</span>
              <span className="font-medium">{currentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <>
            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-success">{getSuccessRate().toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-chart-1">{getAverageTime().toFixed(2)}s</div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-chart-2">{results.length}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
            </div>

            <Separator />

            {/* Method Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Attack Method Performance
              </h4>
              <div className="space-y-2">
                {getMethodStats().map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium capitalize">
                      {stat.method.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.count} attempts
                      </Badge>
                      <Badge 
                        variant={stat.successRate > 80 ? "default" : stat.successRate > 50 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {stat.successRate.toFixed(0)}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Individual Results */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Recent Recovery Attempts</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {results.slice(-10).reverse().map((result, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'border-success/20 bg-success/5' 
                        : 'border-destructive/20 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-medium text-sm capitalize">
                          {result.attackMethod.replace('_', ' ')} Attack
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {result.executionTime.toFixed(2)}s
                      </div>
                    </div>

                    {result.success && result.recoveredKey ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Recovered Private Key:</span>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {result.confidence.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-background/50 border">
                          <code className="flex-1 text-xs font-mono text-success break-all">
                            {formatKey(result.recoveredKey)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(result.recoveredKey || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        {result.affineParams && (
                          <div className="text-xs text-muted-foreground">
                            Affine relationship: k₂ = {result.affineParams.a} × k₁ + {result.affineParams.b}
                          </div>
                        )}

                        {result.validationResults && (
                          <div className="flex gap-2">
                            <Badge 
                              variant={result.validationResults.keyMatch ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {result.validationResults.keyMatch ? "✓" : "✗"} Key Match
                            </Badge>
                            <Badge 
                              variant={result.validationResults.signatureValidation ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {result.validationResults.signatureValidation ? "✓" : "✗"} Sig Valid
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-destructive">
                        {result.errorMessage || "Recovery failed - no affine relationship detected"}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        {result.signaturesUsed} signatures used
                      </div>
                      {result.success && (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <Shield className="h-3 w-3" />
                          Vulnerability confirmed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.filter(r => r.success).length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Security Warning
                </div>
                <div className="text-xs text-muted-foreground">
                  Private keys have been successfully recovered! This demonstrates critical ECDSA 
                  implementation vulnerabilities. In production, these keys would compromise all 
                  associated cryptographic operations.
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};