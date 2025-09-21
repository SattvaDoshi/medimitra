import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/ui/splash-screen";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import '@/i18n';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Consultation from "./pages/Consultation";
import HealthRecords from "./pages/HealthRecords";
import MedicineFinder from "./pages/MedicineFinder";
import HospitalFinder from "./pages/HospitalFinder";
import AISymptomChecker from "./pages/AISymptomChecker";
import AppointmentBooking from "./pages/AppointmentBooking";
import PharmacyLocator from "./pages/PharmacyLocator";
import PriceComparison from "./pages/PriceComparison";
import LabTests from "./pages/LabTests";
import GovtSchemes from "./pages/GovtSchemes";
import CommunityHealth from "./pages/CommunityHealth";
import FarmerMode from "./pages/FarmerMode";
import EmergencyServices from "./pages/EmergencyServices";
import VoiceAssistant from "./pages/VoiceAssistant";
import VoiceAssistantTest from "./pages/VoiceAssistantTest";
import OfflineMaps from "./pages/OfflineMaps";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          
          <div className={showSplash ? 'opacity-0' : 'opacity-100 animate-fade-in'}>
            <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/medicine" element={<MedicineFinder />} />
      <Route 
        path="/hospital-finder" 
        element={<HospitalFinder />} 
      />
      <Route 
        path="/ai-symptom-checker" 
        element={<AISymptomChecker />} 
      />
      <Route 
        path="/appointment-booking" 
        element={<AppointmentBooking />} 
      />
      <Route 
        path="/pharmacy-locator" 
        element={<PharmacyLocator />} 
      />
      <Route 
        path="/price-comparison" 
        element={<PriceComparison />} 
      />
      <Route 
        path="/lab-tests" 
        element={<LabTests />} 
      />
      <Route 
        path="/govt-schemes" 
        element={<GovtSchemes />} 
      />
      <Route 
        path="/community-health" 
        element={<CommunityHealth />} 
      />
      <Route 
        path="/farmer-mode" 
        element={<FarmerMode />} 
      />
      <Route 
        path="/emergency-services" 
        element={<EmergencyServices />} 
      />
      <Route 
        path="/voice-assistant" 
        element={<VoiceAssistant />} 
      />
      <Route 
        path="/voice-assistant-test" 
        element={<VoiceAssistantTest />} 
      />
      <Route 
        path="/offline-maps" 
        element={<OfflineMaps />} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
            </BrowserRouter>
          </div>
          <PWAInstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
