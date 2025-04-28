import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info } from 'lucide-react';

interface RespiratoryRateChartProps {
  sleepData: WhoopSleep[] | null | undefined;
}

const RespiratoryRateChart: React.FC<RespiratoryRateChartProps> = ({ sleepData }) => {
  // Extract respiratory rate data from sleep data
  const respiratoryData = React.useMemo(() => {
    if (!sleepData || sleepData.length === 0) return [];
    
    // Get last 7 days of data with respiratory rate
    const validSleepData = [...sleepData]
      .filter(item => item?.score?.respiratory_rate)
      .slice(-7)
      .reverse(); // Reverse to show oldest to newest
    
    return validSleepData.map(sleep => {
      const date = new Date(sleep.created_at);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString(),
        respiratoryRate: sleep.score?.respiratory_rate || 0
      };
    });
  }, [sleepData]);
  
  // Calculate average respiratory rate
  const averageRespiratoryRate = React.useMemo(() => {
    if (respiratoryData.length === 0) return 0;
    
    const total = respiratoryData.reduce(
      (sum, item) => sum + item.respiratoryRate, 
      0
    );
    
    return total / respiratoryData.length;
  }, [respiratoryData]);
  
  // Get most recent respiratory rate
  const currentRespiratoryRate = respiratoryData.length > 0 
    ? respiratoryData[respiratoryData.length - 1].respiratoryRate 
    : 0;
  
  // Format respiratory rate for display
  const formatRespiratoryRate = (value: number) => {
    return value.toFixed(1);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-black/80 p-3 border border-gray-700/50 rounded-md shadow-xl">
          <p className="font-sans text-whoop-white mb-1 font-semibold">{data.fullDate}</p>
          <p className="text-whoop-white/70 text-sm">
            <span className="text-blue-400">{data.respiratoryRate.toFixed(1)}</span> breaths/min
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Is the current respiratory rate unusual?
  const isUnusual = React.useMemo(() => {
    // If rate is more than 15% above or below average, flag it as unusual
    if (averageRespiratoryRate === 0 || currentRespiratoryRate === 0) return false;
    
    const percentDiff = Math.abs(currentRespiratoryRate - averageRespiratoryRate) / averageRespiratoryRate * 100;
    return percentDiff > 15;
  }, [currentRespiratoryRate, averageRespiratoryRate]);

  if (!sleepData || respiratoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No respiratory rate data available
      </div>
    );
  }

  return (
    <div className="text-whoop-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm">RESPIRATORY RATE</h3>
        <div className="text-xs text-whoop-white/60">
          breaths per minute
        </div>
      </div>

      <div className="bg-whoop-black/40 rounded-lg p-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Current</p>
            <p className={`text-3xl font-bold ${isUnusual ? 'text-amber-400' : 'text-blue-400'}`}>
              {formatRespiratoryRate(currentRespiratoryRate)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-whoop-white/60 mb-1">Average</p>
            <p className="text-lg font-medium text-whoop-white/80">
              {formatRespiratoryRate(averageRespiratoryRate)}
            </p>
          </div>
        </div>
        
        <div className="h-40 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={respiratoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: "#FFFFFF80" }}
                axisLine={{ stroke: "#FFFFFF15" }}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 10, fill: "#FFFFFF80" }}
                axisLine={{ stroke: "#FFFFFF15" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={averageRespiratoryRate} stroke="#FFFFFF40" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="respiratoryRate" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 4 }}
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#FFFFFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {isUnusual && (
          <div className="flex items-start mt-2 p-3 border border-amber-500/30 rounded-md bg-amber-500/10">
            <Info size={16} className="text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-whoop-white/80">
              Your respiratory rate is significantly different from your average. 
              Variations can be caused by stress, illness, or intense training.
            </p>
          </div>
        )}
        
        {!isUnusual && (
          <div className="mt-2 text-xs text-whoop-white/60">
            <p>
              Respiratory rate is your breathing frequency during sleep.
              Consistent rates indicate good recovery and overall health.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RespiratoryRateChart; 