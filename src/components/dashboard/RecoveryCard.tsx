
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
    green: 'bg-whoop-green',
    yellow: 'bg-whoop-yellow',
    red: 'bg-whoop-red',
  };

  const zoneText = {
    green: 'OPTIMAL',
    yellow: 'ADEQUATE',
    red: 'LOW',
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("text-white", `bg-whoop-${zone}`)}>
        <CardTitle className="flex justify-between">
          <span>Today's Recovery</span>
          <span>{recovery}%</span>
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
                stroke="#e2e8f0" 
                strokeWidth="8" 
              />
              <circle 
                className="recovery-circle" 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={zone === 'green' ? '#4CAF50' : zone === 'yellow' ? '#FFC107' : '#FF5252'} 
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
                className="text-3xl font-bold"
                fill="currentColor"
              >
                {recovery}%
              </text>
              <text 
                x="50" 
                y="65" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xs"
                fill="currentColor"
              >
                {zoneText[zone]}
              </text>
            </svg>
          </div>
        </div>
        
        <div className="text-center mt-4 mb-2">
          <h3 className="text-lg font-semibold">Recommended Strain</h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className={cn(
              "text-3xl font-bold", 
              zone === 'green' ? 'text-whoop-green' : 
              zone === 'yellow' ? 'text-whoop-yellow' : 
              'text-whoop-red'
            )}>
              {strainTarget.min}-{strainTarget.max}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {zone === 'green' 
              ? 'Your body is ready for a high-intensity workout today.' 
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
