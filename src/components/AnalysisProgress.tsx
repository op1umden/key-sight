import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface AnalysisProgressProps {
  isRunning: boolean;
  progress: number;
  blocksAnalyzed: number;
  totalBlocks: number;
  transactionsProcessed: number;
  signaturesExtracted: number;
  vulnerabilitiesFound: number;
  errors: number;
}

export const AnalysisProgress = ({
  isRunning,
  progress,
  blocksAnalyzed,
  totalBlocks,
  transactionsProcessed,
  signaturesExtracted,
  vulnerabilitiesFound,
  errors
}: AnalysisProgressProps) => {
  return (
    <Card className="border border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          Analysis Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Blocks Analyzed</div>
            <div className="text-2xl font-bold text-foreground">
              {blocksAnalyzed.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">
                / {totalBlocks.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Transactions</div>
            <div className="text-2xl font-bold text-foreground">
              {transactionsProcessed.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Signatures</div>
            <div className="text-2xl font-bold text-primary">
              {signaturesExtracted.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex gap-2 flex-wrap">
              {vulnerabilitiesFound > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {vulnerabilitiesFound} Vulnerabilities
                </Badge>
              )}
              {errors > 0 && (
                <Badge variant="outline" className="text-warning border-warning">
                  {errors} Errors
                </Badge>
              )}
              {!isRunning && vulnerabilitiesFound === 0 && errors === 0 && (
                <Badge variant="outline" className="text-success border-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Clean
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};