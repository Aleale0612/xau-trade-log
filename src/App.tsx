import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import AddTrade from "./pages/AddTrade";
import TradeHistory from "./pages/TradeHistory";
import Analytics from "./pages/Analytics";
import TradingMentor from "./pages/TradingMentor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background theme-transition">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Navigate to="/add-trade" replace />} />
                <Route 
                  path="/add-trade" 
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <main className="container mx-auto px-4 py-8">
                        <AddTrade />
                      </main>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <main className="container mx-auto px-4 py-8">
                        <TradeHistory />
                      </main>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <main className="container mx-auto px-4 py-8">
                        <Analytics />
                      </main>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mentor" 
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <TradingMentor />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
