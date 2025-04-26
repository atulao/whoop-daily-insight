import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepData {
  date: string;
  sleepStart: string;
  wakeTime: string;
  duration: number;
  efficiency: number;
  consistency: 'consistent' | 'inconsistent';
}

interface SleepConsistencyProps {
  sleepData: SleepData[];
}

const SleepConsistency: React.FC<SleepConsistencyProps> = ({ sleepData }) => {
  // Calculate median sleep start time
  const calculateMedianTime = (timeArray: string[]) => {
    // Convert times to minutes since midnight
    const minutesArray = timeArray.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
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
  const recentSleepData = sleepData.slice(-7);
  
  // Calculate median sleep start time
  const medianSleepStart = calculateMedianTime(recentSleepData.map(d => d.sleepStart));
  
  // Calculate median wake time
  const medianWakeTime = calculateMedianTime(recentSleepData.map(d => d.wakeTime));
  
  // Calculate consistency streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = sleepData.length - 1; i >= 0; i--) {
      if (sleepData[i].consistency === 'consistent') {
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
        
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Sleep Pattern</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {recentSleepData.map((day) => (
                <div 
                  key={day.date}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    day.consistency === 'consistent' 
                      ? 'bg-whoop-green text-white' 
                      : 'bg-whoop-red text-white'
                  )}>
                    {new Date(day.date).getDate()}
                  </div>
                  <span className="text-xs mt-1.5 text-muted-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground border-t pt-4">
            <p>
              Sticking to a consistent sleep schedule helps optimize your recovery.
              Aim to go to bed within ±30 minutes of your target bedtime.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepConsistency;
