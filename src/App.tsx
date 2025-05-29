import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Templates from "./pages/Templates";
import Contacts from "./pages/Contacts";
import ContactListPage from "./pages/ContactListPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditTemplatePage from "./pages/templates/EditTemplatePage";
import NewCampaignPage from "./pages/campaigns/NewCampaignPage";
import { useState } from "react";
import { AuthProvider, useAuthContext } from "./components/auth/AuthContext";
import { AuthDebug } from "./components/auth/AuthDebug";
import { Loader2 } from "lucide-react";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuthContext();
  
  // Show loading indicator while authentication state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        <span className="ml-2 text-lg text-brand-accent">Loading...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Create a client inside the function component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
                <Route path="/campaigns/new" element={<ProtectedRoute><NewCampaignPage /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                <Route path="/templates/:id/edit" element={<ProtectedRoute><EditTemplatePage /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                <Route path="/contact-lists/:id" element={<ProtectedRoute><ContactListPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            
            {/* Debug component - remove in production */}
            {process.env.NODE_ENV !== 'production' && <AuthDebug />}
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
