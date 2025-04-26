
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DailyOverviewProps {
  recovery: number;
  strain: number;
  sleepPerformance: number;
  hrv: number;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({ 
  recovery, 
  strain, 
  sleepPerformance,
  hrv 
}) => {
  const getRecoveryColor = (value: number) => {
    if (value >= 67) return 'text-whoop-recovery-high';
    if (value >= 34) return 'text-whoop-recovery-med';
    return 'text-whoop-recovery-low';
  };

  return (
    <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        <div className="text-center">
          <p className={`font-din text-4xl font-bold ${getRecoveryColor(recovery)} mb-1`}>
            {recovery}%
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            Recovery
          </p>
        </div>

        <div className="text-center">
          <p className="font-din text-4xl font-bold text-whoop-blue mb-1">
            {strain}
          </p>
          <p className="font-sans text-sm uppercase tracking-whoop text-whoop-white/70">
            Strain
          </p>
        </div>

        <div className="text-center">
          <p className="font-din text-4xl font-bold text-whoop-white mb-1">
            {sleepPerformance}%
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
