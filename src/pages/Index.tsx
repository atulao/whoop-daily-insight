
import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import MyDay from "@/components/dashboard/MyDay";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import StrainChart from "@/components/dashboard/StrainChart";
import HrvTimeline from "@/components/dashboard/HrvTimeline";
import { whoopService } from "@/services/whoopService";
import { useWhoopAuth } from "@/contexts/WhoopAuthContext";
import { generateMockRecovery, generateMockStrain, generateMockSleep } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { isAuthenticated } = useWhoopAuth();

  // Mock data (stable references via useMemo)
  const mockRecovery = React.useMemo(() => generateMockRecovery(7), []);
  const mockStrain = React.useMemo(() => generateMockStrain(7), []);
  const mockSleep = React.useMemo(() => generateMockSleep(7), []);

  // Live API queries — only enabled when authenticated
  const { data: liveRecovery, isLoading: loadingRecovery } = useQuery({
    queryKey: ["whoopRecovery7"],
    queryFn: () => whoopService.getRecovery(7),
    enabled: isAuthenticated,
  });

  const { data: liveStrain, isLoading: loadingStrain } = useQuery({
    queryKey: ["whoopStrain7"],
    queryFn: () => whoopService.getStrain(7),
    enabled: isAuthenticated,
  });

  const { data: liveSleep, isLoading: loadingSleep } = useQuery({
    queryKey: ["whoopSleep7"],
    queryFn: () => whoopService.getSleep(7),
    enabled: isAuthenticated,
  });

  const loading = isAuthenticated && (loadingRecovery || loadingStrain || loadingSleep);

  // Use live data when authenticated, otherwise use mock data
  const recoveryData = isAuthenticated ? liveRecovery : mockRecovery;
  const strainData = isAuthenticated ? liveStrain : mockStrain;
  const sleepData = isAuthenticated ? liveSleep : mockSleep;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-pulse-glow w-16 h-16 bg-whoop-teal rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Loading your insights...</h2>
            <p className="text-whoop-white/70">Fetching live data from WHOOP</p>
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white">Overview</h1>
            {!isAuthenticated && (
              <Badge variant="secondary" className="text-xs">
                Demo Data
              </Badge>
            )}
          </div>
          <p className="text-sm text-whoop-white/70">
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
