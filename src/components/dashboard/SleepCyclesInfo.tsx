import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDuration } from '@/pages/utils/formatters';

interface SleepCyclesInfoProps {
  sleepData: WhoopSleep | null | undefined;
}

const SleepCyclesInfo: React.FC<SleepCyclesInfoProps> = ({ sleepData }) => {
  // Estimate the number of sleep cycles based on WHOOP's data
  // A typical sleep cycle lasts about 90-110 minutes
  // WHOOP doesn't explicitly provide cycle count, but we can estimate it
  const estimateSleepCycles = () => {
    if (!sleepData || !sleepData.score) return 0;
    
    // Get the total sleep time excluding awake time
    const totalSleepMillis = (
      (sleepData.score.stage_summary.total_in_bed_time_milli || 0) - 
      (sleepData.score.stage_summary.total_awake_time_milli || 0) - 
      (sleepData.score.stage_summary.total_no_data_time_milli || 0)
    );
    
    // Convert to minutes
    const totalSleepMinutes = totalSleepMillis / (1000 * 60);
    
    // Estimate cycles (average cycle is 90-110 minutes)
    // Using 100 minutes as an average cycle length
    return Math.round(totalSleepMinutes / 100);
  };
  
  const sleepCycleCount = estimateSleepCycles();
  
  // Determine if the cycle count is within healthy range (3-5 for adults)
  const getCycleHealthStatus = (cycleCount: number) => {
    if (cycleCount >= 4) return { status: 'Optimal', color: 'text-emerald-400' };
    if (cycleCount >= 3) return { status: 'Good', color: 'text-blue-400' };
    if (cycleCount >= 2) return { status: 'Fair', color: 'text-amber-400' };
    return { status: 'Poor', color: 'text-rose-400' };
  };
  
  const cycleStatus = getCycleHealthStatus(sleepCycleCount);
  
  // Parse the disturbances data
  // WHOOP typically reports disturbances/wake events
  const getDisturbanceCount = () => {
    if (!sleepData || !sleepData.score) return 0;
    
    // WHOOP doesn't directly expose disturbance count in the API
    // We can estimate by looking at the number of wake periods
    // This is a rough estimate - actual WHOOP algorithm is more sophisticated
    const disturbanceThresholdMillis = 2 * 60 * 1000; // 2 minutes
    const awakeTimeMillis = sleepData.score.stage_summary.total_awake_time_milli || 0;
    
    // Each typical disturbance is about 1-3 minutes
    // Divide total awake time by average disturbance length
    return Math.round(awakeTimeMillis / disturbanceThresholdMillis);
  };
  
  const disturbanceCount = getDisturbanceCount();
  
  // Determine if the disturbance count is within normal range (10-20 per night)
  const getDisturbanceStatus = (count: number) => {
    if (count <= 20 && count >= 5) return { status: 'Normal', color: 'text-emerald-400' };
    if (count > 20) return { status: 'High', color: 'text-amber-400' };
    return { status: 'Low', color: 'text-blue-400' };
  };
  
  const disturbanceStatus = getDisturbanceStatus(disturbanceCount);
  
  // Get REM cycle quality - WHOOP emphasizes REM importance
  const getRemQuality = () => {
    if (!sleepData || !sleepData.score) return { quality: 'Unknown', color: 'text-gray-400' };
    
    const remTimeMillis = sleepData.score.stage_summary.total_rem_sleep_time_milli || 0;
    const totalSleepMillis = (
      (sleepData.score.stage_summary.total_in_bed_time_milli || 0) - 
      (sleepData.score.stage_summary.total_awake_time_milli || 0) - 
      (sleepData.score.stage_summary.total_no_data_time_milli || 0)
    );
    
    // Calculate REM as percentage of total sleep
    const remPercentage = (remTimeMillis / totalSleepMillis) * 100;
    
    // WHOOP considers 19-26% REM to be ideal
    if (remPercentage >= 19 && remPercentage <= 26) return { quality: 'Optimal', color: 'text-emerald-400' };
    if (remPercentage >= 15 && remPercentage < 19) return { quality: 'Good', color: 'text-blue-400' };
    if (remPercentage > 26 && remPercentage <= 30) return { quality: 'Good', color: 'text-blue-400' };
    if (remPercentage >= 10 && remPercentage < 15) return { quality: 'Fair', color: 'text-amber-400' };
    if (remPercentage > 30) return { quality: 'Fair', color: 'text-amber-400' };
    return { quality: 'Poor', color: 'text-rose-400' };
  };
  
  const remQuality = getRemQuality();
  
  // Format time in REM and deep sleep
  const getFormattedStageTimes = () => {
    if (!sleepData || !sleepData.score) return { rem: '--:--', deep: '--:--' };
    
    const remTimeMillis = sleepData.score.stage_summary.total_rem_sleep_time_milli || 0;
    const deepTimeMillis = sleepData.score.stage_summary.total_slow_wave_sleep_time_milli || 0;
    
    return {
      rem: formatDuration(remTimeMillis / 1000),
      deep: formatDuration(deepTimeMillis / 1000)
    };
  };
  
  const stageTimes = getFormattedStageTimes();
  
  // No data available
  if (!sleepData || !sleepData.score) {
    return (
      <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-whoop-white/5 pb-3">
          <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white">
            SLEEP CYCLES ANALYSIS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-whoop-white/50">
            No sleep cycles data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
      <CardHeader className="border-b border-whoop-white/5 pb-3">
        <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
          SLEEP CYCLES ANALYSIS
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-whoop-white/50 hover:text-whoop-white">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                <p>A healthy sleep pattern includes 3-5 complete sleep cycles, each lasting 90-110 minutes and containing Light, Deep, and REM stages.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sleep Cycles */}
          <div className="p-4 border border-whoop-white/10 rounded-lg bg-whoop-black/40">
            <div className="text-xs uppercase text-whoop-white/60 mb-1">Estimated Cycles</div>
            <div className="flex items-end">
              <div className="text-3xl font-bold text-whoop-sleep-blue">{sleepCycleCount}</div>
              <div className="text-sm ml-1 mb-0.5 text-whoop-white/60">cycles</div>
            </div>
            <div className={`text-sm ${cycleStatus.color} mt-1`}>{cycleStatus.status}</div>
            <div className="text-xs text-whoop-white/60 mt-1">
              WHOOP recommends 3-5 complete cycles per night
            </div>
          </div>
          
          {/* Disturbances */}
          <div className="p-4 border border-whoop-white/10 rounded-lg bg-whoop-black/40">
            <div className="text-xs uppercase text-whoop-white/60 mb-1">Disturbances</div>
            <div className="flex items-end">
              <div className="text-3xl font-bold text-whoop-white">{disturbanceCount}</div>
              <div className="text-sm ml-1 mb-0.5 text-whoop-white/60">events</div>
            </div>
            <div className={`text-sm ${disturbanceStatus.color} mt-1`}>{disturbanceStatus.status}</div>
            <div className="text-xs text-whoop-white/60 mt-1">
              10-20 brief disturbances are normal during sleep
            </div>
          </div>
          
          {/* REM Quality */}
          <div className="p-4 border border-whoop-white/10 rounded-lg bg-whoop-black/40">
            <div className="text-xs uppercase text-whoop-white/60 mb-1">REM Quality</div>
            <div className="flex items-end">
              <div className="text-3xl font-bold text-purple-400">{remQuality.quality}</div>
            </div>
            <div className="text-sm text-whoop-white/80 mt-1">
              Time in REM: <span className="text-purple-400">{stageTimes.rem}</span>
            </div>
            <div className="text-xs text-whoop-white/60 mt-1">
              Ideal REM sleep is 19-26% of total sleep
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 border border-whoop-white/15 rounded-lg bg-gradient-to-r from-whoop-black/40 to-whoop-black/60">
          <h3 className="text-sm font-medium text-whoop-white mb-2">The Sleep Cycle Journey</h3>
          <p className="text-xs text-whoop-white/70 leading-relaxed">
            Each night, you move through multiple sleep cycles, each lasting 90-110 minutes. Starting with Light sleep, you then enter Deep sleep for physical restoration, followed by REM sleep for mental recovery. Your brain cycles through these stages 3-5 times per night, with REM periods becoming longer toward morning.
          </p>
          <div className="mt-2 text-xs text-whoop-white/70">
            <span className="text-whoop-sleep-blue font-medium">WHOOP Insight:</span> Consistent bedtimes help optimize your sleep cycle patterns, leading to more restorative sleep and better recovery.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepCyclesInfo; 