
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
    green: 'text-whoop-recovery-high border-whoop-recovery-high',
    yellow: 'text-whoop-recovery-med border-whoop-recovery-med',
    red: 'text-whoop-recovery-low border-whoop-recovery-low',
  };

  const zoneText = {
    green: 'OPTIMAL',
    yellow: 'ADEQUATE',
    red: 'LOW',
  };

  return (
    <Card className="overflow-hidden border-2 bg-whoop-black/80 backdrop-blur-sm">
      <CardHeader className="bg-whoop-black border-b border-whoop-white/10">
        <CardTitle className="flex justify-between items-center">
          <span className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">Recovery</span>
          <span className="font-din text-xl font-bold text-whoop-white">{recovery}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-6">
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.1)" 
                strokeWidth="10" 
              />
              {/* Progress circle */}
              <circle 
                className="transition-all duration-700 ease-out"
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={zone === 'green' ? '#16EC06' : zone === 'yellow' ? '#FFDE00' : '#FF0026'} 
                strokeWidth="10" 
                strokeDasharray={`${recovery * 2.83} 283`}
                strokeLinecap="round"
              />
              {/* Center text group */}
              <g className="transform rotate-90">
                <text 
                  x="50" 
                  y="45" 
                  textAnchor="middle" 
                  className="font-din text-[2.5rem] font-bold fill-whoop-white"
                >
                  {recovery}
                </text>
                <text 
                  x="50" 
                  y="65" 
                  textAnchor="middle" 
                  className="font-sans text-[0.875rem] font-bold uppercase tracking-whoop fill-whoop-white/70"
                >
                  {zoneText[zone]}
                </text>
              </g>
            </svg>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">
            Recommended Strain
          </h3>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "font-din text-4xl font-bold",
              zone === 'green' ? 'text-whoop-recovery-high' : 
              zone === 'yellow' ? 'text-whoop-recovery-med' : 
              'text-whoop-recovery-low'
            )}>
              {strainTarget.min}-{strainTarget.max}
            </span>
          </div>
          <p className="text-sm text-whoop-white/70 font-sans">
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
