import React from "react";
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
  
  // Get recent days of sleep data - use 14 days for better median calculations
  const recentSleepData = sleepData
    .filter(sleep => sleep && sleep.start && sleep.end)
    .slice(-14);
  
  // Get last 7 days for the pattern display
  const patternSleepData = recentSleepData.slice(-7);
  
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

  // Generate weekday labels
  const getDayLabel = (index: number): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[index];
  };

  return (
    <div className="text-whoop-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="uppercase tracking-wide font-medium text-whoop-white text-sm">SLEEP CONSISTENCY</h2>
        <Badge 
          variant="outline" 
          className="bg-transparent border-whoop-white/20 text-whoop-white/70 flex gap-1.5 items-center py-1 px-3"
        >
          <Bed className="h-4 w-4" />
          {consistencyStreak > 0 ? `${consistencyStreak} Day Streak` : "NO CURRENT STREAK"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col items-center">
          <p className="text-sm text-whoop-white/60 mb-1">Target Bedtime</p>
          <p className="text-3xl font-bold my-1">{medianSleepStart}</p>
          <p className="text-xs text-whoop-white/50">14-day median</p>
        </div>
        
        <div className="flex flex-col items-center">
          <p className="text-sm text-whoop-white/60 mb-1">Target Wake Time</p>
          <p className="text-3xl font-bold my-1">{medianWakeTime}</p>
          <p className="text-xs text-whoop-white/50">14-day median</p>
        </div>
      </div>
      
      <h3 className="text-sm font-medium mb-5 uppercase text-whoop-white tracking-wide">RECENT SLEEP PATTERN</h3>
      
      <div className="grid grid-cols-7 gap-1 mb-8">
        {Array(7).fill(0).map((_, i) => (
          <div key={`day-${i}`} className="flex flex-col items-center">
            <span className="text-xs text-whoop-white/60 mb-3">
              {getDayLabel(i)}
            </span>
          </div>
        ))}
        
        {patternSleepData.length > 0 ? (
          patternSleepData.map((day, index) => {
            const consistency = getSleepConsistency(day);
            return (
              <div 
                key={`sleep-${day.id || index}`}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  consistency === 'consistent' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                )}>
                  {day.start ? new Date(day.start).getDate() : "--"}
                </div>
              </div>
            );
          })
        ) : (
          // Placeholder circles if no data
          Array(7).fill(0).map((_, i) => (
            <div key={`placeholder-${i}`} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-whoop-white/10">
                --
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-sm text-whoop-white/60">
        <p>
          Sticking to a consistent sleep schedule helps optimize your recovery. Aim to go to bed within ±30 minutes of your target bedtime.
        </p>
      </div>
    </div>
  );
};

export default SleepConsistency;
