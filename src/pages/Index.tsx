
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import MyDay from "@/components/dashboard/MyDay";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import StrainChart from "@/components/dashboard/StrainChart";
import HrvTimeline from "@/components/dashboard/HrvTimeline";
import { whoopService } from "@/services/whoopService";
import { useWhoopAuth } from "@/contexts/WhoopAuthContext";
import { Zap } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated } = useWhoopAuth();
  const navigate = useNavigate();

  const { data: recoveryData, isLoading: loadingRecovery } = useQuery({
    queryKey: ["whoopRecovery7"],
    queryFn: () => whoopService.getRecovery(7),
    enabled: isAuthenticated,
  });

  const { data: strainData, isLoading: loadingStrain } = useQuery({
    queryKey: ["whoopStrain7"],
    queryFn: () => whoopService.getStrain(7),
    enabled: isAuthenticated,
  });

  const { data: sleepData, isLoading: loadingSleep } = useQuery({
    queryKey: ["whoopSleep7"],
    queryFn: () => whoopService.getSleep(7),
    enabled: isAuthenticated,
  });

  const loading = isAuthenticated && (loadingRecovery || loadingStrain || loadingSleep);

  // Not authenticated — show connect prompt
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="h-20 w-20 rounded-full border-2 border-border flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-foreground">Connect Your WHOOP</h2>
            <p className="text-muted-foreground">
              Link your WHOOP account to see your real strain, recovery, and sleep data here.
            </p>
            <button
              onClick={() => navigate('/connect')}
              className="bg-primary text-primary-foreground rounded-xl py-3 px-8 font-semibold text-sm uppercase tracking-whoop hover:brightness-110 transition-all duration-200"
            >
              Connect Now
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-pulse-glow w-16 h-16 bg-primary rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-foreground mb-2">Loading your insights...</h2>
            <p className="text-muted-foreground">Fetching live data from WHOOP</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const latestRecovery = recoveryData?.[recoveryData.length - 1];
  const latestStrain = strainData?.[strainData.length - 1];
  const latestSleep = sleepData?.[sleepData.length - 1];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <h1 className="text-2xl font-bold uppercase tracking-whoop text-foreground mb-1">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DailyOverview 
                latestRecovery={latestRecovery}
                latestStrain={latestStrain}
                latestSleep={latestSleep}
              />
            </div>
            <div>
              <MyDay latestSleep={latestSleep} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrainChart strainData={strainData} recoveryData={recoveryData} />
            <HrvTimeline data={recoveryData?.map(day => ({
              date: day.date,
              hrv: day.hrvMs
            })) || []} />
          </div>

          <WeeklyOverview recoveryData={recoveryData} strainData={strainData} sleepData={sleepData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
