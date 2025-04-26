
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecoveryCardProps {
  recovery: number;
  zone: 'green' | 'yellow' | 'red';
  strainTarget: {
    min: number;
    max: number;
  };
}

const RecoveryCard: React.FC<RecoveryCardProps> = ({ 
  recovery, 
  zone,
  strainTarget
}) => {
  const zoneColors = {
    green: 'bg-whoop-recovery-high border-whoop-recovery-high',
    yellow: 'bg-whoop-recovery-med border-whoop-recovery-med',
    red: 'bg-whoop-recovery-low border-whoop-recovery-low',
  };

  const zoneText = {
    green: 'OPTIMAL',
    yellow: 'ADEQUATE',
    red: 'LOW',
  };

  return (
    <Card className={`overflow-hidden border-2 ${zone === 'green' ? 'border-whoop-recovery-high' : zone === 'yellow' ? 'border-whoop-recovery-med' : 'border-whoop-recovery-low'}`}>
      <CardHeader className={cn("text-whoop-white", `bg-whoop-black`)}>
        <CardTitle className="flex justify-between items-center">
          <span className="uppercase tracking-whoop text-sm font-semibold">RECOVERY</span>
          <span className="text-lg">{recovery}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#2A2A2A" 
                strokeWidth="8" 
              />
              <circle 
                className="recovery-circle" 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={zone === 'green' ? '#16EC06' : zone === 'yellow' ? '#FFDE00' : '#FF0026'} 
                strokeWidth="8" 
                strokeDasharray={`${recovery * 2.83} 283`} 
                strokeDashoffset="0" 
                strokeLinecap="round" 
                transform="rotate(-90 50 50)" 
              />
              <text 
                x="50" 
                y="45" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="font-din text-6xl font-bold"
                fill="currentColor"
              >
                {recovery}
              </text>
              <text 
                x="50" 
                y="65" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="uppercase text-xs tracking-whoop"
                fill="currentColor"
              >
                {zoneText[zone]}
              </text>
            </svg>
          </div>
        </div>
        
        <div className="text-center mt-4 mb-2">
          <h3 className="uppercase tracking-whoop text-base mb-2">RECOMMENDED STRAIN</h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className={cn(
              "font-din text-3xl font-bold", 
              zone === 'green' ? 'text-whoop-recovery-high' : 
              zone === 'yellow' ? 'text-whoop-recovery-med' : 
              'text-whoop-recovery-low'
            )}>
              {strainTarget.min}-{strainTarget.max}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {zone === 'green' 
              ? 'Your body is ready for high-intensity training today.' 
              : zone === 'yellow' 
                ? 'Moderate exercise recommended today.' 
                : 'Take it easy today. Focus on recovery.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecoveryCard;
