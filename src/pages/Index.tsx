
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import MyDay from "@/components/dashboard/MyDay";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import StrainChart from "@/components/dashboard/StrainChart";
import HrvTimeline from "@/components/dashboard/HrvTimeline";
import { getTodayData, generateWeeklyData, generateSleepData } from "@/services/mockData";

const Dashboard = () => {
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodayData(getTodayData());
      setWeeklyData(generateWeeklyData());
      setSleepData(generateSleepData());
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-pulse-glow w-16 h-16 bg-whoop-teal rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Loading your insights...</h2>
            <p className="text-whoop-white/70">Analyzing your recovery and performance data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Use the mock data for display
  const recoveryData = weeklyData.filter(data => data.type === 'recovery');
  const strainData = weeklyData.filter(data => data.type === 'strain');
  
  const latestRecovery = recoveryData?.[recoveryData.length - 1];
  const latestStrain = strainData?.[strainData.length - 1];
  const latestSleep = sleepData?.[sleepData.length - 1];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <h1 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Overview</h1>
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
