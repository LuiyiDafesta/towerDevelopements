import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Properties from "./pages/Properties.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminProperties from "./pages/admin/Properties.tsx";
import AdminNeighborhoods from "./pages/admin/Neighborhoods.tsx";
import PropertyForm from "./pages/admin/PropertyForm.tsx";
import LeadCapture from "./components/LeadCapture.tsx";
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => {
  const [showLanding, setShowLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const isCaptured = localStorage.getItem("lead_captured");
    setShowLanding(isCaptured !== "true");
  }, []);

  if (showLanding === null) return null; // Prevent flicker

  if (showLanding) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LeadCapture onComplete={() => setShowLanding(false)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WhatsAppButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/propiedades/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="propiedades" element={<AdminProperties />} />
              <Route path="propiedades/nueva" element={<PropertyForm />} />
              <Route path="propiedades/:id" element={<PropertyForm />} />
              <Route path="barrios" element={<AdminNeighborhoods />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
