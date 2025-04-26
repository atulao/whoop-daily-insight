import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import MyDay from "@/components/dashboard/MyDay";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import StrainChart from "@/components/dashboard/StrainChart";
import HrvTimeline from "@/components/dashboard/HrvTimeline";
import { whoopService } from "@/services/whoopService";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["whoopProfile"],
    queryFn: () => whoopService.getProfile(),
  });

  const { data: recoveryData, isLoading: isLoadingRecovery } = useQuery({
    queryKey: ["whoopRecovery"],
    queryFn: () => whoopService.getRecovery(7),
    enabled: !!profileData,
  });

  const { data: strainData, isLoading: isLoadingStrain } = useQuery({
    queryKey: ["whoopStrain"],
    queryFn: () => whoopService.getStrain(7),
    enabled: !!profileData,
  });

  const { data: sleepData, isLoading: isLoadingSleep } = useQuery({
    queryKey: ["whoopSleep"],
    queryFn: () => whoopService.getSleep(7),
    enabled: !!profileData,
  });

  const isLoading = isLoadingProfile || isLoadingRecovery || isLoadingStrain || isLoadingSleep;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-whoop-teal mx-auto mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Loading your insights...</h2>
            <p className="text-whoop-white/70">Analyzing your recovery and performance data</p>
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
          <h1 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">
            Overview {profileData?.first_name ? `- ${profileData.first_name}` : ''}
          </h1>
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
            <HrvTimeline data={recoveryData} />
          </div>

          <WeeklyOverview recoveryData={recoveryData} strainData={strainData} sleepData={sleepData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

