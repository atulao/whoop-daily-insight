import React from "react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { WhoopStrain, WhoopRecovery } from "@/services/whoopService";

// Combined data point structure for the chart
interface CombinedDataPoint {
  date: string;
  recovery: number;
  recoveryZone: 'green' | 'yellow' | 'red';
  actualStrain: number;
}

interface StrainChartProps {
  strainData: WhoopStrain[] | null | undefined;
  recoveryData: WhoopRecovery[] | null | undefined;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  // Use current date when displaying in the tooltip to ensure it's accurate
  const now = new Date();
  // Only modify the date for today's data
  const date = new Date(dateStr);
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    // For today's data, use the current date for display
    return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getRecoveryZone = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CombinedDataPoint;
    return (
      <div className="bg-black/80 p-3 border border-gray-700/50 rounded-md shadow-xl">
        <p className="font-sans uppercase tracking-wide text-whoop-white mb-2 font-semibold">{formatDate(data.date)}</p>
        <p className={cn("mb-1.5", 
            data.recoveryZone === 'green' ? "text-whoop-recovery-high" : 
            data.recoveryZone === 'yellow' ? "text-whoop-recovery-med" : "text-whoop-recovery-low"
        )}>
          <span className="text-whoop-white/70 uppercase tracking-wider text-xs mr-2">Recovery</span>
          <span className="font-din font-bold text-lg">{data.recovery}%</span>
        </p>
        <p className="text-whoop-blue">
          <span className="text-whoop-white/70 uppercase tracking-wider text-xs mr-2">Strain</span>
          <span className="font-din font-bold text-lg">{data.actualStrain.toFixed(1)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const StrainChart: React.FC<StrainChartProps> = ({ strainData, recoveryData }) => {
  // Combine strain and recovery data based on date
  const combinedData: CombinedDataPoint[] = React.useMemo(() => {
    if (!strainData || !recoveryData) return [];
    
    // Create a map of dates to recovery data for easy lookup
    const recoveryMap = new Map();
    recoveryData.forEach(item => {
      // Use created_at as recovery data doesn't have start property
      if (item && item.created_at && typeof item.created_at === 'string') {
        try {
          const date = item.created_at.split('T')[0]; // Just use the date part
          recoveryMap.set(date, item);
        } catch (error) {
          console.error("Error processing recovery data:", error);
        }
      }
    });

    // Process and return valid strain data
    return strainData
      .filter(item => item && item.start && typeof item.start === 'string')
      .map(strainItem => {
        try {
          const date = strainItem.start.split('T')[0];
          const recoveryItem = recoveryMap.get(date);
          const recoveryScore = recoveryItem?.score?.recovery_score ?? 0;
          
          return {
            date: date,
            actualStrain: strainItem.score?.strain ?? 0,
            recovery: recoveryScore,
            recoveryZone: getRecoveryZone(recoveryScore),
          };
        } catch (error) {
          console.error("Error processing strain data:", error);
          // Return a placeholder object if error occurs
          return {
            date: "",
            actualStrain: 0,
            recovery: 0,
            recoveryZone: 'red' as const
          };
        }
      })
      .filter(item => item.date) // Filter out items with empty dates (from error handling)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ensure sorted by date
      .slice(-7); // Only show last 7 days

  }, [strainData, recoveryData]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={combinedData} margin={{ top: 10, right: 25, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} vertical={false} />
        <XAxis 
          dataKey="date" 
          tickFormatter={(dateStr) => {
            const now = new Date();
            const date = new Date(dateStr);
            const isToday = date.toDateString() === now.toDateString();
            
            if (isToday) {
              // For today's data, use the current date for display
              return `${now.toLocaleDateString('en-US', { weekday: 'short' })}, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }
            return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          }}
          tick={{ fontSize: 10, fill: "#FFFFFF80" }}
          stroke="#FFFFFF10"
          axisLine={{ stroke: "#FFFFFF15" }}
          tickMargin={8}
        />
        <YAxis 
          yAxisId="left" 
          domain={[0, 21]} 
          tick={{ fontSize: 10, fill: "#FFFFFF80" }}
          stroke="#FFFFFF10"
          axisLine={{ stroke: "#FFFFFF15" }}
          tickMargin={10}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: "#FFFFFF80" }}
          stroke="#FFFFFF10"
          axisLine={{ stroke: "#FFFFFF15" }}
          tickMargin={10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
        <Legend 
          verticalAlign="top" 
          height={20}
          iconSize={8}
          iconType="circle"
          formatter={(value) => {
            return <span className="text-[10px] uppercase tracking-widest text-whoop-white/70 font-medium">{value}</span>
          }}
        />
        <Bar 
          yAxisId="left" 
          dataKey="actualStrain" 
          name="ACTUAL STRAIN"
          fill="rgba(0, 147, 231, 0.65)" 
          radius={[3, 3, 0, 0]}
          maxBarSize={35}
          animationDuration={800}
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="recovery" 
          name="RECOVERY %" 
          stroke="#FFFFFF" 
          strokeWidth={2} 
          dot={(props) => { 
            const { cx, cy, payload } = props;
            const zone = (payload as CombinedDataPoint).recoveryZone;
            const color = zone === 'green' ? '#16EC06' : zone === 'yellow' ? '#FFDE00' : '#FF0026';
            return <circle key={`dot-${payload.date}-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={color} strokeWidth={0} />;
          }}
          activeDot={{ r: 6, strokeWidth: 1, stroke: "#FFFFFF" }}
          animationDuration={1200}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default StrainChart;
