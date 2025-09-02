import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertTriangle,
  Download,
  DollarSign,
  Percent
} from "lucide-react";
import { format, startOfWeek, startOfMonth } from "date-fns";

interface Trade {
  id: string;
  created_at: string;
  pair: string;
  result_usd: number;
  pnl_percent: number;
  direction: "buy" | "sell";
}

interface AnalyticsData {
  totalTrades: number;
  totalProfitUSD: number;
  totalProfitPercent: number;
  winRate: number;
  avgRiskReward: number;
  maxDrawdown: number;
}

const Analytics = () => {
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTrades: 0,
    totalProfitUSD: 0,
    totalProfitPercent: 0,
    winRate: 0,
    avgRiskReward: 0,
    maxDrawdown: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTrades(data || []);
      calculateAnalytics(data || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (tradesData: Trade[]) => {
    if (tradesData.length === 0) return;

    const totalTrades = tradesData.length;
    const totalProfitUSD = tradesData.reduce((sum, trade) => sum + trade.result_usd, 0);
    const totalProfitPercent = tradesData.reduce((sum, trade) => sum + trade.pnl_percent, 0);
    const winningTrades = tradesData.filter(trade => trade.result_usd > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    
    // Calculate average risk reward (simplified)
    const avgRiskReward = tradesData.reduce((sum, trade) => sum + Math.abs(trade.pnl_percent), 0) / totalTrades;
    
    // Calculate max drawdown (simplified - running balance)
    let runningBalance = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    tradesData.forEach(trade => {
      runningBalance += trade.result_usd;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = ((peak - runningBalance) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    setAnalytics({
      totalTrades,
      totalProfitUSD,
      totalProfitPercent,
      winRate,
      avgRiskReward,
      maxDrawdown,
    });
  };

  const getProfitByWeek = () => {
    const weeklyData: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      const weekStart = format(startOfWeek(new Date(trade.created_at)), 'MMM dd');
      weeklyData[weekStart] = (weeklyData[weekStart] || 0) + trade.result_usd;
    });

    return Object.entries(weeklyData).map(([week, profit]) => ({
      period: week,
      profit: profit * 15500, // Convert to IDR
    }));
  };

  const getProfitByMonth = () => {
    const monthlyData: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      const monthStart = format(startOfMonth(new Date(trade.created_at)), 'MMM yyyy');
      monthlyData[monthStart] = (monthlyData[monthStart] || 0) + trade.result_usd;
    });

    return Object.entries(monthlyData).map(([month, profit]) => ({
      period: month,
      profit: profit * 15500, // Convert to IDR
    }));
  };

  const getEquityCurve = () => {
    let runningBalance = 0;
    return trades.map(trade => {
      runningBalance += trade.result_usd;
      return {
        date: format(new Date(trade.created_at), 'MMM dd'),
        balance: runningBalance * 15500, // Convert to IDR
      };
    });
  };

  const getProfitByPair = () => {
    const pairData: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      pairData[trade.pair] = (pairData[trade.pair] || 0) + trade.result_usd;
    });

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return Object.entries(pairData).map(([pair, profit], index) => ({
      name: pair,
      value: Math.abs(profit * 15500), // Convert to IDR and use absolute value for pie chart
      color: colors[index % colors.length],
    }));
  };

  const downloadPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF download functionality will be implemented soon.",
    });
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your trading performance metrics</p>
        </div>
        
        <Button onClick={downloadPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{analytics.totalTrades}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L (IDR)</p>
                <p className={`text-2xl font-bold ${analytics.totalProfitUSD >= 0 ? 'text-success' : 'text-loss'}`}>
                  Rp {(analytics.totalProfitUSD * 15500).toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L (%)</p>
                <p className={`text-2xl font-bold ${analytics.totalProfitPercent >= 0 ? 'text-success' : 'text-loss'}`}>
                  {analytics.totalProfitPercent.toFixed(1)}%
                </p>
              </div>
              <Percent className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">{analytics.winRate.toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg RR</p>
                <p className="text-2xl font-bold text-primary">1:{analytics.avgRiskReward.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max DD</p>
                <p className="text-2xl font-bold text-warning">{analytics.maxDrawdown.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit by Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProfitByWeek()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']} />
                <Bar dataKey="profit" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by Pair</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getProfitByPair()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {getProfitByPair().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProfitByMonth()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']} />
                <Bar dataKey="profit" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getEquityCurve()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Balance']} />
                <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;