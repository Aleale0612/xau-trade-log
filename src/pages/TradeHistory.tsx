import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import EditTradeDialog from "@/components/EditTradeDialog";

interface Trade {
  id: string;
  created_at: string;
  pair: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  sl: number | null;
  tp: number | null;
  lot_size: number;
  result_usd: number;
  pnl_idr: number;
  pnl_percent: number;
  risk_reward: number | null;
  notes: string | null;
  emotional_psychology: string | null;
}

const TradeHistory = () => {
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
      toast({
        title: "Error",
        description: "Failed to load trades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      
      if (error) throw error;
      
      setTrades(trades.filter(trade => trade.id !== id));
      toast({
        title: "Trade Deleted",
        description: "The trade has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast({
        title: "Error", 
        description: "Failed to delete trade.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsEditDialogOpen(true);
  };

  const handleTradeUpdated = () => {
    fetchTrades();
  };

  const filteredTrades = trades.filter(trade => 
    trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTrades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trade History</h1>
          <p className="text-muted-foreground">Track your trading performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Card className="theme-transition shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            All Trades ({filteredTrades.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trades found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>SL</TableHead>
                    <TableHead>TP</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>RR</TableHead>
                    <TableHead>P&L (IDR)</TableHead>
                    <TableHead>Psychology</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">
                        {format(new Date(trade.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{trade.pair}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.direction === "buy" ? "default" : "secondary"}>
                          {trade.direction === "buy" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${trade.entry_price}</TableCell>
                      <TableCell className="text-loss">${trade.sl || "-"}</TableCell>
                      <TableCell className="text-success">${trade.tp || "-"}</TableCell>
                      <TableCell>${trade.exit_price}</TableCell>
                      <TableCell>{trade.lot_size}</TableCell>
                      <TableCell className="text-primary">
                        {trade.risk_reward ? `1:${trade.risk_reward.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className={trade.pnl_idr >= 0 ? "text-success" : "text-loss"}>
                        {formatCurrency(trade.pnl_idr)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {trade.emotional_psychology || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {trade.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="theme-transition hover:bg-primary/10"
                            onClick={() => handleEditTrade(trade)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="theme-transition hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this trade? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteTrade(trade.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTradeDialog
        trade={editingTrade}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTradeUpdated={handleTradeUpdated}
      />
    </div>
  );
};

export default TradeHistory;