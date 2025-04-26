import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import MyDay from "@/components/dashboard/MyDay";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
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
          <DailyOverview 
            recovery={todayData?.recovery || 0}
            strain={todayData?.strain || 0}
            sleepPerformance={89}
            hrv={todayData?.hrv || 0}
          />

          <MyDay 
            sleepDuration="8:15"
            sleepTime="11:58 PM"
            wakeTime="8:38 AM"
          />

          <WeeklyOverview data={weeklyData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
