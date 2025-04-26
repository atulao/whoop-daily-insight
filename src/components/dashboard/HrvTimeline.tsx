
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface HrvTimelineProps {
  data: Array<{
    date: string;
    hrv: number;
  }>;
}

const HrvTimeline: React.FC<HrvTimelineProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HRV Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium">Date:</span>
                          <span>{formatDate(payload[0].payload.date)}</span>
                          <span className="font-medium">HRV:</span>
                          <span>{payload[0].value}ms</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HrvTimeline;
