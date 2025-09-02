import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, TrendingUp, DollarSign, Target } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-trading-light bg-clip-text text-transparent">
          JournalPapers
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional trading journal for XAUUSD (Gold) trades. Track your performance, analyze your results, and improve your trading strategy.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/add-trade">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary theme-transition group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Add New Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Record your XAUUSD trades with automatic P&L calculations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/history">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary theme-transition group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <History className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                View, edit, and manage all your trading history
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary theme-transition group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Detailed performance metrics and trading analytics
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-card to-card/50 rounded-lg p-8 border border-border/30 theme-transition shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <DollarSign className="w-8 h-8 text-success mx-auto" />
            <h3 className="font-semibold">Auto P&L Calculation</h3>
            <p className="text-sm text-muted-foreground">Automatic profit/loss calculation in IDR and percentage</p>
          </div>
          
          <div className="text-center space-y-2">
            <Target className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Risk Management</h3>
            <p className="text-sm text-muted-foreground">Track your risk percentage and reward ratios</p>
          </div>
          
          <div className="text-center space-y-2">
            <TrendingUp className="w-8 h-8 text-success mx-auto" />
            <h3 className="font-semibold">Performance Analytics</h3>
            <p className="text-sm text-muted-foreground">Comprehensive charts and trading metrics</p>
          </div>
          
          <div className="text-center space-y-2">
            <History className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Trade History</h3>
            <p className="text-sm text-muted-foreground">Complete record of all your trading activities</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/add-trade">
          <Button size="lg" className="bg-gradient-to-r from-primary to-trading-light hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Start Trading Journal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
