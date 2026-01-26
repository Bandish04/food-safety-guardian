import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyChecks from "./pages/DailyChecks";
import HACCP from "./pages/HACCP";
import Violations from "./pages/Violations";
import Audits from "./pages/Audits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-checks"
              element={
                <ProtectedRoute>
                  <DailyChecks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/haccp"
              element={
                <ProtectedRoute>
                  <HACCP />
                </ProtectedRoute>
              }
            />
            <Route
              path="/violations"
              element={
                <ProtectedRoute>
                  <Violations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audits"
              element={
                <ProtectedRoute>
                  <Audits />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
