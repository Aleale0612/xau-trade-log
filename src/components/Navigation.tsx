import { Link, useLocation } from "react-router-dom";
import { Plus, History, TrendingUp, LogOut, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    {
      name: "Add Trade",
      path: "/add-trade",
      icon: Plus,
    },
    {
      name: "Trade History", 
      path: "/history",
      icon: History,
    },
    {
      name: "Analytics",
      path: "/analytics", 
      icon: TrendingUp,
    },
    {
      name: "Trading Mentor",
      path: "/mentor",
      icon: Brain,
    },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-trading-light bg-clip-text text-transparent">
              JournalPapers
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden sm:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 theme-transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Navigation */}
            <nav className="flex sm:hidden space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center p-2 rounded-lg text-sm font-medium transition-all duration-200 theme-transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                    title={item.name}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};