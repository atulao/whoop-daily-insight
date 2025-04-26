import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WhoopRecovery, WhoopStrain, WhoopSleep } from "@/services/whoopService";

interface WeeklyOverviewProps {
  recoveryData: WhoopRecovery[] | null | undefined;
  strainData: WhoopStrain[] | null | undefined;
  sleepData: WhoopSleep[] | null | undefined;
}

const calculateAverage = (data: any[] | null | undefined, key: string): number => {
  if (!data || data.length === 0) return 0;
  
  if (key.includes('.')) {
    const [parent, child] = key.split('.');
    const validItems = data.filter(item => item?.[parent]?.[child] !== undefined);
    if (validItems.length === 0) return 0;
    
    const total = validItems.reduce((acc, curr) => acc + curr[parent][child], 0);
    return total / validItems.length;
  }
  
  const validItems = data.filter(item => item?.[key] !== undefined);
  if (validItems.length === 0) return 0;
  
  const total = validItems.reduce((acc, curr) => acc + curr[key], 0);
  return total / validItems.length;
};

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ recoveryData, strainData, sleepData }) => {
  const avgRecovery = Math.round(calculateAverage(recoveryData, 'score.recovery_score'));
  const avgStrain = parseFloat(calculateAverage(strainData, 'score.strain').toFixed(1));
  const avgSleepPerformance = Math.round(calculateAverage(sleepData, 'score.sleep_performance_percentage'));

  const metrics = [
    { 
      label: "Avg Recovery", 
      value: avgRecovery || 0,
      unit: "%"
    },
    { 
      label: "Avg Strain", 
      value: avgStrain || 0,
      unit: ""
    },
    { 
      label: "Avg Sleep Performance", 
      value: avgSleepPerformance || 0,
      unit: "%"
    }
  ];

  return (
    <Card className="h-full bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardHeader className="border-b border-whoop-white/10">
        <CardTitle className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-whoop-black/40"
            >
              <span className="font-din text-3xl font-bold text-whoop-white mb-2">
                {metric.value}{metric.unit}
              </span>
              <span className="font-sans text-sm font-semibold text-whoop-white/70 text-center">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;
