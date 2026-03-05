import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhoopSleep } from "@/services/whoopService";

interface SleepConsistencyProps {
  sleepData: WhoopSleep[];
}

const SleepConsistency: React.FC<SleepConsistencyProps> = ({ sleepData }) => {
  const recentSleepData = sleepData.slice(-7);

  // Calculate average sleep duration
  const avgDurationHrs = recentSleepData.length > 0
    ? (recentSleepData.reduce((sum, d) => sum + d.qualityDuration, 0) / recentSleepData.length / 3600).toFixed(1)
    : "--";

  // Calculate sleep performance for each day
  const sleepPerformances = recentSleepData.map(d => ({
    date: d.date,
    performance: d.sleepNeed > 0 ? Math.round((d.qualityDuration / d.sleepNeed) * 100) : 0,
    isGood: d.sleepNeed > 0 ? (d.qualityDuration / d.sleepNeed) >= 0.85 : false,
  }));

  // Calculate consistency streak (days with ≥85% sleep need met)
  let streak = 0;
  for (let i = sleepPerformances.length - 1; i >= 0; i--) {
    if (sleepPerformances[i].isGood) streak++;
    else break;
  }

  return (
    <Card className="overflow-hidden bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle className="flex justify-between items-center text-whoop-white">
          <span className="text-xl font-semibold">Sleep Consistency</span>
          <Badge variant="secondary" className="flex gap-1.5 items-center py-1 px-3">
            <Bed className="h-4 w-4" />
            {streak > 0 ? `${streak} Day Streak` : "No Current Streak"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/20">
            <p className="text-sm text-muted-foreground mb-1">Avg Sleep Duration</p>
            <p className="text-2xl font-bold text-whoop-white">{avgDurationHrs} hrs</p>
            <p className="text-xs text-muted-foreground mt-1">last 7 days</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/20">
            <p className="text-sm text-muted-foreground mb-1">Avg Resp. Rate</p>
            <p className="text-2xl font-bold text-whoop-white">
              {recentSleepData.length > 0
                ? (recentSleepData.reduce((s, d) => s + d.respiratoryRate, 0) / recentSleepData.length).toFixed(1)
                : "--"} rpm
            </p>
            <p className="text-xs text-muted-foreground mt-1">last 7 days</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-whoop-white/70">Recent Sleep Performance</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {sleepPerformances.map((day) => (
                <div key={day.date} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    day.isGood
                      ? 'bg-whoop-recovery-high text-whoop-black'
                      : 'bg-whoop-recovery-low text-white'
                  )}>
                    {new Date(day.date).getDate()}
                  </div>
                  <span className="text-xs mt-1.5 text-muted-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className="text-xs text-whoop-white/50">{day.performance}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-sm text-muted-foreground border-t border-whoop-white/10 pt-4">
            <p>
              Sticking to a consistent sleep schedule helps optimize your recovery.
              Aim to meet at least 85% of your sleep need each night.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepConsistency;
