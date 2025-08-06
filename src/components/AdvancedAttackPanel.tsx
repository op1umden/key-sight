import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Bug, 
  TestTube, 
  FileUp, 
  Settings2,
  Shield,
  AlertTriangle,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvancedAttackPanelProps {
  onAttackStart: (config: AttackConfig) => void;
  isRunning: boolean;
}

export interface AttackConfig {
  type: 'affine' | 'fault_injection' | 'automated_test' | 'raw_analysis';
  affineParams?: { a: number; b: number };
  faultCount?: number;
  testIterations?: number;
  rawSignatures?: string;
  fileName?: string;
}

export const AdvancedAttackPanel = ({ onAttackStart, isRunning }: AdvancedAttackPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("affine");
  
  // Affine Attack Configuration
  const [affineConfig, setAffineConfig] = useState({
    a: 2,
    b: 1,
    generateVulnerable: true,
    numPairs: 10
  });

  // Fault Injection Configuration
  const [faultConfig, setFaultConfig] = useState({
    faultCount: 5,
    faultType: 'bit_flip',
    targetComponent: 's_computation'
  });

  // Automated Testing Configuration
  const [testConfig, setTestConfig] = useState({
    iterations: 50,
    affineParams: [
      { a: 2, b: 1 },
      { a: 3, b: 5 },
      { a: 7, b: 0 },
      { a: -1, b: 1 }
    ],
    parallelTests: true
  });

  // Raw Signature Analysis
  const [rawConfig, setRawConfig] = useState({
    signatures: '',
    format: 'json',
    includeValidation: true
  });

  const predefinedAffineParams = [
    { a: 2, b: 1, name: "Double + 1" },
    { a: 3, b: 5, name: "Triple + 5" },
    { a: 7, b: 0, name: "Septuple" },
    { a: -1, b: 1, name: "Negative + 1" },
    { a: 5, b: -3, name: "Quintuple - 3" },
    { a: 11, b: 13, name: "Complex" }
  ];

  const handleAffineAttack = () => {
    const config: AttackConfig = {
      type: 'affine',
      affineParams: { a: affineConfig.a, b: affineConfig.b }
    };
    
    toast({
      title: "Starting Affine Nonce Attack",
      description: `Testing relationship k2 = ${affineConfig.a}*k1 + ${affineConfig.b}`,
    });
    
    onAttackStart(config);
  };

  const handleFaultInjectionAttack = () => {
    const config: AttackConfig = {
      type: 'fault_injection',
      faultCount: faultConfig.faultCount
    };
    
    toast({
      title: "Starting Fault Injection Attack",
      description: `Simulating ${faultConfig.faultCount} computational faults`,
    });
    
    onAttackStart(config);
  };

  const handleAutomatedTest = () => {
    const config: AttackConfig = {
      type: 'automated_test',
      testIterations: testConfig.iterations
    };
    
    toast({
      title: "Starting Automated Test Suite",
      description: `Running ${testConfig.iterations} test iterations`,
    });
    
    onAttackStart(config);
  };

  const handleRawAnalysis = () => {
    if (!rawConfig.signatures.trim()) {
      toast({
        variant: "destructive",
        title: "No signatures provided",
        description: "Please paste signature data to analyze",
      });
      return;
    }

    const config: AttackConfig = {
      type: 'raw_analysis',
      rawSignatures: rawConfig.signatures
    };
    
    toast({
      title: "Starting Raw Signature Analysis",
      description: "Analyzing provided signature data for vulnerabilities",
    });
    
    onAttackStart(config);
  };

  const loadSampleData = (type: string) => {
    const sampleSignatures = {
      json: `[
  {
    "r": "0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41",
    "s": "0x181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d09",
    "z": "0x7a05c6145f10101e9d6325494245adf1297d80f8f38d4d576d57cdba220bcb19",
    "tx_hash": "sample_tx_1"
  },
  {
    "r": "0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41",
    "s": "0x9a7b5c8d4e2f1a3b6c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    "z": "0x8b16d7426e7ef5ef23b6c73ccf49fff797762624f1a9b168d59b7a895a23cb82",
    "tx_hash": "sample_tx_2"
  }
]`,
      csv: `r,s,z,tx_hash
0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41,0x181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d09,0x7a05c6145f10101e9d6325494245adf1297d80f8f38d4d576d57cdba220bcb19,sample_tx_1
0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41,0x9a7b5c8d4e2f1a3b6c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b,0x8b16d7426e7ef5ef23b6c73ccf49fff797762624f1a9b168d59b7a895a23cb82,sample_tx_2`
    };
    
    setRawConfig(prev => ({ 
      ...prev, 
      signatures: sampleSignatures[type as keyof typeof sampleSignatures] || ''
    }));
    
    toast({
      title: "Sample data loaded",
      description: `Loaded sample ${type.toUpperCase()} signature data with r-value reuse`,
    });
  };

  return (
    <Card className="border border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Advanced Attack Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="affine" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Affine
            </TabsTrigger>
            <TabsTrigger value="fault" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Fault Injection
            </TabsTrigger>
            <TabsTrigger value="automated" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Automated
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Raw Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="affine" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affine-a">Parameter 'a'</Label>
                  <Input
                    id="affine-a"
                    type="number"
                    value={affineConfig.a}
                    onChange={(e) => setAffineConfig(prev => ({ 
                      ...prev, 
                      a: parseInt(e.target.value) || 2 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affine-b">Parameter 'b'</Label>
                  <Input
                    id="affine-b"
                    type="number"
                    value={affineConfig.b}
                    onChange={(e) => setAffineConfig(prev => ({ 
                      ...prev, 
                      b: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm font-medium text-foreground mb-2">
                  Relationship: k₂ = {affineConfig.a} × k₁ + {affineConfig.b}
                </div>
                <div className="text-xs text-muted-foreground">
                  This tests if two nonces have an affine relationship, which allows private key recovery.
                </div>
              </div>

              <div className="space-y-3">
                <Label>Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedAffineParams.map((preset, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setAffineConfig(prev => ({ ...prev, a: preset.a, b: preset.b }))}
                      className="justify-start text-sm"
                    >
                      {preset.name}: {preset.a}, {preset.b}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAffineAttack}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
              >
                <Zap className="h-4 w-4 mr-2" />
                Execute Affine Attack
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="fault" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fault-count">Number of Faults</Label>
                  <Input
                    id="fault-count"
                    type="number"
                    min="1"
                    max="20"
                    value={faultConfig.faultCount}
                    onChange={(e) => setFaultConfig(prev => ({ 
                      ...prev, 
                      faultCount: parseInt(e.target.value) || 5 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fault Type</Label>
                  <Select 
                    value={faultConfig.faultType}
                    onValueChange={(value) => setFaultConfig(prev => ({ ...prev, faultType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bit_flip">Bit Flip</SelectItem>
                      <SelectItem value="carry_propagation">Carry Propagation</SelectItem>
                      <SelectItem value="scalar_mult">Scalar Multiplication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Component</Label>
                <Select 
                  value={faultConfig.targetComponent}
                  onValueChange={(value) => setFaultConfig(prev => ({ ...prev, targetComponent: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s_computation">S Computation</SelectItem>
                    <SelectItem value="nonce_generation">Nonce Generation</SelectItem>
                    <SelectItem value="point_multiplication">Point Multiplication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Research Simulation Only
                </div>
                <div className="text-xs text-muted-foreground">
                  This simulates the Boneh-DeMillo-Lipton fault injection attack for research purposes.
                  Real attacks require physical access to signing devices.
                </div>
              </div>

              <Button 
                onClick={handleFaultInjectionAttack}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-destructive to-destructive/80"
              >
                <Bug className="h-4 w-4 mr-2" />
                Simulate Fault Injection
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="automated" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-iterations">Test Iterations</Label>
                <Input
                  id="test-iterations"
                  type="number"
                  min="1"
                  max="1000"
                  value={testConfig.iterations}
                  onChange={(e) => setTestConfig(prev => ({ 
                    ...prev, 
                    iterations: parseInt(e.target.value) || 50 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="parallel-tests">Parallel Execution</Label>
                <Switch
                  id="parallel-tests"
                  checked={testConfig.parallelTests}
                  onCheckedChange={(checked) => setTestConfig(prev => ({ 
                    ...prev, 
                    parallelTests: checked 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Test Parameters</Label>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  {testConfig.affineParams.map((param, idx) => (
                    <div key={idx} className="text-sm font-mono">
                      k₂ = {param.a} × k₁ + {param.b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-chart-1/10 text-center">
                  <div className="font-medium">Expected Success Rate</div>
                  <div className="text-chart-1 font-bold">~98%</div>
                </div>
                <div className="p-2 rounded bg-chart-2/10 text-center">
                  <div className="font-medium">Estimated Time</div>
                  <div className="text-chart-2 font-bold">{Math.ceil(testConfig.iterations / 20)}s</div>
                </div>
              </div>

              <Button 
                onClick={handleAutomatedTest}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-chart-1 to-chart-1/80"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Run Automated Tests
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Format</Label>
                <Select 
                  value={rawConfig.format}
                  onValueChange={(value) => setRawConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="hex">Raw Hex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raw-signatures">Signature Data</Label>
                <Textarea
                  id="raw-signatures"
                  placeholder="Paste signature data here (JSON, CSV, or hex format)"
                  value={rawConfig.signatures}
                  onChange={(e) => setRawConfig(prev => ({ ...prev, signatures: e.target.value }))}
                  className="h-32 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData('json')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Sample JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Sample CSV
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-validation">Include Validation</Label>
                <Switch
                  id="include-validation"
                  checked={rawConfig.includeValidation}
                  onCheckedChange={(checked) => setRawConfig(prev => ({ 
                    ...prev, 
                    includeValidation: checked 
                  }))}
                />
              </div>

              <Button 
                onClick={handleRawAnalysis}
                disabled={isRunning || !rawConfig.signatures.trim()}
                className="w-full bg-gradient-to-r from-chart-3 to-chart-3/80"
              >
                <Upload className="h-4 w-4 mr-2" />
                Analyze Raw Signatures
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};