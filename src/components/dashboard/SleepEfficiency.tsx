import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface SleepEfficiencyProps {
  sleepData: WhoopSleep[] | null | undefined;
  currentSleep: WhoopSleep | null | undefined;
}

const SleepEfficiency: React.FC<SleepEfficiencyProps> = ({ sleepData, currentSleep }) => {
  // Extract the current sleep efficiency
  const currentEfficiency = currentSleep?.score?.sleep_efficiency_percentage ?? 0;
  
  // Calculate the weekly average efficiency
  const weeklyAverage = React.useMemo(() => {
    if (!sleepData || sleepData.length === 0) return 0;
    
    const validSleepData = sleepData.filter(
      item => item?.score?.sleep_efficiency_percentage !== undefined
    );
    
    if (validSleepData.length === 0) return 0;
    
    const total = validSleepData.reduce(
      (sum, item) => sum + (item.score?.sleep_efficiency_percentage ?? 0), 
      0
    );
    
    return total / validSleepData.length;
  }, [sleepData]);
  
  // Determine if current efficiency is better or worse than weekly average
  const efficiencyDiff = currentEfficiency - weeklyAverage;
  
  // Format efficiency as percentage
  const formatEfficiency = (value: number) => {
    return `${Math.round(value)}%`;
  };
  
  // Get percentage change text
  const getPercentageChangeText = (diff: number) => {
    if (Math.abs(diff) < 0.5) return 'Same as average';
    return `${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'better' : 'worse'} than average`;
  };
  
  // Determine color based on efficiency
  const getEfficiencyColor = (value: number) => {
    if (value >= 90) return 'text-green-500';
    if (value >= 80) return 'text-blue-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-500';
  };
  
  return (
    <div className="text-whoop-white">
      <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm mb-4">SLEEP EFFICIENCY</h3>
      
      <div className="bg-whoop-black/40 p-4 rounded-lg">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Last Night</p>
            <p className={`text-3xl font-bold ${getEfficiencyColor(currentEfficiency)}`}>
              {formatEfficiency(currentEfficiency)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Weekly Avg</p>
            <p className="text-lg font-medium text-whoop-white/80">
              {formatEfficiency(weeklyAverage)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center mt-3">
          {efficiencyDiff > 0 ? (
            <ArrowUpIcon size={16} className="text-green-500 mr-1" />
          ) : efficiencyDiff < 0 ? (
            <ArrowDownIcon size={16} className="text-red-500 mr-1" />
          ) : (
            <span className="w-4 mr-1"></span>
          )}
          <p className="text-xs text-whoop-white/70">
            {getPercentageChangeText(efficiencyDiff)}
          </p>
        </div>
        
        <div className="mt-5 text-xs text-whoop-white/60">
          <p>
            Sleep efficiency measures the percentage of time in bed that you're actually asleep.
            Higher efficiency means more restorative sleep.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SleepEfficiency; 