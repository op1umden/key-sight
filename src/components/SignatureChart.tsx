import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChartData {
  blockNumber: number;
  signatures: number;
  vulnerabilities: number;
  timestamp?: number;
}

interface SignatureChartProps {
  data: ChartData[];
  totalSignatures: number;
  vulnerabilityCount: number;
}

export const SignatureChart = ({ data, totalSignatures, vulnerabilityCount }: SignatureChartProps) => {
  const pieData = [
    { name: 'Secure Signatures', value: totalSignatures - vulnerabilityCount, fill: 'hsl(var(--chart-1))' },
    { name: 'Vulnerable Signatures', value: vulnerabilityCount, fill: 'hsl(var(--chart-5))' },
  ];

  const formatBlockNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Signature Timeline */}
      <Card className="border border-border bg-gradient-to-br from-card to-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Signature Discovery Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="blockNumber" 
                tickFormatter={formatBlockNumber}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))'
                }}
                labelFormatter={(value) => `Block ${formatBlockNumber(value)}`}
              />
              <Line 
                type="monotone" 
                dataKey="signatures" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                name="Signatures Found"
              />
              <Line 
                type="monotone" 
                dataKey="vulnerabilities" 
                stroke="hsl(var(--chart-5))" 
                strokeWidth={2}
                name="Vulnerabilities"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vulnerability Distribution */}
      <Card className="border border-border bg-gradient-to-br from-card to-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-chart-2" />
            Security Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                <Badge variant="outline" className="text-success border-success">
                  {(totalSignatures - vulnerabilityCount).toLocaleString()} Secure
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-5"></div>
                <Badge variant="destructive">
                  {vulnerabilityCount.toLocaleString()} Vulnerable
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Analysis Distribution */}
      <Card className="border border-border bg-gradient-to-br from-card to-card/90 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-chart-3" />
            Signatures per Block Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="blockNumber" 
                tickFormatter={formatBlockNumber}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))'
                }}
                labelFormatter={(value) => `Block ${formatBlockNumber(value)}`}
              />
              <Bar dataKey="signatures" fill="hsl(var(--chart-1))" name="Total Signatures" />
              <Bar dataKey="vulnerabilities" fill="hsl(var(--chart-5))" name="Vulnerabilities" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};