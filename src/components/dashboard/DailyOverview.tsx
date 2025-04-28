import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WhoopRecovery, WhoopStrain, WhoopSleep } from "@/services/whoopService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ArrowRight, TrendingUp, TrendingDown, Activity, Moon, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface DailyOverviewProps {
  latestRecovery: WhoopRecovery | null | undefined;
  latestStrain: WhoopStrain | null | undefined;
  latestSleep: WhoopSleep | null | undefined;
  previousWeekRecovery?: number;
  previousWeekStrain?: number;
  previousWeekSleep?: number;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({
  latestRecovery,
  latestStrain,
  latestSleep,
  previousWeekRecovery = 0,
  previousWeekStrain = 0,
  previousWeekSleep = 0
}) => {
  const getRecoveryColor = (value: number) => {
    if (value >= 67) return 'text-whoop-recovery-high';
    if (value >= 34) return 'text-whoop-recovery-med';
    return 'text-whoop-recovery-low';
  };

  const getRecoveryBgColor = (value: number) => {
    if (value >= 67) return 'bg-whoop-recovery-high/10';
    if (value >= 34) return 'bg-whoop-recovery-med/10';
    return 'bg-whoop-recovery-low/10';
  };

  const getRecommendedStrain = (recovery: number) => {
    if (recovery >= 67) return '14-18';
    if (recovery >= 34) return '8-14';
    return '1-8';
  };

  const getStatusSummary = (recovery: number) => {
    if (recovery >= 67) return 'Green recovery: Ready for high intensity';
    if (recovery >= 34) return 'Yellow recovery: Take it moderate today';
    return 'Red recovery: Focus on recovery today';
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  const getPersonalizedInsight = (recovery: number, strain: number, sleep: number) => {
    if (recovery >= 67 && sleep >= 80) 
      return "Great sleep quality is boosting your recovery. Maintain this pattern!";
    if (recovery < 50 && strain > 15) 
      return "High strain and low recovery suggest you need extra rest today.";
    if (recovery > previousWeekRecovery) 
      return "Your recovery is trending up. Your body is adapting well!";
    return "Consistent sleep times will help improve your recovery scores.";
  };

  // Extract data values directly from API response
  const recoveryScore = latestRecovery?.score?.recovery_score ?? 0;
  const strainScore = latestStrain?.score?.strain ?? 0;
  const sleepPerformance = latestSleep?.score?.sleep_performance_percentage ?? 0;
  const hrv = latestRecovery?.score?.hrv_rmssd_milli ?? 0;

  return (
    <div className="space-y-4">
      <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
          {/* Recovery */}
          <div className="text-center">
            <div className="flex justify-between items-center mb-1">
              <Link to="/recovery" className="text-xs text-whoop-white/50 hover:text-whoop-white flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                <span>Details</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-whoop-white/50 hover:text-whoop-white">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                    <p>Recovery measures your body's readiness to perform based on HRV, resting heart rate, and sleep performance.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className={`relative inline-block rounded-full p-1 ${getRecoveryBgColor(recoveryScore)}`}>
              <p className={`font-din text-4xl font-bold ${getRecoveryColor(recoveryScore)}`}>
                {recoveryScore}%
              </p>
            </div>
            <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70 mt-1">
              Recovery {getTrendIndicator(recoveryScore, previousWeekRecovery)}
            </p>
            <p className="text-xs text-whoop-white/60 mt-1">
              Recommended: <span className="font-medium">{getRecommendedStrain(recoveryScore)}</span>
            </p>
          </div>

          {/* Strain */}
          <div className="text-center">
            <div className="flex justify-between items-center mb-1">
              <Link to="/strain" className="text-xs text-whoop-white/50 hover:text-whoop-white flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                <span>Details</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-whoop-white/50 hover:text-whoop-white">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                    <p>Strain measures your cardiovascular load on a scale of 0-21, based on heart rate and activity.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="font-din text-4xl font-bold text-whoop-blue mb-1">
              {typeof strainScore === 'number' ? strainScore.toFixed(1) : '--'}
            </p>
            <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
              Strain {getTrendIndicator(strainScore, previousWeekStrain)}
            </p>
          </div>

          {/* Sleep */}
          <div className="text-center">
            <div className="flex justify-between items-center mb-1">
              <Link to="/sleep" className="text-xs text-whoop-white/50 hover:text-whoop-white flex items-center">
                <Moon className="h-3 w-3 mr-1" />
                <span>Details</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-whoop-white/50 hover:text-whoop-white">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                    <p>Sleep Performance shows how your actual sleep compares to your sleep need, based on strain, sleep debt, and baseline need.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="font-din text-4xl font-bold text-whoop-white mb-1">
              {sleepPerformance > 0 ? `${Math.round(sleepPerformance)}%` : '--'}
            </p>
            <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
              Sleep Performance {getTrendIndicator(sleepPerformance, previousWeekSleep)}
            </p>
          </div>

          {/* HRV */}
          <div className="text-center">
            <div className="flex justify-end items-center mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-whoop-white/50 hover:text-whoop-white">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                    <p>Heart Rate Variability (HRV) is the variation in time between heartbeats. Higher values typically indicate better recovery.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="font-din text-4xl font-bold text-whoop-white mb-1">
              {hrv ? Math.round(hrv) : '--'}
            </p>
            <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
              HRV
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className={`p-3 rounded ${getRecoveryBgColor(recoveryScore)} text-center animate-fadeIn`}>
        <p className={`text-sm ${getRecoveryColor(recoveryScore)} font-medium`}>
          {getStatusSummary(recoveryScore)}
        </p>
      </div>

      {/* Personalized Insight */}
      <Card className="bg-whoop-black/40 backdrop-blur-sm border-whoop-white/10">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-whoop-teal/20 p-2 rounded-full">
              <Info className="h-5 w-5 text-whoop-teal" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-whoop-white mb-1">Today's Insight</h3>
              <p className="text-sm text-whoop-white/70">
                {getPersonalizedInsight(recoveryScore, strainScore, sleepPerformance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyOverview;
