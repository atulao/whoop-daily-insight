import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface StrainCardProps {
  strain: number;
  avgHeartRate: number;
  maxHeartRate: number;
}

const StrainCard: React.FC<StrainCardProps> = ({ 
  strain, 
  avgHeartRate,
  maxHeartRate
}) => {
  const getStrainDescription = (strain: number): string => {
    if (strain >= 18) return 'EXTREME';
    if (strain >= 14) return 'HIGH';
    if (strain >= 8) return 'MODERATE';
    if (strain >= 4) return 'LOW';
    return 'MINIMAL';
  };
  
  const getStrainPercentage = (strain: number): number => {
    // Max strain is 21
    return Math.min((strain / 21) * 100, 100);
  };

  return (
    <Card className="overflow-hidden border-2 bg-whoop-black/80 backdrop-blur-sm">
      <CardHeader className="bg-whoop-black border-b border-whoop-white/10">
        <CardTitle className="flex justify-between items-center">
          <span className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">Day Strain</span>
          <span className="font-din text-xl font-bold text-whoop-white">{strain.toFixed(1)}</span>
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
                stroke="#0093E7" 
                strokeWidth="10" 
                strokeDasharray={`${getStrainPercentage(strain) * 2.83} 283`}
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
                  {strain.toFixed(1)}
                </text>
                <text 
                  x="50" 
                  y="65" 
                  textAnchor="middle" 
                  className="font-sans text-[0.875rem] font-bold uppercase tracking-whoop fill-whoop-white/70"
                >
                  {getStrainDescription(strain)}
                </text>
              </g>
            </svg>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">
            Heart Rate
          </h3>
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-xs text-whoop-white/70 mb-1">Avg HR</div>
              <div className="text-whoop-blue font-din text-2xl font-bold">
                {avgHeartRate ? Math.round(avgHeartRate) : '--'} <span className="text-sm">bpm</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-whoop-white/70 mb-1">Max HR</div>
              <div className="text-whoop-blue font-din text-2xl font-bold">
                {maxHeartRate ? Math.round(maxHeartRate) : '--'} <span className="text-sm">bpm</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-whoop-white/70 font-sans mt-4">
            {strain < 8 ? 
              'Low cardiovascular load today. Good for recovery.' :
              strain < 14 ? 
                'Moderate effort today. Good balance of activity and recovery.' : 
                'High cardiovascular strain today. Consider recovery tomorrow.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainCard; 