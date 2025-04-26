import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { whoopService } from "@/services/whoopService";
import { Bed, Moon, Sunrise, Loader2 } from "lucide-react";
import { formatDuration, formatTime } from "./utils/formatters";

const Sleep = () => {
  const { data: sleepData, isLoading: isLoadingSleep } = useQuery({
    queryKey: ["whoopSleep30"],
    queryFn: () => whoopService.getSleep(30),
  });

  if (isLoadingSleep) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-whoop-teal" />
        </div>
      </MainLayout>
    );
  }

  const latestSleep = sleepData?.[sleepData.length - 1];
  
  const sleepScore = latestSleep?.score?.sleep_performance_percentage
    ? Math.round(latestSleep.score.sleep_performance_percentage) : 0;
    
  const timeInBed = latestSleep?.score?.stage_summary?.total_in_bed_time_milli 
    ? formatDuration(latestSleep.score.stage_summary.total_in_bed_time_milli / 1000) : "--:--";
    
  const sleepNeeded = latestSleep?.score?.sleep_needed
    ? formatDuration((
        latestSleep.score.sleep_needed.baseline_milli + 
        latestSleep.score.sleep_needed.need_from_sleep_debt_milli + 
        latestSleep.score.sleep_needed.need_from_recent_strain_milli + 
        latestSleep.score.sleep_needed.need_from_recent_nap_milli
      ) / 1000) : '--:--';
      
  const wakeTime = latestSleep?.end 
    ? formatTime(new Date(latestSleep.end)) : "--:--";

  const sleepMetrics = [
    {
      icon: <Moon className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "SLEEP SCORE",
      value: sleepScore > 0 ? `${sleepScore}%` : "--",
      description: sleepScore > 70 ? "Good sleep quality" : "Needs improvement"
    },
    {
      icon: <Bed className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "TIME IN BED",
      value: timeInBed,
      description: `Need: ${sleepNeeded}`
    },
    {
      icon: <Sunrise className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "WAKE TIME",
      value: wakeTime,
      description: latestSleep?.score?.sleep_consistency_percentage 
                  ? `${Math.round(latestSleep.score.sleep_consistency_percentage)}% consistent` 
                  : "Consistency N/A"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Sleep Analysis</h1>
            <p className="text-lg text-whoop-white/70">
              Optimize your recovery through better sleep
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sleepMetrics.map((metric, index) => (
            <Card key={index} className="bg-whoop-black/80 backdrop-blur-sm border-whoop-sleep-blue/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-whoop-sleep-blue/10 rounded-full">
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-whoop text-whoop-white/70">
                      {metric.label}
                    </p>
                    <h3 className="text-2xl font-din font-bold text-whoop-white">{metric.value}</h3>
                    <p className="text-sm text-whoop-white/50">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SleepConsistency sleepData={sleepData || []} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Sleep;
