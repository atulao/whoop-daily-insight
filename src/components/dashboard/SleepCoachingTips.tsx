import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { Lightbulb, Moon, Clock, Activity, Coffee, Wine } from 'lucide-react';

interface SleepCoachingTipsProps {
  sleepData: WhoopSleep[] | null | undefined;
  currentSleep: WhoopSleep | null | undefined;
}

const SleepCoachingTips: React.FC<SleepCoachingTipsProps> = ({ sleepData, currentSleep }) => {
  // Check if we have valid data to work with
  const hasValidData = currentSleep?.score !== undefined;
  
  // Extract metrics to generate personalized tips
  const efficiency = currentSleep?.score?.sleep_efficiency_percentage ?? 0;
  const consistency = currentSleep?.score?.sleep_consistency_percentage ?? 0;
  const disturbances = currentSleep?.score?.stage_summary?.disturbance_count ?? 0;
  const remSleepPercentage = currentSleep?.score?.stage_summary?.total_rem_sleep_time_milli 
    ? (currentSleep.score.stage_summary.total_rem_sleep_time_milli / 
      currentSleep.score.stage_summary.total_in_bed_time_milli) * 100
    : 0;
  const deepSleepPercentage = currentSleep?.score?.stage_summary?.total_slow_wave_sleep_time_milli
    ? (currentSleep.score.stage_summary.total_slow_wave_sleep_time_milli / 
      currentSleep.score.stage_summary.total_in_bed_time_milli) * 100
    : 0;
  
  // Generate personalized sleep tips based on metrics
  const getTips = React.useMemo(() => {
    if (!hasValidData) {
      return [
        {
          icon: <Lightbulb className="text-yellow-400" />,
          title: "Track Your Sleep",
          description: "Start tracking your sleep consistently to get personalized coaching tips."
        }
      ];
    }
    
    const tips = [];
    
    // Efficiency tips
    if (efficiency < 80) {
      tips.push({
        icon: <Clock className="text-blue-400" />,
        title: "Improve Sleep Efficiency",
        description: "Try to spend less time in bed while not sleeping. Read or meditate until you feel sleepy."
      });
    }
    
    // Consistency tips
    if (consistency < 70) {
      tips.push({
        icon: <Moon className="text-indigo-400" />,
        title: "Be More Consistent",
        description: "Go to bed and wake up at the same time each day, even on weekends."
      });
    }
    
    // Disturbance tips
    if (disturbances > 5) {
      tips.push({
        icon: <Coffee className="text-amber-400" />,
        title: "Reduce Disturbances",
        description: "Avoid caffeine after noon and limit evening alcohol to improve sleep continuity."
      });
    }
    
    // REM sleep tips
    if (remSleepPercentage < 20) {
      tips.push({
        icon: <Activity className="text-green-400" />,
        title: "Boost REM Sleep",
        description: "Regular exercise can increase REM sleep, but avoid intense workouts within 3 hours of bedtime."
      });
    }
    
    // Deep sleep tips
    if (deepSleepPercentage < 15) {
      tips.push({
        icon: <Wine className="text-red-400" />,
        title: "Increase Deep Sleep",
        description: "Avoid alcohol before bed and try to cool your bedroom to 65-68°F (18-20°C)."
      });
    }
    
    // If no specific tips, give general advice
    if (tips.length === 0) {
      tips.push({
        icon: <Lightbulb className="text-yellow-400" />,
        title: "Maintain Your Routine",
        description: "You're sleeping well. Continue your current sleep routine and habits."
      });
    }
    
    return tips.slice(0, 3); // Limit to 3 tips maximum
  }, [hasValidData, efficiency, consistency, disturbances, remSleepPercentage, deepSleepPercentage]);

  return (
    <div className="text-whoop-white">
      <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm mb-4">SLEEP COACHING TIPS</h3>
      
      <div className="space-y-3">
        {getTips.map((tip, index) => (
          <div 
            key={index} 
            className="bg-whoop-black/40 p-4 rounded-lg flex items-start"
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {React.cloneElement(tip.icon, { size: 18 })}
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
              <p className="text-xs text-whoop-white/70">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-whoop-white/50 italic text-center">
        Tips are based on your recent sleep patterns and may change as your habits improve.
      </div>
    </div>
  );
};

export default SleepCoachingTips; 