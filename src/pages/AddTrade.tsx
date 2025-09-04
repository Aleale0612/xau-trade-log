import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";

const AddTrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    pair: "XAUUSD",
    direction: "buy" as "buy" | "sell",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    lotSize: "",
    riskPercent: "2",
    notes: "",
    emotionalPsychology: "calm",
  });

  const [calculations, setCalculations] = useState({
    profitLossIDR: 0,
    profitLossPercent: 0,
    riskReward: 0,
  });

  const calculateResults = () => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);
    const risk = parseFloat(formData.riskPercent);
    const exit = parseFloat(formData.exitPrice);

    if (!entry || !sl || !tp || !risk) return;

    // XAUUSD contract size is typically 100 oz
    const contractSize = 100;
    const pipSize = 0.01;
    
    // Calculate risk in pips
    const riskPips = Math.abs(entry - sl) / pipSize;
    
    // Calculate reward in pips
    const rewardPips = Math.abs(tp - entry) / pipSize;
    
    // Calculate risk reward ratio
    const riskReward = rewardPips / riskPips;
    
    // Calculate lot size based on risk percentage
    const accountBalance = 10000; // Default account balance in USD
    const riskAmount = (accountBalance * risk) / 100;
    const lotSize = riskAmount / (riskPips * pipSize * contractSize);
    
    // Update lot size in form
    setFormData(prev => ({ ...prev, lotSize: lotSize.toFixed(2) }));

    // Calculate PNL IDR if exit price is provided
    let profitLossIDR = 0;
    let profitLossPercent = 0;
    
    if (exit && entry) {
      let pnlUSD = 0;
      if (formData.direction === "buy") {
        pnlUSD = (exit - entry) * lotSize * contractSize;
      } else {
        pnlUSD = (entry - exit) * lotSize * contractSize;
      }
      profitLossIDR = pnlUSD * 15500; // Convert to IDR
      profitLossPercent = (pnlUSD / (entry * lotSize * contractSize)) * 100;
    }

    setCalculations({
      profitLossIDR,
      profitLossPercent,
      riskReward: riskReward,
    });
  };

  const validateInputs = () => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);

    if (formData.direction === "buy") {
      return sl < entry && entry < tp;
    } else {
      return tp < entry && entry < sl;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entryPrice || !formData.stopLoss || !formData.takeProfit || !formData.lotSize) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateInputs()) {
      toast({
        title: "Invalid Input",
        description: formData.direction === "buy" 
          ? "For Buy orders: SL < Entry < TP" 
          : "For Sell orders: TP < Entry < SL",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate final PNL for insertion
      const exitPrice = parseFloat(formData.exitPrice) || parseFloat(formData.takeProfit);
      const entryPrice = parseFloat(formData.entryPrice);
      const lotSize = parseFloat(formData.lotSize);
      const contractSize = 100;
      
      let resultUSD = 0;
      let pnlPercent = 0;
      let pnlIDR = 0;
      
      if (exitPrice && entryPrice && lotSize) {
        if (formData.direction === "buy") {
          resultUSD = (exitPrice - entryPrice) * lotSize * contractSize;
        } else {
          resultUSD = (entryPrice - exitPrice) * lotSize * contractSize;
        }
        pnlIDR = resultUSD * 15500;
        pnlPercent = (resultUSD / (entryPrice * lotSize * contractSize)) * 100;
      }

      const { error } = await supabase.from("trades").insert({
        pair: formData.pair,
        direction: formData.direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        sl: parseFloat(formData.stopLoss),
        tp: parseFloat(formData.takeProfit),
        lot_size: lotSize,
        contract_size: contractSize,
        result_usd: resultUSD,
        pnl_idr: pnlIDR,
        pnl_percent: pnlPercent,
        risk_reward: calculations.riskReward,
        risk_percent: parseFloat(formData.riskPercent),
        notes: formData.notes || null,
        emotional_psychology: formData.emotionalPsychology,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Trade Added",
        description: "Your trade has been successfully recorded.",
      });

      // Reset form
      setFormData({
        pair: "XAUUSD",
        direction: "buy",
        entryPrice: "",
        exitPrice: "",
        stopLoss: "",
        takeProfit: "",
        lotSize: "",
        riskPercent: "2",
        notes: "",
        emotionalPsychology: "calm",
      });
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
    if (formData.entryPrice && formData.stopLoss && formData.takeProfit && formData.riskPercent) {
      calculateResults();
    }
  }, [formData.entryPrice, formData.exitPrice, formData.stopLoss, formData.takeProfit, formData.riskPercent, formData.direction]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Add New Trade</h1>
        <p className="text-sm text-muted-foreground">Record your XAUUSD trading performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Details - Compact Two Column Layout */}
        <Card className="lg:col-span-2 theme-transition bg-gradient-to-br from-card to-card/50 shadow-lg border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              Trade Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Row - Pair and Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pair" className="text-sm font-medium">Trading Pair</Label>
                <Select value={formData.pair} onValueChange={(value) => handleInputChange("pair", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAUUSD">XAU/USD (Gold)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction" className="text-sm font-medium">Direction</Label>
                <Select value={formData.direction} onValueChange={(value) => handleInputChange("direction", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy (Long)</SelectItem>
                    <SelectItem value="sell">Sell (Short)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row - Entry and Exit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice" className="text-sm font-medium">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  placeholder="2050.00"
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange("entryPrice", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitPrice" className="text-sm font-medium">Exit Price (Optional)</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  placeholder="2055.00"
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange("exitPrice", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Third Row - SL and TP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-sm font-medium">Stop Loss (SL)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  placeholder="2045.00"
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange("stopLoss", e.target.value)}
                  className={`h-9 ${!validateInputs() && formData.entryPrice && formData.stopLoss ? "border-destructive" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeProfit" className="text-sm font-medium">Take Profit (TP)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.01"
                  placeholder="2055.00"
                  value={formData.takeProfit}
                  onChange={(e) => handleInputChange("takeProfit", e.target.value)}
                  className={`h-9 ${!validateInputs() && formData.entryPrice && formData.takeProfit ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            {/* Fourth Row - Lot Size and Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotSize" className="text-sm font-medium">Lot Size (Auto)</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.10"
                  value={formData.lotSize}
                  readOnly
                  className="h-9 bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskPercent" className="text-sm font-medium">Risk %</Label>
                <Input
                  id="riskPercent"
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  value={formData.riskPercent}
                  onChange={(e) => handleInputChange("riskPercent", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Fifth Row - Psychology */}
            <div className="space-y-2">
              <Label htmlFor="emotionalPsychology" className="text-sm font-medium">Emotional Psychology</Label>
              <Select value={formData.emotionalPsychology} onValueChange={(value) => handleInputChange("emotionalPsychology", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="overconfident">Overconfident</SelectItem>
                  <SelectItem value="fearful">Fearful</SelectItem>
                  <SelectItem value="greedy">Greedy</SelectItem>
                  <SelectItem value="disciplined">Disciplined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Trade analysis, market conditions, etc..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Calculated Results - Compact */}
        <Card className="theme-transition bg-gradient-to-br from-card to-card/50 shadow-lg border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Calculator className="w-5 h-5 mr-2 text-success" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50 border border-border/30 theme-transition">
              <span className="text-sm font-medium">Risk Reward</span>
              <span className="text-sm font-bold text-primary">
                1:{calculations.riskReward.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50 border border-border/30 theme-transition">
              <span className="text-sm font-medium">Auto Lot</span>
              <span className="text-sm font-bold text-foreground">
                {formData.lotSize || "0.00"}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50 border border-border/30 theme-transition">
              <span className="text-sm font-medium">PNL (IDR)</span>
              <span className={`text-sm font-bold ${calculations.profitLossIDR >= 0 ? 'text-success' : 'text-loss'}`}>
                Rp {Math.abs(calculations.profitLossIDR).toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="p-2 rounded-lg bg-secondary/20 border border-border/30 theme-transition">
              <div className="text-xs text-muted-foreground mb-1">Validation:</div>
              <div className={`text-xs font-medium ${validateInputs() || (!formData.entryPrice || !formData.stopLoss || !formData.takeProfit) ? 'text-success' : 'text-destructive'}`}>
                {formData.direction === "buy" ? "Buy: SL < Entry < TP" : "Sell: TP < Entry < SL"}
              </div>
              {formData.entryPrice && formData.stopLoss && formData.takeProfit && (
                <div className={`text-xs mt-1 ${validateInputs() ? 'text-success' : 'text-destructive'}`}>
                  {validateInputs() ? "✓ Valid setup" : "✗ Invalid setup"}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="pt-2">
              <Button type="submit" size="sm" className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

     {/* TradingView Chart */}
<Card className="theme-transition bg-gradient-to-br from-card to-card/50 shadow-lg border border-border/50">
  <CardHeader className="pb-4">
    <CardTitle className="flex items-center text-lg">
      <TrendingUp className="w-5 h-5 mr-2 text-primary" />
      Live Chart - TradingView
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0 h-[600px]">
    <TradingViewWidget />
  </CardContent>
</Card>
    </div>
  );
};

export default AddTrade;