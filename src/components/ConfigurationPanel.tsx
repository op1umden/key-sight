import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationPanelProps {
  onAnalysisStart: (config: AnalysisConfig) => void;
  isAnalyzing: boolean;
}

export interface AnalysisConfig {
  chainstackUrl: string;
  apiKey: string;
  startBlock: number;
  endBlock: number;
  maxBlocks: number;
  searchAffine: boolean;
}

export const ConfigurationPanel = ({ onAnalysisStart, isAnalyzing }: ConfigurationPanelProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AnalysisConfig>({
    chainstackUrl: "https://your-node.chainstack.com",
    apiKey: "",
    startBlock: 1000000,
    endBlock: 1001000,
    maxBlocks: 1000,
    searchAffine: true
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');

  const testConnection = async () => {
    setConnectionStatus('testing');
    
    // Simulate connection test
    setTimeout(() => {
      if (config.chainstackUrl && config.chainstackUrl !== "https://your-node.chainstack.com") {
        setConnectionStatus('connected');
        toast({
          title: "Connection successful",
          description: "Successfully connected to Chainstack node",
        });
      } else {
        setConnectionStatus('error');
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: "Please check your node URL and API key",
        });
      }
    }, 2000);
  };

  const handleStartAnalysis = () => {
    if (!config.chainstackUrl || config.chainstackUrl === "https://your-node.chainstack.com") {
      toast({
        variant: "destructive",
        title: "Configuration required",
        description: "Please configure your Chainstack node URL",
      });
      return;
    }

    if (config.startBlock >= config.endBlock) {
      toast({
        variant: "destructive",
        title: "Invalid block range",
        description: "End block must be greater than start block",
      });
      return;
    }

    onAnalysisStart(config);
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="outline" className="text-info border-info">Testing...</Badge>;
      case 'connected':
        return <Badge variant="outline" className="text-success border-success">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not tested</Badge>;
    }
  };

  return (
    <Card className="border border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Analysis Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chainstack-url">Chainstack Node URL</Label>
            <div className="flex gap-2">
              <Input
                id="chainstack-url"
                value={config.chainstackUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, chainstackUrl: e.target.value }))}
                placeholder="https://your-node.chainstack.com"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={connectionStatus === 'testing' || !config.chainstackUrl}
              >
                Test
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {getConnectionStatusBadge()}
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Connection failed
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter API key if required"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-block">Start Block</Label>
            <Input
              id="start-block"
              type="number"
              value={config.startBlock}
              onChange={(e) => setConfig(prev => ({ ...prev, startBlock: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-block">End Block</Label>
            <Input
              id="end-block"
              type="number"
              value={config.endBlock}
              onChange={(e) => setConfig(prev => ({ ...prev, endBlock: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-blocks">Max Blocks</Label>
            <Input
              id="max-blocks"
              type="number"
              value={config.maxBlocks}
              onChange={(e) => setConfig(prev => ({ ...prev, maxBlocks: parseInt(e.target.value) || 1000 }))}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || connectionStatus !== 'connected'}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            This tool will analyze blockchain signatures for ECDSA vulnerabilities including 
            nonce reuse and affine relationships. Analysis will process blocks {config.startBlock} 
            to {Math.min(config.endBlock, config.startBlock + config.maxBlocks - 1)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};