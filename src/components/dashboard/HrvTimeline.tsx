import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WhoopRecovery } from "@/services/whoopService";

interface HrvTimelineProps {
  data: WhoopRecovery[] | null | undefined;
}

const HrvTimeline: React.FC<HrvTimelineProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Transform data for chart display
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    return data.map(recovery => ({
      date: recovery.created_at,
      hrv: recovery.score?.hrv_rmssd_milli ?? 0
    })).filter(item => item.hrv > 0);
  }, [data]);

  return (
    <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="flex justify-between items-center uppercase tracking-whoop text-whoop-white">
          <span>HRV Timeline</span>
        </CardTitle>
        <p className="text-xs text-whoop-white/50 mt-1">7-Day Heart Rate Variability</p>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#FFFFFF33"
                tick={{ fill: "#FFFFFF99", fontSize: 12 }}
              />
              <YAxis
                stroke="#FFFFFF33"
                tick={{ fill: "#FFFFFF99", fontSize: 12 }}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-whoop-black p-3 border border-whoop-white/10 rounded-md shadow-lg">
                        <p className="font-sans uppercase tracking-whoop text-whoop-white mb-1">
                          {formatDate(payload[0].payload.date)}
                        </p>
                        <p className="text-sm text-whoop-white/70">
                          HRV: <span className="font-din font-bold text-whoop-white">{payload[0].value}ms</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#00F19F"
                strokeWidth={2}
                dot={{ fill: '#00F19F', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HrvTimeline;
