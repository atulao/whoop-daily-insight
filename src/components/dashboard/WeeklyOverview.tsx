
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
    { label: "Avg Recovery", value: Math.round(data.reduce((acc, curr) => acc + curr.recovery, 0) / data.length) },
    { label: "Avg Strain", value: Math.round(data.reduce((acc, curr) => acc + curr.strain, 0) / data.length * 10) / 10 },
    { label: "Avg Sleep", value: Math.round(data.reduce((acc, curr) => acc + curr.sleep, 0) / data.length * 10) / 10 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/20 transition-all duration-300 hover:bg-secondary/30"
            >
              <span className="text-3xl font-bold mb-2">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;
