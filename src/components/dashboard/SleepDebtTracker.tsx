import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { formatDuration } from '@/pages/utils/formatters';

interface SleepDebtTrackerProps {
  sleepData: WhoopSleep[] | null | undefined;
}

// Define an interface for the sleep debt data entries
interface SleepDebtEntry {
  date: Date;
  dateStr: string;
  fullDate: string;
  sleepBalance: number;
  rawBalance: number;
  performance: number;
  efficiency: number;
  isProjected?: boolean;
}

const SleepDebtTracker: React.FC<SleepDebtTrackerProps> = ({ sleepData }) => {
  // Calculate the sleep debt over time (last 7 days)
  const sleepDebtData = React.useMemo<SleepDebtEntry[]>(() => {
    if (!sleepData || sleepData.length === 0) return [];
    
    // Get recent sleep data - ensure we have the latest 7 days
    const recentSleepData = [...sleepData]
      .filter(item => item?.score?.sleep_needed)
      .sort((a, b) => new Date(a.end || a.created_at).getTime() - new Date(b.end || b.created_at).getTime())
      .slice(-8); // Get slightly more than 7 to handle any overlaps
    
    console.log('[DEBUG] Recent sleep data for debt calculation:', recentSleepData.map(s => ({
      date: new Date(s.end || s.created_at).toLocaleDateString(),
      performance: s.score?.sleep_performance_percentage
    })));
    
    // Format the data for the chart
    const formattedData = recentSleepData.map(sleep => {
      // WHOOP calculates Sleep Need based on:
      // 1. Baseline (demographic average)
      // 2. Sleep debt from previous nights
      // 3. Recent strain (physical activity)
      // 4. Recent naps (reduction in need)
      const totalNeededMillis = (
        (sleep.score?.sleep_needed.baseline_milli || 0) +
        (sleep.score?.sleep_needed.need_from_sleep_debt_milli || 0) + 
        (sleep.score?.sleep_needed.need_from_recent_strain_milli || 0) + 
        (sleep.score?.sleep_needed.need_from_recent_nap_milli || 0)
      );
      
      // Calculate actual sleep time by subtracting awake time and periods with no data
      // This gives us the true time asleep, not just time in bed
      const actualSleepMillis = (
        (sleep.score?.stage_summary.total_in_bed_time_milli || 0) - 
        (sleep.score?.stage_summary.total_awake_time_milli || 0) - 
        (sleep.score?.stage_summary.total_no_data_time_milli || 0)
      );
      
      // Calculate debt/surplus - positive means surplus, negative means debt
      // WHOOP considers this the difference between your actual sleep and your sleep need
      const sleepBalance = actualSleepMillis - totalNeededMillis;
      
      // Use the actual date from the record, not created_at which might be different
      // WHOOP shows the date of the sleep cycle ending (wake date)
      const date = new Date(sleep.end || sleep.created_at);
      
      return {
        date,
        dateStr: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString(),
        sleepBalance: sleepBalance / (1000 * 60 * 60), // Convert to hours
        rawBalance: sleepBalance,
        // Add sleep performance data for more context
        performance: sleep.score?.sleep_performance_percentage || 0,
        efficiency: sleep.score?.sleep_efficiency_percentage || 0
      } as SleepDebtEntry;
    });
    
    // Fill in missing days in the last week
    const filledData: SleepDebtEntry[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a 7-day range ending on today
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      // Check if we already have this date
      const existingEntry = formattedData.find(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === targetDate.getFullYear() &&
               entryDate.getMonth() === targetDate.getMonth() &&
               entryDate.getDate() === targetDate.getDate();
      });
      
      if (existingEntry) {
        filledData.push(existingEntry);
      } else {
        // Create a projection for missing days
        // If it's today or future, mark as projected
        const isToday = targetDate.toDateString() === today.toDateString();
        const isFuture = targetDate > today;
        const isProjected = isToday || isFuture;
        
        // For missing days in the past, estimate based on recent trends if possible
        let estimatedBalance = 0;
        
        // If we have at least one entry, use the average of previous entries
        if (filledData.length > 0) {
          // Use negative balance as default (most common)
          estimatedBalance = -1.5;
          
          // If we have some actual data, use the average of the last 3 days
          if (filledData.length >= 1) {
            const recentEntries = filledData.slice(-3);
            const avgBalance = recentEntries.reduce((sum, entry) => sum + entry.sleepBalance, 0) / recentEntries.length;
            // Use a slightly worse balance than average for missing days (conservative estimate)
            estimatedBalance = Math.min(avgBalance - 0.5, 0);
          }
        }
        
        filledData.push({
          date: targetDate,
          dateStr: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: targetDate.toLocaleDateString(),
          sleepBalance: estimatedBalance,
          rawBalance: estimatedBalance * (1000 * 60 * 60), // Convert back to milliseconds
          performance: 0,
          efficiency: 0,
          isProjected: isProjected
        });
      }
    }
    
    console.log('[DEBUG] Sleep debt data after filling:', filledData.map(d => ({
      date: d.date.toLocaleDateString(),
      balance: d.sleepBalance.toFixed(2) + 'h',
      isProjected: !!d.isProjected
    })));
    
    return filledData;
  }, [sleepData]);
  
  // Calculate cumulative sleep debt - using WHOOP's approach 
  // which focuses on accumulated deficit that affects recovery
  const cumulativeSleepDebt = React.useMemo(() => {
    if (sleepDebtData.length === 0) return 0;
    
    // WHOOP typically shows running accumulated sleep debt
    // with greater emphasis on recent days but carried over from the past
    
    // Start with a weighted approach for the recent days
    const recentDays = Math.min(sleepDebtData.length, 7); // WHOOP typically shows a weekly view
    const recentData = sleepDebtData.slice(-recentDays);
    
    // WHOOP emphasizes more recent sleep debt in calculations
    // but carries over accumulated debt from previous days
    let totalRawBalance = 0;
    
    // Apply a decay factor for older sleep debt (this is how WHOOP approaches it)
    // Recent debt is counted more heavily than older debt
    recentData.forEach((item, index) => {
      // Weight increases for more recent days (0.7 to 1.0)
      // WHOOP gradually reduces the impact of older debt
      const weight = 0.7 + (0.3 * index / (recentDays - 1));
      totalRawBalance += item.rawBalance * weight;
    });
    
    // Convert to hours
    return totalRawBalance / (1000 * 60 * 60);
  }, [sleepDebtData]);
  
  // Format for display
  const formattedCumulativeDebt = React.useMemo(() => {
    const hours = Math.abs(Math.floor(cumulativeSleepDebt));
    const minutes = Math.abs(Math.round((cumulativeSleepDebt % 1) * 60));
    return `${hours}h ${minutes}m`;
  }, [cumulativeSleepDebt]);
  
  // Custom tooltip for the chart - enhanced with WHOOP-style information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SleepDebtEntry;
      const hours = Math.abs(Math.floor(data.sleepBalance));
      const minutes = Math.abs(Math.round((data.sleepBalance % 1) * 60));
      
      // Format date to show actual date - WHOOP style
      const date = new Date(data.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      // Show projected data differently if applicable
      const isProjected = data.isProjected;
      
      return (
        <div className="bg-black/90 p-3 border border-gray-700/70 rounded-md shadow-xl">
          <p className="font-sans text-whoop-white mb-1 font-semibold">
            {formattedDate}
            {isProjected && <span className="text-whoop-white/60 text-xs ml-2">(Projected)</span>}
          </p>
          <p className="text-whoop-white/90 text-sm">
            {data.sleepBalance >= 0 ? (
              <span className="text-emerald-400">+{hours}h {minutes}m surplus</span>
            ) : (
              <span className="text-rose-400">-{hours}h {minutes}m deficit</span>
            )}
          </p>
          
          {/* Add performance data if available - WHOOP shows this context */}
          {!isProjected && data.performance > 0 && (
            <div className="mt-1 pt-1 border-t border-gray-700/30 text-xs text-whoop-white/70">
              <p>Sleep Performance: {Math.round(data.performance)}%</p>
              <p>Sleep Efficiency: {Math.round(data.efficiency)}%</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper to determine the fill color based on deficit severity - WHOOP style color coding
  const getDeficitFillColor = (value: number, isProjected?: boolean): string => {
    // For projected data, use a different pattern
    if (isProjected) return 'url(#sleepProjectedGradient)';
    
    // For deficit (negative values)
    if (value < 0) {
      if (value > -1) return 'url(#sleepLightDeficitGradient)'; // Small deficit
      if (value > -3) return 'url(#sleepMediumDeficitGradient)'; // Medium deficit
      return 'url(#sleepSevereDeficitGradient)'; // Severe deficit
    }
    // For surplus (positive values)
    return 'url(#sleepSurplusGradient)';
  };

  // Helper to determine the stroke color based on deficit severity
  const getDeficitStrokeColor = (value: number, isProjected?: boolean): string => {
    if (isProjected) return "#6b7280"; // Gray for projected
    
    if (value < 0) {
      if (value > -1) return "#dca54c"; // Small deficit - amber
      if (value > -3) return "#e67e22"; // Medium deficit - orange
      return "#e74c3c"; // Severe deficit - red
    }
    return "#10b981"; // Surplus - green
  };

  // WHOOP provides personalized recommendations based on sleep debt levels
  const getSleepRecoveryGuidance = () => {
    if (cumulativeSleepDebt >= 0) {
      return "You're doing great with your sleep balance. Maintain your consistent sleep schedule.";
    } else if (cumulativeSleepDebt > -3) {
      return "You have a small sleep debt. Try going to bed 15-30 minutes earlier for a few days.";
    } else if (cumulativeSleepDebt > -6) {
      return "Your sleep debt is accumulating. Aim for an extra hour of sleep over the next few nights.";
    } else {
      return "You have significant sleep debt. Consider a recovery day with 1-2 extra hours of sleep.";
    }
  };

  if (!sleepData || sleepDebtData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-whoop-white/50">
        No sleep debt data available
      </div>
    );
  }

  return (
    <div className="text-whoop-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="uppercase tracking-wide font-medium text-whoop-white text-sm">SLEEP DEBT TRACKER</h3>
        <div className="flex items-center">
          <span className="text-xs text-whoop-white/80 mr-2">Weekly Balance:</span>
          <span className={`text-xs font-medium ${cumulativeSleepDebt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {cumulativeSleepDebt >= 0 ? '+' : '-'}{formattedCumulativeDebt}
          </span>
        </div>
      </div>

      <div className="bg-[#121212] rounded-lg p-4 border border-whoop-white/10">
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sleepDebtData} 
              margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
              barCategoryGap={5}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" strokeOpacity={0.15} vertical={false} />
              <XAxis 
                dataKey="dateStr" 
                tick={{ fontSize: 10, fill: "#FFFFFFB0" }}
                stroke="#FFFFFF25"
                axisLine={{ stroke: "#FFFFFF25" }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "#FFFFFFB0" }}
                stroke="#FFFFFF25"
                axisLine={{ stroke: "#FFFFFF25" }}
                tickFormatter={(value) => `${value}h`}
                domain={['auto', 'auto']}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
              <Bar 
                dataKey="sleepBalance" 
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
                animationDuration={800}
                className="sleep-debt-bar"
                strokeWidth={1.5}
              >
                {sleepDebtData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getDeficitFillColor(entry.sleepBalance, entry.isProjected)}
                    stroke={getDeficitStrokeColor(entry.sleepBalance, entry.isProjected)}
                    // Make projected bars have a different pattern
                    strokeDasharray={entry.isProjected ? "3 3" : ""}
                  />
                ))}
              </Bar>
              {/* Enhanced gradients with better contrast - WHOOP-style colors */}
              <defs>
                {/* Surplus gradient - Green */}
                <linearGradient id="sleepSurplusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                </linearGradient>
                
                {/* Light deficit gradient - Amber */}
                <linearGradient id="sleepLightDeficitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dca54c" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#dca54c" stopOpacity={0.7} />
                </linearGradient>
                
                {/* Medium deficit gradient - Orange */}
                <linearGradient id="sleepMediumDeficitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e67e22" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#e67e22" stopOpacity={0.7} />
                </linearGradient>
                
                {/* Severe deficit gradient - Red */}
                <linearGradient id="sleepSevereDeficitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e74c3c" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#e74c3c" stopOpacity={0.7} />
                </linearGradient>
                
                {/* Projected gradient - Gray */}
                <linearGradient id="sleepProjectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b7280" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#6b7280" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 p-4 border border-whoop-white/15 rounded-md bg-gradient-to-r from-whoop-black/80 to-whoop-black/60">
          <p className="text-sm text-whoop-white/90 font-medium">
            {getSleepRecoveryGuidance()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SleepDebtTracker; 