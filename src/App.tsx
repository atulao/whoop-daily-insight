import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhoopAuthProvider } from "@/contexts/WhoopAuthContext";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const Index = lazy(() => import("./pages/Index"));
const Sleep = lazy(() => import("./pages/Sleep"));
const Strain = lazy(() => import("./pages/Strain"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Connect = lazy(() => import("./pages/Connect"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <MainLayout>
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-whoop-teal" />
    </div>
  </MainLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WhoopAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/strain" element={<Strain />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WhoopAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
