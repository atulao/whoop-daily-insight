import React from 'react';
import { WhoopSleep, WhoopRecovery } from '@/services/whoopService';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RecoveryImpactProps {
  sleepData: WhoopSleep | null | undefined;
  recoveryData: WhoopRecovery | null | undefined;
}

const RecoveryImpact: React.FC<RecoveryImpactProps> = ({ sleepData, recoveryData }) => {
  // Extract sleep score and recovery score
  const sleepScore = sleepData?.score?.sleep_performance_percentage ?? 0;
  const recoveryScore = recoveryData?.score?.recovery_score ?? 0;
  
  // Calculate the projected recovery improvement with better sleep
  const calculateProjectedRecovery = () => {
    if (sleepScore >= 90) return recoveryScore; // Already optimal sleep
    
    // Simple model: Each 10% sleep improvement could yield 5-7% recovery improvement
    // This is a simplified model - in reality, the relationship is more complex
    const sleepImprovement = 10; // Assuming 10% sleep improvement
    const recoveryImprovement = Math.min(sleepImprovement * 0.6, 100 - recoveryScore);
    
    return Math.min(recoveryScore + recoveryImprovement, 100);
  };
  
  const projectedRecovery = calculateProjectedRecovery();
  const recoveryImprovement = projectedRecovery - recoveryScore;
  
  // Determine sleep quality level
  const getSleepQualityLevel = (score: number) => {
    if (score >= 90) return 'Optimal';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };
  
  // Get color based on recovery score
  const getRecoveryColor = (score: number) => {
    if (score >= 67) return 'text-green-500';
    if (score >= 34) return 'text-yellow-400';
    return 'text-red-500';
  };
  
  // Generate recommendation based on sleep score
  const getRecommendation = () => {
    if (sleepScore >= 90) {
      return "Your sleep quality is optimal and supporting your recovery well.";
    } else if (sleepScore >= 80) {
      return "Adding 30 minutes to your sleep duration could further improve your recovery.";
    } else if (sleepScore >= 70) {
      return "Consider going to bed 45 minutes earlier to enhance recovery.";
    } else {
      return "Prioritize an additional hour of sleep to significantly boost recovery.";
    }
  };
  
  if (!sleepData || !recoveryData) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No sleep or recovery data available
      </div>
    );
  }

  return (
    <div className="text-whoop-white">
      <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm mb-4">RECOVERY IMPACT</h3>
      
      <div className="bg-whoop-black/40 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Sleep Quality</p>
            <p className="text-lg font-bold">
              {getSleepQualityLevel(sleepScore)}
              <span className="ml-2 text-sm font-normal text-whoop-white/60">
                ({Math.round(sleepScore)}%)
              </span>
            </p>
          </div>
          
          <div className="h-8 w-px bg-whoop-white/10"></div>
          
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Recovery</p>
            <p className={`text-lg font-bold ${getRecoveryColor(recoveryScore)}`}>
              {Math.round(recoveryScore)}%
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">What if you improved your sleep?</p>
          <div className="flex items-center">
            <div className={`text-2xl font-bold ${getRecoveryColor(projectedRecovery)}`}>
              {Math.round(projectedRecovery)}%
            </div>
            <div className="flex items-center ml-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{Math.round(recoveryImprovement)}%</span>
            </div>
          </div>
          <p className="text-xs text-whoop-white/60 mt-1">
            Potential recovery with improved sleep
          </p>
        </div>
        
        <div className="p-3 border border-whoop-white/10 rounded-md">
          <p className="text-xs text-whoop-white/80">
            {getRecommendation()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryImpact; 