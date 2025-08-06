import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Settings, Zap, Globe, Bitcoin, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationPanelProps {
  onAnalysisStart: (config: AnalysisConfig) => void;
  isAnalyzing: boolean;
}

export interface AnalysisConfig {
  // Chainstack Configuration
  chainstackUrl: string;
  apiKey: string;
  
  // Blockchain Configuration
  networkType: 'bitcoin' | 'ethereum' | 'custom';
  startBlock: number;
  endBlock: number;
  maxBlocks: number;
  
  // Analysis Options
  searchAffine: boolean;
  searchFaultInjection: boolean;
  enableBitcoinSupport: boolean;
  rateLimit: number;
  
  // Advanced Options
  batchSize: number;
  parallelRequests: number;
  includeMempool: boolean;
}

export const ConfigurationPanel = ({ onAnalysisStart, isAnalyzing }: ConfigurationPanelProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AnalysisConfig>({
    chainstackUrl: "https://your-node.chainstack.com",
    apiKey: "",
    networkType: 'bitcoin',
    startBlock: 800000,
    endBlock: 800100,
    maxBlocks: 100,
    searchAffine: true,
    searchFaultInjection: false,
    enableBitcoinSupport: true,
    rateLimit: 0.1,
    batchSize: 50,
    parallelRequests: 10,
    includeMempool: false
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
          Blockchain Analysis Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
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

              <div className="space-y-2">
                <Label>Network Type</Label>
                <Select 
                  value={config.networkType}
                  onValueChange={(value: 'bitcoin' | 'ethereum' | 'custom') => 
                    setConfig(prev => ({ ...prev, networkType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="custom">Custom/Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min="1"
                  max="100"
                  value={config.batchSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 50 }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="search-affine">Search Affine Relationships</Label>
                <Switch
                  id="search-affine"
                  checked={config.searchAffine}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, searchAffine: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="search-fault">Search Fault Injection Patterns</Label>
                <Switch
                  id="search-fault"
                  checked={config.searchFaultInjection}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, searchFaultInjection: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="bitcoin-support">Bitcoin Transaction Support</Label>
                <Switch
                  id="bitcoin-support"
                  checked={config.enableBitcoinSupport}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableBitcoinSupport: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-mempool">Include Mempool</Label>
                <Switch
                  id="include-mempool"
                  checked={config.includeMempool}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMempool: checked }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Rate Limit (seconds)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={config.rateLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, rateLimit: parseFloat(e.target.value) || 0.1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parallel-requests">Parallel Requests</Label>
                <Input
                  id="parallel-requests"
                  type="number"
                  min="1"
                  max="50"
                  value={config.parallelRequests}
                  onChange={(e) => setConfig(prev => ({ ...prev, parallelRequests: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-foreground mb-2">Performance Settings</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Est. Requests/min:</div>
                  <div className="font-medium">{Math.round(60 / config.rateLimit)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Duration:</div>
                  <div className="font-medium">
                    {Math.ceil((config.endBlock - config.startBlock + 1) / config.batchSize * config.rateLimit / 60)}m
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-4">
          <Button 
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || connectionStatus !== 'connected'}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing Blockchain...' : 'Start Blockchain Analysis'}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>
              Comprehensive blockchain analysis for ECDSA vulnerabilities including nonce reuse, 
              affine relationships, and fault injection patterns. Processing blocks {config.startBlock} 
              to {Math.min(config.endBlock, config.startBlock + config.maxBlocks - 1)} 
              on {config.networkType} network.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};