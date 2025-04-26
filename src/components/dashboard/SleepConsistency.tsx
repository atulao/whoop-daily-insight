
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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Sleep Consistency</span>
          <Badge variant="outline" className="flex gap-1 items-center">
            <Bed className="h-4 w-4" />
            {consistencyStreak > 0 ? `${consistencyStreak} Day Streak` : "No Current Streak"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Target Bedtime</p>
            <p className="text-2xl font-bold">{medianSleepStart}</p>
            <p className="text-xs text-muted-foreground mt-2">Based on your 14-day median</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Target Wake Time</p>
            <p className="text-2xl font-bold">{medianWakeTime}</p>
            <p className="text-xs text-muted-foreground mt-2">Based on your 14-day median</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Recent Sleep Pattern</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {recentSleepData.map((day, index) => (
                <div 
                  key={day.date}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    day.consistency === 'consistent' ? 'bg-whoop-green text-white' : 'bg-whoop-red text-white'
                  )}>
                    {new Date(day.date).getDate()}
                  </div>
                  <span className="text-xs mt-1">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Sticking to a consistent sleep schedule helps optimize your recovery.
              Go to bed within ±30 minutes of your target bedtime.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepConsistency;
