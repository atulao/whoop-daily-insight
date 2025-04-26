
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine 
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  recovery: number;
  recoveryZone: 'green' | 'yellow' | 'red';
  strainTarget: { min: number; max: number };
  actualStrain: number;
  capacity: number;
}

interface StrainChartProps {
  data: DataPoint[];
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-whoop-black p-3 border border-whoop-white/10 rounded-md shadow-lg">
        <p className="font-sans uppercase tracking-whoop text-whoop-white mb-1">{formatDate(data.date)}</p>
        <p className="text-sm text-whoop-white/70">Recovery: <span className="font-din font-bold text-whoop-white">{data.recovery}%</span></p>
        <p className="text-sm text-whoop-white/70">Strain: <span className="font-din font-bold text-whoop-white">{data.actualStrain.toFixed(1)}</span></p>
        <p className="text-sm text-whoop-white/70">Target: <span className="font-din font-bold text-whoop-white">{data.strainTarget.min}-{data.strainTarget.max}</span></p>
      </div>
    );
  }
  return null;
};

const StrainChart: React.FC<StrainChartProps> = ({ data }) => {
  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="flex justify-between items-center uppercase tracking-whoop text-whoop-white">
          <span>7-Day Strain vs. Recovery</span>
        </CardTitle>
        <p className="text-xs text-whoop-white/50 mt-1">Data by WHOOP</p>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "#FFFFFF99" }}
                stroke="#FFFFFF33"
              />
              <YAxis 
                yAxisId="left" 
                domain={[0, 21]} 
                tick={{ fontSize: 12, fill: "#FFFFFF99" }}
                stroke="#FFFFFF33"
                label={{ value: 'STRAIN', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#FFFFFF99', fontSize: 12, fontFamily: 'Proxima Nova, sans-serif', letterSpacing: '0.1em' } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: "#FFFFFF99" }}
                stroke="#FFFFFF33"
                label={{ value: 'RECOVERY %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#FFFFFF99', fontSize: 12, fontFamily: 'Proxima Nova, sans-serif', letterSpacing: '0.1em' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => {
                  return <span className="text-xs uppercase tracking-whoop text-whoop-white/70">{value}</span>
                }}
              />
              {data.map((item, index) => (
                <ReferenceLine
                  key={`target-${index}`}
                  yAxisId="left"
                  segment={[
                    { x: item.date, y: item.strainTarget.min },
                    { x: item.date, y: item.strainTarget.max }
                  ]}
                  stroke={
                    item.recoveryZone === 'green' 
                      ? '#16EC06' 
                      : item.recoveryZone === 'yellow' 
                        ? '#FFDE00' 
                        : '#FF0026'
                  }
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
              ))}
              <Bar 
                yAxisId="left" 
                dataKey="actualStrain" 
                name="Actual Strain"
                fill="#0093E7" 
                radius={[4, 4, 0, 0]} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="recovery" 
                name="Recovery %" 
                stroke="#FFFFFF" 
                strokeWidth={2} 
                dot={{ fill: '#FFFFFF', r: 4, strokeWidth: 0 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainChart;
