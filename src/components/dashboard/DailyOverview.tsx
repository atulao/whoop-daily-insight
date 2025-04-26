import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WhoopRecovery, WhoopStrain, WhoopSleep } from "@/services/whoopService";

interface DailyOverviewProps {
  latestRecovery: WhoopRecovery | null | undefined;
  latestStrain: WhoopStrain | null | undefined;
  latestSleep: WhoopSleep | null | undefined;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({ 
  latestRecovery, 
  latestStrain, 
  latestSleep
}) => {
  const getRecoveryColor = (value: number) => {
    if (value >= 67) return 'text-whoop-recovery-high';
    if (value >= 34) return 'text-whoop-recovery-med';
    return 'text-whoop-recovery-low';
  };

  const recoveryScore = latestRecovery?.score ?? 0;
  const strainScore = latestStrain?.score ?? 0;
  const sleepPerformance = latestSleep?.qualityDuration && latestSleep?.sleepNeed 
                           ? Math.round((latestSleep.qualityDuration / latestSleep.sleepNeed) * 100)
                           : 0;
  const hrv = latestRecovery?.hrvMs ?? 0;

  return (
    <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        <div className="text-center">
          <p className={`font-din text-4xl font-bold ${getRecoveryColor(recoveryScore)} mb-1`}>
            {recoveryScore}%
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            Recovery
          </p>
        </div>

        <div className="text-center">
          <p className="font-din text-4xl font-bold text-whoop-blue mb-1">
            {strainScore.toFixed(1)}
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            Strain
          </p>
        </div>

        <div className="text-center">
          <p className="font-din text-4xl font-bold text-whoop-white mb-1">
            {sleepPerformance > 0 ? `${sleepPerformance}%` : '--'}
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            Sleep Performance
          </p>
        </div>

        <div className="text-center">
          <p className="font-din text-4xl font-bold text-whoop-white mb-1">
            {hrv}
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            HRV
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyOverview;
