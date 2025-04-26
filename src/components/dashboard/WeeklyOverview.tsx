
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeeklyOverviewProps {
  data: Array<{
    date: string;
    recovery: number;
    strain: number;
    sleep: number;
  }>;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ data }) => {
  const metrics = [
    { 
      label: "Avg Recovery", 
      value: Math.round(data.reduce((acc, curr) => acc + curr.recovery, 0) / data.length),
      unit: "%"
    },
    { 
      label: "Avg Strain", 
      value: Math.round(data.reduce((acc, curr) => acc + curr.strain, 0) / data.length * 10) / 10,
      unit: ""
    },
    { 
      label: "Avg Sleep", 
      value: Math.round(data.reduce((acc, curr) => acc + curr.sleep, 0) / data.length * 10) / 10,
      unit: "hrs"
    }
  ];

  return (
    <Card className="h-full bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardHeader className="border-b border-whoop-white/10">
        <CardTitle className="font-sans text-sm font-bold uppercase tracking-whoop text-whoop-white/90">
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-whoop-black/40"
            >
              <span className="font-din text-3xl font-bold text-whoop-white mb-2">
                {metric.value}{metric.unit}
              </span>
              <span className="font-sans text-sm font-semibold text-whoop-white/70 text-center">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;
