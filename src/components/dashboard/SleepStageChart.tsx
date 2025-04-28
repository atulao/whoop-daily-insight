import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WhoopSleep } from '@/services/whoopService';
import { formatDuration } from '@/pages/utils/formatters';

interface SleepStageChartProps {
  sleepData: WhoopSleep | null | undefined;
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

const SleepStageChart: React.FC<SleepStageChartProps> = ({ sleepData }) => {
  // Transform sleep data for the chart
  const chartData = React.useMemo(() => {
    if (!sleepData?.score?.stage_summary) {
      return [];
    }

    const summary = sleepData.score.stage_summary;
    
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
      },
      {
        name: 'Awake',
        value: summary.total_awake_time_milli,
        percentage: formatPercentage(summary.total_awake_time_milli, total),
        ...getHoursMinutes(summary.total_awake_time_milli),
        color: SLEEP_STAGE_COLORS.awake
      },
      {
        name: 'No Data',
        value: summary.total_no_data_time_milli,
        percentage: formatPercentage(summary.total_no_data_time_milli, total),
        ...getHoursMinutes(summary.total_no_data_time_milli),
        color: SLEEP_STAGE_COLORS.noData
      }
    ].filter(item => item.value > 0); // Only include stages with non-zero values
  }, [sleepData]);

  if (!sleepData?.score?.stage_summary || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No sleep stage data available
      </div>
    );
  }

  // Calculate some sleep metrics
  const totalSleepTime = sleepData.score.stage_summary.total_in_bed_time_milli;
  const formattedTotal = formatDuration(totalSleepTime / 1000);
  const cyclesCount = sleepData.score.stage_summary.sleep_cycle_count;
  const disturbances = sleepData.score.stage_summary.disturbance_count;

  return (
    <div className="text-whoop-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm">SLEEP STAGES</h3>
        <div className="text-xs text-whoop-white/60">
          <span className="mr-4">Cycles: {cyclesCount}</span>
          <span>Disturbances: {disturbances}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 sleep-stage-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={false}
                stroke="#121212"
                strokeWidth={1.5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center sleep-stage-legend">
          <div className="grid gap-3">
            <div className="p-2 bg-whoop-black/40 rounded-md">
              <p className="text-xs text-whoop-white/60 mb-1">Total Sleep Time</p>
              <p className="text-xl font-bold">{formattedTotal}</p>
            </div>
            
            <div className="space-y-3">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <div className="text-sm text-whoop-white/90">
                    {entry.hours}h {entry.minutes}m
                    <span className="ml-2 text-xs text-whoop-white/70">({entry.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepStageChart; 