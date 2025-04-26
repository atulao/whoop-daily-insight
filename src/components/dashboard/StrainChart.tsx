
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
      <div className="chart-tooltip">
        <p className="font-semibold">{formatDate(data.date)}</p>
        <p className="text-sm">Recovery: <span className="font-semibold">{data.recovery}%</span></p>
        <p className="text-sm">Strain: <span className="font-semibold">{data.actualStrain.toFixed(1)}</span></p>
        <p className="text-sm">Target: <span className="font-semibold">{data.strainTarget.min}-{data.strainTarget.max}</span></p>
      </div>
    );
  }
  return null;
};

const StrainChart: React.FC<StrainChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>7-Day Strain vs. Recovery</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                yAxisId="left" 
                domain={[0, 21]} 
                tick={{ fontSize: 12 }}
                stroke="#888"
                label={{ value: 'Strain', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#888', fontSize: 12 } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                stroke="#888"
                label={{ value: 'Recovery %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#888', fontSize: 12 } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {data.map((item, index) => (
                <ReferenceLine
                  key={`target-${index}`}
                  yAxisId="left"
                  segment={[
                    { x: item.date, y: item.strainTarget.min },
                    { x: item.date, y: item.strainTarget.max }
                  ]}
                  stroke="#888"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
              ))}
              <Bar 
                yAxisId="left" 
                dataKey="actualStrain" 
                name="Actual Strain"
                fill="#1A1F2C" 
                radius={[4, 4, 0, 0]} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="recovery" 
                name="Recovery %" 
                stroke="#8884d8" 
                strokeWidth={2} 
                dot={{ fill: '#8884d8', r: 4 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainChart;
