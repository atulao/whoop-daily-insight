import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Moon, ArrowRight, Info } from "lucide-react";
import { WhoopSleep } from "@/services/whoopService";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface SleepSummaryProps {
  latestSleep: WhoopSleep | null | undefined;
}

const SLEEP_STAGE_COLORS = {
  rem: '#8884d8',       // Purple for REM
  deep: '#4169e1',      // Royal blue for deep sleep
  light: '#82ca9d',     // Green for light sleep
  awake: '#ff8042',     // Orange for awake
  noData: '#d3d3d3'     // Gray for no data
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/80 p-3 border border-gray-700/50 rounded-md shadow-xl">
        <p className="font-sans text-whoop-white mb-1 font-semibold">{data.name}</p>
        <p className="text-whoop-white/70 text-sm">
          {data.hours}h {data.minutes}m
          <span className="ml-2">({data.percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const SleepSummary: React.FC<SleepSummaryProps> = ({ latestSleep }) => {
  // Format the sleep duration
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get sleep duration from the stage summary
  const sleepDuration = latestSleep?.score?.stage_summary?.total_in_bed_time_milli
    ? formatDuration(latestSleep.score.stage_summary.total_in_bed_time_milli)
    : "--:--";
    
  // Get sleep and wake times
  const sleepTime = latestSleep?.start ? formatTime(latestSleep.start) : "--:--";
  const wakeTime = latestSleep?.end ? formatTime(latestSleep.end) : "--:--";
  
  // Get sleep efficiency
  const sleepEfficiency = latestSleep?.score?.sleep_efficiency_percentage ?? 0;
  
  // Determine color based on efficiency
  const getEfficiencyColor = (value: number) => {
    if (value >= 90) return 'text-green-500';
    if (value >= 80) return 'text-blue-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-500';
  };

  // Transform sleep data for the chart
  const chartData = React.useMemo(() => {
    if (!latestSleep?.score?.stage_summary) {
      return [];
    }

    const summary = latestSleep.score.stage_summary;
    
    const total = summary.total_in_bed_time_milli || 1; // Avoid division by zero
    
    const getHoursMinutes = (milliseconds: number) => {
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      return { hours, minutes };
    };

    const formatPercentage = (value: number, total: number) => {
      return Math.round((value / total) * 100);
    };

    return [
      {
        name: 'REM Sleep',
        value: summary.total_rem_sleep_time_milli,
        percentage: formatPercentage(summary.total_rem_sleep_time_milli, total),
        ...getHoursMinutes(summary.total_rem_sleep_time_milli),
        color: SLEEP_STAGE_COLORS.rem
      },
      {
        name: 'Deep Sleep',
        value: summary.total_slow_wave_sleep_time_milli,
        percentage: formatPercentage(summary.total_slow_wave_sleep_time_milli, total),
        ...getHoursMinutes(summary.total_slow_wave_sleep_time_milli),
        color: SLEEP_STAGE_COLORS.deep
      },
      {
        name: 'Light Sleep',
        value: summary.total_light_sleep_time_milli,
        percentage: formatPercentage(summary.total_light_sleep_time_milli, total),
        ...getHoursMinutes(summary.total_light_sleep_time_milli),
        color: SLEEP_STAGE_COLORS.light
      }
    ].filter(item => item.value > 0); // Only include stages with non-zero values
  }, [latestSleep]);

  // No data available
  if (!latestSleep?.score?.stage_summary) {
    return (
      <Card className="bg-gradient-to-b from-whoop-black/80 to-whoop-black border-whoop-white/10 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-sans font-bold text-whoop-white flex items-center justify-between">
            LAST NIGHT'S SLEEP
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button className="text-whoop-white/50 hover:text-whoop-white">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                  <p>Sleep quality metrics showing your sleep stages and efficiency.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-whoop-white/50">No sleep data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-b from-whoop-black/80 to-whoop-black border-whoop-white/10 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-sans font-bold text-whoop-white flex items-center justify-between">
          LAST NIGHT'S SLEEP
          <Link to="/sleep" className="text-xs text-whoop-white/50 hover:text-whoop-white flex items-center">
            <span>Details</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-whoop-black/40 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-whoop-sleep-blue/20 rounded-lg flex items-center justify-center">
              <Moon className="h-5 w-5 text-whoop-sleep-blue" />
            </div>
            <div>
              <p className="font-din text-xl font-bold text-whoop-white">{sleepDuration}</p>
              <p className="text-xs text-whoop-white/70">
                {sleepTime} - {wakeTime}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-whoop-white/70 mb-1 text-right">Efficiency</p>
            <p className={`text-right font-bold ${getEfficiencyColor(sleepEfficiency)}`}>
              {Math.round(sleepEfficiency)}%
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-24 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-whoop-white/50 text-sm">No sleep stage data</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 w-full mt-2 text-center">
            {chartData.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-3 h-3 rounded-full mb-1" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <p className="text-xs text-whoop-white/90">{entry.name.split(' ')[0]}</p>
                <p className="text-xs text-whoop-white/70">{entry.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepSummary; 