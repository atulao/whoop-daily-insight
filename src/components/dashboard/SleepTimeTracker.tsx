import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Clock, Zap } from 'lucide-react';

interface SleepTimeTrackerProps {
  sleepData: WhoopSleep[] | null | undefined;
}

const SleepTimeTracker: React.FC<SleepTimeTrackerProps> = ({ sleepData }) => {
  // Process sleep data to get sleep durations
  const sleepTimeData = React.useMemo(() => {
    if (!sleepData || sleepData.length === 0) return [];
    
    // Get last 7 days of data
    const recentSleepData = [...sleepData]
      .filter(item => item.hours_asleep && item.created_at)
      .slice(-7);
    
    // Convert to chart data format
    const chartData = recentSleepData.map(sleep => {
      const sleepDate = new Date(sleep.created_at);
      const hoursSlept = sleep.hours_asleep;
      
      return {
        date: sleepDate,
        dateStr: sleepDate.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: sleepDate.toLocaleDateString(),
        hoursSlept,
        formattedTime: formatHoursToTime(hoursSlept)
      };
    });
    
    // Sort by date (oldest to newest)
    return chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sleepData]);
  
  // Format hours to HH:MM format
  function formatHoursToTime(hours: number): string {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}h ${minutes}m`;
  }
  
  // Calculate average sleep time
  const averageSleepTime = React.useMemo(() => {
    if (sleepTimeData.length === 0) return "N/A";
    
    const totalHours = sleepTimeData.reduce((total, item) => total + item.hoursSlept, 0);
    const averageHours = totalHours / sleepTimeData.length;
    
    return formatHoursToTime(averageHours);
  }, [sleepTimeData]);
  
  // Get latest sleep time
  const latestSleepTime = React.useMemo(() => {
    if (sleepTimeData.length === 0) return "N/A";
    return sleepTimeData[sleepTimeData.length - 1].formattedTime;
  }, [sleepTimeData]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-black/80 p-3 border border-gray-700/50 rounded-md shadow-xl">
          <p className="font-sans text-whoop-white mb-1 font-semibold">
            {data.date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-whoop-white/70 text-sm">
            Sleep time: <span className="text-teal-400">{data.formattedTime}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!sleepData || sleepTimeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No sleep time data available
      </div>
    );
  }

  return (
    <div className="text-whoop-white">
      <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm mb-4">SLEEP TIME TRACKER</h3>
      
      <div className="bg-whoop-black/40 rounded-lg p-4 border border-whoop-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-teal-400" />
              <p className="text-xs text-whoop-white/60">Last Sleep Time</p>
            </div>
            <p className="text-3xl font-bold text-teal-400">{latestSleepTime}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-whoop-white/60" />
              <p className="text-xs text-whoop-white/60">Average Sleep</p>
            </div>
            <p className="text-lg font-medium text-whoop-white/80">{averageSleepTime}</p>
          </div>
        </div>
        
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sleepTimeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.1} />
              <XAxis 
                dataKey="dateStr" 
                tick={{ fontSize: 10, fill: "#FFFFFF80" }}
                stroke="#FFFFFF10"
                axisLine={{ stroke: "#FFFFFF15" }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "#FFFFFF80" }}
                stroke="#FFFFFF10"
                axisLine={{ stroke: "#FFFFFF15" }}
                tickMargin={8}
                domain={[0, 'dataMax + 1']}
                label={{ 
                  value: 'Hours', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#FFFFFF50',
                  fontSize: 10,
                  offset: -5
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hoursSlept" 
                fill="#5eead4" 
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 p-4 border border-whoop-white/10 rounded-md bg-gradient-to-r from-whoop-black/40 to-whoop-black/60">
          <p className="text-sm text-whoop-white/80 font-medium">
            Most adults need 7-9 hours of sleep per night for optimal health.
            Your average sleep time is {averageSleepTime}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SleepTimeTracker; 