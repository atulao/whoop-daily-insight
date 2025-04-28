import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Moon } from 'lucide-react';

interface BedtimeTrackerProps {
  sleepData: WhoopSleep[] | null | undefined;
}

const BedtimeTracker: React.FC<BedtimeTrackerProps> = ({ sleepData }) => {
  // Process sleep data to get bedtimes
  const bedtimeData = React.useMemo(() => {
    if (!sleepData || sleepData.length === 0) return [];
    
    // Get last 7 days of data
    const recentSleepData = [...sleepData]
      .filter(item => item.start_time)
      .slice(-7);
    
    // Convert to chart data format
    const chartData = recentSleepData.map(sleep => {
      const startTime = new Date(sleep.start_time);
      const bedTimeHour = startTime.getHours() + (startTime.getMinutes() / 60);
      
      // Adjust for times after midnight (early AM)
      const adjustedHour = bedTimeHour < 12 ? bedTimeHour + 24 : bedTimeHour;
      
      // Format the time for display
      const formattedTime = formatTime(startTime);
      const sleepDate = new Date(sleep.created_at);
      
      return {
        date: sleepDate,
        dateStr: sleepDate.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: sleepDate.toLocaleDateString(),
        bedTimeHour: adjustedHour,
        formattedTime: formattedTime
      };
    });
    
    // Sort by date (oldest to newest)
    return chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sleepData]);
  
  // Format time as HH:MM AM/PM
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
  
  // Get average bedtime
  const averageBedtime = React.useMemo(() => {
    if (bedtimeData.length === 0) return "N/A";
    
    const totalHours = bedtimeData.reduce((total, item) => total + item.bedTimeHour, 0);
    const avgHour = totalHours / bedtimeData.length;
    
    // Convert back to regular time
    const adjustedHour = avgHour >= 24 ? avgHour - 24 : avgHour;
    
    // Create a date object to format the time
    const date = new Date();
    date.setHours(Math.floor(adjustedHour));
    date.setMinutes(Math.round((adjustedHour % 1) * 60));
    
    return formatTime(date);
  }, [bedtimeData]);
  
  // Get latest bedtime
  const latestBedtime = React.useMemo(() => {
    if (bedtimeData.length === 0) return "N/A";
    return bedtimeData[bedtimeData.length - 1].formattedTime;
  }, [bedtimeData]);
  
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
            Bedtime: <span className="text-indigo-400">{data.formattedTime}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom formatter for the y-axis to show hours
  const formatYAxis = (value: number) => {
    if (value >= 24) {
      // Convert hours after midnight back to AM format
      const hour = value - 24;
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    } else {
      // Show PM hours
      if (value === 12) return '12 PM';
      return value < 12 ? `${value} AM` : `${value - 12} PM`;
    }
  };

  if (!sleepData || bedtimeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No bedtime data available
      </div>
    );
  }

  return (
    <div className="text-whoop-white">
      <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm mb-4">BEDTIME TRACKER</h3>
      
      <div className="bg-whoop-black/40 rounded-lg p-4 border border-whoop-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-whoop-white/60">Last Bedtime</p>
            </div>
            <p className="text-3xl font-bold text-indigo-400">{latestBedtime}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-4 w-4 text-whoop-white/60" />
              <p className="text-xs text-whoop-white/60">Average Bedtime</p>
            </div>
            <p className="text-lg font-medium text-whoop-white/80">{averageBedtime}</p>
          </div>
        </div>
        
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={bedtimeData}
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
                tickFormatter={formatYAxis}
                stroke="#FFFFFF10"
                axisLine={{ stroke: "#FFFFFF15" }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickMargin={8}
                reversed
                label={{ 
                  value: 'Bedtime', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#FFFFFF50',
                  fontSize: 10,
                  offset: -5
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="bedTimeHour" 
                stroke="#a78bfa" 
                strokeWidth={2}
                dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#c4b5fd' }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 p-4 border border-whoop-white/10 rounded-md bg-gradient-to-r from-whoop-black/40 to-whoop-black/60">
          <p className="text-sm text-whoop-white/80 font-medium">
            Going to bed at a consistent time helps establish a healthy sleep rhythm.
            Your average bedtime is {averageBedtime}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BedtimeTracker; 