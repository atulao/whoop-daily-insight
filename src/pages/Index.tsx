
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RecoveryCard from "@/components/dashboard/RecoveryCard";
import StrainChart from "@/components/dashboard/StrainChart";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
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
            <div className="animate-pulse-glow w-16 h-16 bg-whoop-blue rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">Loading your insights...</h2>
            <p className="text-muted-foreground">Analyzing your recovery and performance data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Daily Insights</h1>
          <p className="text-xl text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RecoveryCard 
              recovery={todayData.recovery} 
              zone={todayData.recoveryZone} 
              strainTarget={todayData.strainTarget}
            />
          </div>
          <div className="lg:col-span-2 grid gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <div className="text-sm text-muted-foreground mb-2">Heart Rate</div>
                <div className="text-3xl font-bold text-foreground">{todayData.heartRate}</div>
                <div className="text-xs text-muted-foreground">bpm</div>
              </div>
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <div className="text-sm text-muted-foreground mb-2">HRV</div>
                <div className="text-3xl font-bold text-foreground">{todayData.hrv}</div>
                <div className="text-xs text-muted-foreground">ms</div>
              </div>
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <div className="text-sm text-muted-foreground mb-2">Resp. Rate</div>
                <div className="text-3xl font-bold text-foreground">{todayData.respiratoryRate}</div>
                <div className="text-xs text-muted-foreground">br/min</div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Recommendation</h3>
              <p className="text-muted-foreground">
                {todayData.recoveryZone === 'green'
                  ? "You're recovered and ready for a challenging workout. Aim for high-intensity training today."
                  : todayData.recoveryZone === 'yellow'
                    ? "Your body has partially recovered. Moderate exercise is recommended today."
                    : "Your body needs rest. Focus on recovery activities like stretching or yoga."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border shadow-sm">
            <StrainChart data={weeklyData} />
          </div>
          <div className="bg-card rounded-lg border shadow-sm">
            <SleepConsistency sleepData={sleepData} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
