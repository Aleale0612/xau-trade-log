import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

const AddTrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    pair: "XAUUSD",
    direction: "buy" as "buy" | "sell",
    entryPrice: "",
    exitPrice: "",
    lotSize: "",
    riskPercent: "",
    notes: "",
  });

  const [calculations, setCalculations] = useState({
    profitLossIDR: 0,
    profitLossPercent: 0,
    riskReward: 0,
  });

  const calculateResults = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const lots = parseFloat(formData.lotSize);
    const risk = parseFloat(formData.riskPercent);

    if (!entry || !exit || !lots) return;

    // XAUUSD contract size is typically 100 oz
    const contractSize = 100;
    const pipSize = 0.01;
    
    // Calculate pip difference
    let pipDifference = formData.direction === "buy" ? (exit - entry) : (entry - exit);
    pipDifference = pipDifference / pipSize;
    
    // Calculate P&L in USD
    const profitLossUSD = pipDifference * pipSize * lots * contractSize;
    
    // Convert to IDR (assuming 1 USD = 15,500 IDR - you can make this dynamic)
    const usdToIdr = 15500;
    const profitLossIDR = profitLossUSD * usdToIdr;
    
    // Calculate percentage (assuming account balance - you can make this dynamic)
    const accountBalance = 10000; // Default account balance in USD
    const profitLossPercent = (profitLossUSD / accountBalance) * 100;
    
    // Calculate risk reward ratio
    const riskReward = risk > 0 ? Math.abs(profitLossPercent / risk) : 0;

    setCalculations({
      profitLossIDR: profitLossIDR,
      profitLossPercent: profitLossPercent,
      riskReward: riskReward,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entryPrice || !formData.exitPrice || !formData.lotSize) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    calculateResults();

    try {
      const { error } = await supabase.from("trades").insert({
        pair: formData.pair,
        direction: formData.direction,
        entry_price: parseFloat(formData.entryPrice),
        exit_price: parseFloat(formData.exitPrice),
        lot_size: parseFloat(formData.lotSize),
        contract_size: 100, // XAUUSD standard
        result_usd: calculations.profitLossIDR / 15500,
        pnl_percent: calculations.profitLossPercent,
        risk_reward: calculations.riskReward,
        risk_percent: parseFloat(formData.riskPercent) || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Trade Added",
        description: "Your trade has been successfully recorded.",
      });

      navigate("/history");
    } catch (error) {
      console.error("Error adding trade:", error);
      toast({
        title: "Error",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Recalculate when key fields change
  React.useEffect(() => {
    if (formData.entryPrice && formData.exitPrice && formData.lotSize) {
      calculateResults();
    }
  }, [formData.entryPrice, formData.exitPrice, formData.lotSize, formData.direction]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Add New Trade</h1>
        <p className="text-muted-foreground mt-2">Record your XAUUSD trading performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              Trade Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pair">Trading Pair</Label>
              <Select value={formData.pair} onValueChange={(value) => handleInputChange("pair", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XAUUSD">XAU/USD (Gold)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={formData.direction} onValueChange={(value) => handleInputChange("direction", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  placeholder="2050.00"
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange("entryPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  placeholder="2055.00"
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange("exitPrice", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.10"
                  value={formData.lotSize}
                  onChange={(e) => handleInputChange("lotSize", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskPercent">Risk %</Label>
                <Input
                  id="riskPercent"
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  value={formData.riskPercent}
                  onChange={(e) => handleInputChange("riskPercent", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Trade analysis, market conditions, etc..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-success" />
              Calculated Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span className="font-medium">P&L (IDR)</span>
                <span className={`font-bold ${calculations.profitLossIDR >= 0 ? 'text-success' : 'text-loss'}`}>
                  Rp {calculations.profitLossIDR.toLocaleString('id-ID')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span className="font-medium">P&L (%)</span>
                <span className={`font-bold ${calculations.profitLossPercent >= 0 ? 'text-success' : 'text-loss'}`}>
                  {calculations.profitLossPercent.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span className="font-medium">Risk Reward</span>
                <span className="font-bold text-primary">
                  1:{calculations.riskReward.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-center">
        <Button type="submit" size="lg" className="min-w-[200px]">
          <TrendingUp className="w-4 h-4 mr-2" />
          Add Trade
        </Button>
      </form>
    </div>
  );
};

export default AddTrade;