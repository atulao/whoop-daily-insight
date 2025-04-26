
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RecoveryCard from "@/components/dashboard/RecoveryCard";
import StrainChart from "@/components/dashboard/StrainChart";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
import { Button } from "@/components/ui/button";
import { getTodayData, generateWeeklyData, generateSleepData } from "@/services/mockData";

const Dashboard = () => {
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate API calls
  useEffect(() => {
    // Simulate loading delay
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
            <h2 className="text-xl font-semibold mb-2">Loading your insights...</h2>
            <p className="text-muted-foreground">Analyzing your recovery and performance data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Daily Insights</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <RecoveryCard 
              recovery={todayData.recovery} 
              zone={todayData.recoveryZone} 
              strainTarget={todayData.strainTarget} 
            />
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-4 h-full">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">Heart Rate</div>
                  <div className="text-3xl font-bold">{todayData.heartRate}</div>
                  <div className="text-xs text-muted-foreground">bpm</div>
                </div>
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">HRV</div>
                  <div className="text-3xl font-bold">{todayData.hrv}</div>
                  <div className="text-xs text-muted-foreground">ms</div>
                </div>
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">Resp. Rate</div>
                  <div className="text-3xl font-bold">{todayData.respiratoryRate}</div>
                  <div className="text-xs text-muted-foreground">br/min</div>
                </div>
              </div>
              
              <Button className="bg-whoop-blue text-white hover:bg-whoop-blue/90">
                Connect WHOOP Account
              </Button>
              
              <div className="bg-card rounded-lg shadow-sm p-4 flex flex-col justify-center flex-1">
                <h3 className="font-semibold mb-2">Daily Recommendation</h3>
                <p>
                  {todayData.recoveryZone === 'green'
                    ? "You're recovered and ready for a challenging workout. Aim for high-intensity training today."
                    : todayData.recoveryZone === 'yellow'
                      ? "Your body has partially recovered. Moderate exercise is recommended today."
                      : "Your body needs rest. Focus on recovery activities like stretching or yoga."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <StrainChart data={weeklyData} />
          <SleepConsistency sleepData={sleepData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
