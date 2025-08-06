import { useState, useCallback } from "react";
import { ConfigurationPanel, AnalysisConfig } from "@/components/ConfigurationPanel";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { VulnerabilityResults, Vulnerability } from "@/components/VulnerabilityResults";
import { SignatureChart } from "@/components/SignatureChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Activity, TrendingUp, AlertTriangle } from "lucide-react";
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

  const handleExport = useCallback(() => {
    const exportData = {
      analysis: analysisState,
      vulnerabilities,
      chartData,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecdsa-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analysis results have been exported to JSON file",
    });
  }, [analysisState, vulnerabilities, chartData, toast]);

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
                  Quick Stats
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
                      {((analysisState.signaturesExtracted / Math.max(analysisState.transactionsProcessed, 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
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
      </div>
    </div>
  );
};

export default Index;