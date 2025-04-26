
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RecoveryCard from "@/components/dashboard/RecoveryCard";
import StrainChart from "@/components/dashboard/StrainChart";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
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

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Daily Insights</h1>
            <p className="text-lg text-whoop-white/70">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RecoveryCard 
              recovery={todayData?.recovery} 
              zone={todayData?.recoveryZone} 
              strainTarget={todayData?.strainTarget}
            />
          </div>
          <div className="lg:col-span-2">
            <WeeklyOverview data={weeklyData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-blue/20 rounded-lg shadow-sm">
            <HrvTimeline data={weeklyData} />
          </div>
          <div className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-blue/20 rounded-lg shadow-sm">
            <StrainChart data={weeklyData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-sleep-blue/20 rounded-lg shadow-sm">
            <SleepConsistency sleepData={sleepData} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
