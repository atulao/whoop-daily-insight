import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { formatDuration, formatTime } from '@/pages/utils/formatters';
import { Bed, Moon, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface LastNightSleepProps {
  sleepData: WhoopSleep | null | undefined;
}

const LastNightSleep: React.FC<LastNightSleepProps> = ({ sleepData }) => {
  if (!sleepData) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No sleep data available
      </div>
    );
  }

  // Extract the relevant data
  const sleepScore = sleepData?.score?.sleep_performance_percentage
    ? Math.round(sleepData.score.sleep_performance_percentage) : 0;
  
  const sleepEfficiency = sleepData?.score?.sleep_efficiency_percentage
    ? Math.round(sleepData.score.sleep_efficiency_percentage) : 0;

  const startTime = sleepData?.start ? formatTime(sleepData.start) : "--:--";
  const endTime = sleepData?.end ? formatTime(sleepData.end) : "--:--";

  const totalSleepTime = sleepData?.score?.stage_summary?.total_in_bed_time_milli 
    ? formatDuration(sleepData.score.stage_summary.total_in_bed_time_milli / 1000) : "--:--";

  // Sleep stages
  const summary = sleepData?.score?.stage_summary;
  const totalMs = summary?.total_in_bed_time_milli || 1;

  const calculatePercentage = (value: number) => Math.round((value / totalMs) * 100);
  
  const sleepStages = [
    {
      name: 'REM Sleep',
      duration: formatDuration((summary?.total_rem_sleep_time_milli || 0) / 1000),
      percentage: calculatePercentage(summary?.total_rem_sleep_time_milli || 0),
      color: '#8884d8' // Purple
    },
    {
      name: 'Deep Sleep',
      duration: formatDuration((summary?.total_slow_wave_sleep_time_milli || 0) / 1000),
      percentage: calculatePercentage(summary?.total_slow_wave_sleep_time_milli || 0),
      color: '#4169e1' // Blue
    },
    {
      name: 'Light Sleep',
      duration: formatDuration((summary?.total_light_sleep_time_milli || 0) / 1000),
      percentage: calculatePercentage(summary?.total_light_sleep_time_milli || 0),
      color: '#82ca9d' // Green
    },
    {
      name: 'Awake',
      duration: formatDuration((summary?.total_awake_time_milli || 0) / 1000),
      percentage: calculatePercentage(summary?.total_awake_time_milli || 0),
      color: '#ff8042' // Orange
    }
  ];

  return (
    <div className="text-whoop-white bg-whoop-black/70 backdrop-blur-sm border border-whoop-white/10 shadow-lg overflow-hidden rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="uppercase tracking-wide font-medium text-whoop-white text-lg">LAST NIGHT'S SLEEP</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-whoop-white/50 hover:text-whoop-white">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
              <p>Summary of your most recent sleep session.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep Duration */}
        <div className="flex flex-col items-center justify-center p-4 bg-whoop-black/40 rounded-lg border border-whoop-white/5">
          <div className="flex items-center mb-2">
            <Moon className="h-5 w-5 text-whoop-sleep-blue mr-2" />
            <span className="text-sm uppercase tracking-wide text-whoop-white/70">Total Sleep</span>
          </div>
          <div className="text-3xl font-bold text-whoop-white mb-1">{totalSleepTime}</div>
          <div className="text-xs text-whoop-white/60 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{startTime} - {endTime}</span>
          </div>
        </div>

        {/* Sleep Score & Efficiency */}
        <div className="flex flex-col items-center justify-center p-4 bg-whoop-black/40 rounded-lg border border-whoop-white/5">
          <div className="grid grid-cols-2 w-full gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wide text-whoop-white/70 mb-1">Score</span>
              <div className={`text-2xl font-bold ${
                sleepScore >= 80 ? 'text-emerald-400' : 
                sleepScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {sleepScore}%
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wide text-whoop-white/70 mb-1">Efficiency</span>
              <div className={`text-2xl font-bold ${
                sleepEfficiency >= 90 ? 'text-emerald-400' : 
                sleepEfficiency >= 75 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {sleepEfficiency}%
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Stages Summary */}
        <div className="flex flex-col justify-center p-4 bg-whoop-black/40 rounded-lg border border-whoop-white/5">
          <div className="space-y-2 w-full">
            {sleepStages.map((stage, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                  <span className="text-whoop-white/80">{stage.name}</span>
                </div>
                <div>
                  <span className="text-whoop-white/70">{stage.duration}</span>
                  <span className="text-whoop-white/50 ml-1">({stage.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastNightSleep; 