import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Plus, Timer, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhoopSleep } from "@/services/whoopService";

interface MyDayProps {
  latestSleep: WhoopSleep | null | undefined;
}

const MyDay: React.FC<MyDayProps> = ({ latestSleep }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Format the sleep duration
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get sleep duration from the stage summary
  const sleepDuration = latestSleep?.score?.stage_summary?.total_in_bed_time_milli
    ? formatDuration(latestSleep.score.stage_summary.total_in_bed_time_milli)
    : "--:--";
    
  // Get sleep and wake times
  const sleepTime = latestSleep?.start ? formatTime(latestSleep.start) : "--:--";
  const wakeTime = latestSleep?.end ? formatTime(latestSleep.end) : "--:--";

  return (
    <Card className="bg-gradient-to-b from-whoop-black/80 to-whoop-black border-whoop-white/10 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-sans font-bold text-whoop-white flex items-center">
          MY DAY
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div 
          className="bg-whoop-black/40 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-whoop-white/5 transition-colors duration-300 border border-transparent hover:border-whoop-white/10 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-whoop-sleep-blue/20 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-whoop-sleep-blue/30">
              <Moon className="h-6 w-6 text-whoop-sleep-blue group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="font-din text-xl font-bold text-whoop-white transition-all duration-300 group-hover:text-whoop-sleep-blue">{sleepDuration}</p>
              <p className="text-sm text-whoop-white/70">
                {sleepTime} - {wakeTime}
              </p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-whoop-white/50 transition-all duration-300 ${isHovering ? 'transform translate-x-1' : ''}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="w-full bg-whoop-black/40 border-whoop-white/10 hover:bg-whoop-white/5 hover:border-whoop-white/20 text-whoop-white transition-all duration-300 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Add Activity</span>
          </Button>
          <Button
            variant="outline"
            className="w-full bg-whoop-black/40 border-whoop-white/10 hover:bg-whoop-white/5 hover:border-whoop-white/20 text-whoop-white transition-all duration-300 group"
          >
            <Activity className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Start Activity</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyDay;
