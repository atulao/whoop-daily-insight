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
  // Calculate median sleep start time
  const calculateMedianTime = (timeArray: (string | undefined)[]) => {
    // Filter out undefined and empty strings
    const validTimes = timeArray.filter(time => time);
    
    if (validTimes.length === 0) return "--:--";
    
    // Convert times to minutes since midnight
    const minutesArray = validTimes.map(time => {
      const date = new Date(time as string);
      return date.getHours() * 60 + date.getMinutes();
    });
    
    // Sort the minutes
    minutesArray.sort((a, b) => a - b);
    
    // Find the median
    const mid = Math.floor(minutesArray.length / 2);
    const median = minutesArray.length % 2 === 0
      ? (minutesArray[mid - 1] + minutesArray[mid]) / 2
      : minutesArray[mid];
    
    // Convert back to time format
    const hours = Math.floor(median / 60) % 24;
    const minutes = Math.floor(median % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Get last 7 days of sleep data
  const recentSleepData = sleepData.slice(-7).filter(sleep => sleep && sleep.start && sleep.end);
  
  // Calculate median sleep start time
  const medianSleepStart = calculateMedianTime(recentSleepData.map(d => d.start));
  
  // Calculate median wake time
  const medianWakeTime = calculateMedianTime(recentSleepData.map(d => d.end));
  
  // Determine consistency based on sleep_consistency_percentage
  const getSleepConsistency = (sleep: WhoopSleep): 'consistent' | 'inconsistent' => {
    const consistencyScore = sleep.score?.sleep_consistency_percentage ?? 0;
    return consistencyScore >= 70 ? 'consistent' : 'inconsistent';
  };
  
  // Calculate consistency streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = sleepData.length - 1; i >= 0; i--) {
      if (getSleepConsistency(sleepData[i]) === 'consistent') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  
  const consistencyStreak = calculateStreak();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl font-semibold">Sleep Consistency</span>
          <Badge variant="outline" className="flex gap-1.5 items-center py-1 px-3">
            <Bed className="h-4 w-4" />
            {consistencyStreak > 0 ? `${consistencyStreak} Day Streak` : "No Current Streak"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/20">
            <p className="text-sm text-muted-foreground mb-1">Target Bedtime</p>
            <p className="text-2xl font-bold">{medianSleepStart}</p>
            <p className="text-xs text-muted-foreground mt-1">14-day median</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/20">
            <p className="text-sm text-muted-foreground mb-1">Target Wake Time</p>
            <p className="text-2xl font-bold">{medianWakeTime}</p>
            <p className="text-xs text-muted-foreground mt-1">14-day median</p>
          </div>
        </div>
        
        <h3 className="text-sm font-medium mb-3">Recent Sleep Pattern</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {recentSleepData.map((day) => {
              const consistency = getSleepConsistency(day);
              const sleepDate = day.start ? new Date(day.start) : new Date();
              
              return (
                <div 
                  key={day.id}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    consistency === 'consistent' 
                      ? 'bg-whoop-green text-white' 
                      : 'bg-whoop-red text-white'
                  )}>
                    {sleepDate.getDate()}
                  </div>
                  <span className="text-xs mt-1.5 text-muted-foreground">
                    {sleepDate.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
          
        <div className="mt-6 text-sm text-muted-foreground border-t pt-4">
          <p>
            Sticking to a consistent sleep schedule helps optimize your recovery.
            Aim to go to bed within ±30 minutes of your target bedtime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepConsistency;
