import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Download, 
  Upload, 
  FileText, 
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResearchDataPanelProps {
  onDatasetGenerate: (config: DatasetConfig) => void;
  onFileAnalyze: (file: File) => void;
  isGenerating: boolean;
  generationProgress: number;
}

export interface DatasetConfig {
  vulnerablePairs: number;
  safeSignatures: number;
  affineVariety: number;
  format: string;
  includeMetadata: boolean;
}

export const ResearchDataPanel = ({ 
  onDatasetGenerate, 
  onFileAnalyze, 
  isGenerating, 
  generationProgress 
}: ResearchDataPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  
  const [datasetConfig, setDatasetConfig] = useState<DatasetConfig>({
    vulnerablePairs: 100,
    safeSignatures: 500,
    affineVariety: 10,
    format: 'json',
    includeMetadata: true
  });

  const [exportConfig, setExportConfig] = useState({
    includeSignatures: true,
    includeVulnerabilities: true,
    includeStatistics: true,
    format: 'json'
  });

  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB",
        });
        return;
      }

      const allowedTypes = [
        'application/json',
        'text/csv',
        'text/plain',
        'application/vnd.ms-excel'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a JSON, CSV, or text file",
        });
        return;
      }

      onFileAnalyze(file);
      toast({
        title: "File uploaded",
        description: `Processing ${file.name} for signature analysis`,
      });
    }
  };

  const handleGenerateDataset = () => {
    if (datasetConfig.vulnerablePairs < 1 || datasetConfig.safeSignatures < 1) {
      toast({
        variant: "destructive",
        title: "Invalid configuration",
        description: "Please specify at least 1 vulnerable pair and 1 safe signature",
      });
      return;
    }

    const totalSignatures = datasetConfig.vulnerablePairs * 2 + datasetConfig.safeSignatures;
    if (totalSignatures > 10000) {
      toast({
        variant: "destructive",
        title: "Dataset too large",
        description: "Please reduce the total number of signatures (current: " + totalSignatures.toLocaleString() + ")",
      });
      return;
    }

    onDatasetGenerate(datasetConfig);
    toast({
      title: "Generating research dataset",
      description: `Creating ${totalSignatures.toLocaleString()} signatures with ${datasetConfig.vulnerablePairs} vulnerable pairs`,
    });
  };

  const downloadSampleData = (type: string) => {
    const sampleData = {
      vulnerable_signatures: {
        json: JSON.stringify({
          metadata: {
            generation_time: Date.now(),
            vulnerable_pairs: 2,
            affine_parameters: [[2, 1], [3, 5]]
          },
          vulnerable_signatures: [
            {
              pair_id: 1,
              private_key: "0x1234567890abcdef1234567890abcdef12345678",
              affine_params: [2, 1],
              signatures: [
                {
                  r: "0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41",
                  s: "0x181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d09",
                  z: "0x7a05c6145f10101e9d6325494245adf1297d80f8f38d4d576d57cdba220bcb19",
                  nonce: "0xa1b2c3d4e5f6789012345678901234567890abcd"
                }
              ]
            }
          ]
        }, null, 2),
        csv: `pair_id,private_key,affine_a,affine_b,sig1_r,sig1_s,sig1_z,sig1_nonce
1,0x1234567890abcdef1234567890abcdef12345678,2,1,0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41,0x181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d09,0x7a05c6145f10101e9d6325494245adf1297d80f8f38d4d576d57cdba220bcb19,0xa1b2c3d4e5f6789012345678901234567890abcd`
      },
      analysis_results: {
        json: JSON.stringify({
          analysis_metadata: {
            blocks_analyzed: 1000,
            transactions_processed: 25000,
            signatures_extracted: 45000,
            analysis_duration: 125.5,
            r_value_reuse_count: 3
          },
          vulnerabilities: [
            {
              type: "r_value_reuse",
              severity: "critical",
              r_value: "0x4e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd41",
              recovered_keys: ["0x1234567890abcdef1234567890abcdef12345678"],
              signature_count: 2
            }
          ]
        }, null, 2)
      }
    };

    const content = sampleData[type as keyof typeof sampleData];
    const format = type.includes('json') ? 'json' : 'csv';
    const filename = `sample_${type.replace('_', '-')}.${format}`;
    
    const blob = new Blob([content[format as keyof typeof content]], { type: `application/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sample data downloaded",
      description: `Downloaded ${filename} with sample ${type.replace('_', ' ')}`,
    });
  };

  return (
    <Card className="border border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Research Data Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Dataset</TabsTrigger>
            <TabsTrigger value="import">Import & Analyze</TabsTrigger>
            <TabsTrigger value="export">Export Results</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vulnerable-pairs">Vulnerable Pairs</Label>
                  <Input
                    id="vulnerable-pairs"
                    type="number"
                    min="1"
                    max="1000"
                    value={datasetConfig.vulnerablePairs}
                    onChange={(e) => setDatasetConfig(prev => ({ 
                      ...prev, 
                      vulnerablePairs: parseInt(e.target.value) || 100 
                    }))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Each pair creates 2 signatures with affine nonce relationships
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safe-signatures">Safe Signatures</Label>
                  <Input
                    id="safe-signatures"
                    type="number"
                    min="1"
                    max="5000"
                    value={datasetConfig.safeSignatures}
                    onChange={(e) => setDatasetConfig(prev => ({ 
                      ...prev, 
                      safeSignatures: parseInt(e.target.value) || 500 
                    }))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Signatures with random, secure nonces
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affine-variety">Affine Parameter Sets</Label>
                  <Input
                    id="affine-variety"
                    type="number"
                    min="1"
                    max="50"
                    value={datasetConfig.affineVariety}
                    onChange={(e) => setDatasetConfig(prev => ({ 
                      ...prev, 
                      affineVariety: parseInt(e.target.value) || 10 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select 
                    value={datasetConfig.format}
                    onValueChange={(value) => setDatasetConfig(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="both">Both JSON & CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Dataset Summary</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Signatures:</div>
                    <div className="font-medium">
                      {(datasetConfig.vulnerablePairs * 2 + datasetConfig.safeSignatures).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vulnerability Rate:</div>
                    <div className="font-medium">
                      {((datasetConfig.vulnerablePairs * 2) / (datasetConfig.vulnerablePairs * 2 + datasetConfig.safeSignatures) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Generating dataset...</span>
                    <span className="text-sm font-medium">{generationProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleGenerateDataset}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Generate Research Dataset
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Signature Data</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Drag and drop a file here, or click to browse
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">
                    Supported: JSON, CSV, TXT (max 10MB)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sample Data</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleData('vulnerable_signatures')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Vulnerable Signatures
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleData('analysis_results')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Analysis Results
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <div className="text-sm font-medium text-info mb-1">
                  Supported File Formats
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• JSON: Full signature objects with metadata</div>
                  <div>• CSV: Tabular signature data (r, s, z values)</div>
                  <div>• TXT: Raw hex-encoded signatures</div>
                </div>
              </div>

              {analysisResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Analysis Results</Label>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <div>Files processed: {analysisResults.length}</div>
                    <div>Last analysis: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Export Configuration</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include signatures</span>
                    <input
                      type="checkbox"
                      checked={exportConfig.includeSignatures}
                      onChange={(e) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeSignatures: e.target.checked 
                      }))}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include vulnerabilities</span>
                    <input
                      type="checkbox"
                      checked={exportConfig.includeVulnerabilities}
                      onChange={(e) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeVulnerabilities: e.target.checked 
                      }))}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include statistics</span>
                    <input
                      type="checkbox"
                      checked={exportConfig.includeStatistics}
                      onChange={(e) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeStatistics: e.target.checked 
                      }))}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select 
                  value={exportConfig.format}
                  onValueChange={(value) => setExportConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Chart Data
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Export Contents</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {exportConfig.includeSignatures && <div>• Signature data and metadata</div>}
                  {exportConfig.includeVulnerabilities && <div>• Vulnerability details and recovered keys</div>}
                  {exportConfig.includeStatistics && <div>• Performance metrics and statistics</div>}
                  <div>• Analysis configuration and parameters</div>
                  <div>• Timestamp and version information</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};