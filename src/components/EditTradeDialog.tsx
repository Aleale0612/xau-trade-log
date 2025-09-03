import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

interface Trade {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  sl: number | null;
  tp: number | null;
  lot_size: number;
  notes: string | null;
  emotional_psychology: string | null;
}

interface EditTradeDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeUpdated: () => void;
}

const EditTradeDialog: React.FC<EditTradeDialogProps> = ({
  trade,
  open, 
  onOpenChange,
  onTradeUpdated
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    pair: "",
    direction: "buy" as "buy" | "sell",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    lotSize: "",
    notes: "",
    emotionalPsychology: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trade) {
      setFormData({
        pair: trade.pair,
        direction: trade.direction,
        entryPrice: trade.entry_price.toString(),
        exitPrice: trade.exit_price.toString(),
        stopLoss: trade.sl?.toString() || "",
        takeProfit: trade.tp?.toString() || "",
        lotSize: trade.lot_size.toString(),
        notes: trade.notes || "",
        emotionalPsychology: trade.emotional_psychology || "",
      });
    }
  }, [trade]);

  const calculatePNL = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const lotSize = parseFloat(formData.lotSize);
    
    if (!entry || !exit || !lotSize) return { pnlUSD: 0, pnlIDR: 0, pnlPercent: 0 };

    // XAUUSD contract size is 100 oz
    const contractSize = 100;
    const pipSize = 0.01;
    
    let pnlUSD = 0;
    if (formData.direction === "buy") {
      pnlUSD = (exit - entry) * lotSize * contractSize;
    } else {
      pnlUSD = (entry - exit) * lotSize * contractSize;
    }
    
    const pnlIDR = pnlUSD * 15500; // Convert to IDR
    const pnlPercent = (pnlUSD / (entry * lotSize * contractSize)) * 100;
    
    return { pnlUSD, pnlIDR, pnlPercent };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trade) return;
    
    if (!formData.entryPrice || !formData.exitPrice || !formData.lotSize) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.stopLoss && formData.takeProfit && !validateInputs()) {
      toast({
        title: "Invalid Input",
        description: formData.direction === "buy" 
          ? "For Buy orders: SL < Entry < TP" 
          : "For Sell orders: TP < Entry < SL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { pnlUSD, pnlIDR, pnlPercent } = calculatePNL();
      
      const { error } = await supabase
        .from("trades")
        .update({
          pair: formData.pair,
          direction: formData.direction,
          entry_price: parseFloat(formData.entryPrice),
          exit_price: parseFloat(formData.exitPrice),
          sl: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
          tp: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
          lot_size: parseFloat(formData.lotSize),
          result_usd: pnlUSD,
          pnl_idr: pnlIDR,
          pnl_percent: pnlPercent,
          notes: formData.notes || null,
          emotional_psychology: formData.emotionalPsychology || null,
        })
        .eq("id", trade.id);

      if (error) throw error;

      toast({
        title: "Trade Updated",
        description: "Your trade has been successfully updated.",
      });

      onTradeUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating trade:", error);
      toast({
        title: "Error",
        description: "Failed to update trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pair">Pair</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange("entryPrice", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={formData.exitPrice}
                onChange={(e) => handleInputChange("exitPrice", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.01"
                value={formData.stopLoss}
                onChange={(e) => handleInputChange("stopLoss", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                step="0.01"
                value={formData.takeProfit}
                onChange={(e) => handleInputChange("takeProfit", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lotSize">Lot Size</Label>
            <Input
              id="lotSize"
              type="number"
              step="0.01"
              value={formData.lotSize}
              onChange={(e) => handleInputChange("lotSize", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotionalPsychology">Emotional Psychology</Label>
            <Select value={formData.emotionalPsychology} onValueChange={(value) => handleInputChange("emotionalPsychology", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select psychology state" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Trade analysis, market conditions, etc..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTradeDialog;