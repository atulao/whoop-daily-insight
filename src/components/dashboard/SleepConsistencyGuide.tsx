import React from 'react';
import { WhoopSleep } from '@/services/whoopService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, MoonStar, AlarmClock, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime } from '@/pages/utils/formatters';

interface SleepConsistencyGuideProps {
  sleepData: WhoopSleep[] | null | undefined;
}

const SleepConsistencyGuide: React.FC<SleepConsistencyGuideProps> = ({ sleepData }) => {
  // Calculate sleep consistency score based on WHOOP methodology
  // WHOOP calculates consistency based on how regular your sleep and wake times are
  const calculateConsistencyScore = () => {
    if (!sleepData || sleepData.length < 5) return 0;
    
    // Get the last 14 days of sleep data for consistency calculations
    const recentSleep = sleepData.slice(-14);
    
    // Extract start and end times
    const bedtimes = recentSleep.map(sleep => new Date(sleep.start || sleep.created_at).getHours() * 60 + 
                                          new Date(sleep.start || sleep.created_at).getMinutes());
    
    const waketimes = recentSleep.map(sleep => new Date(sleep.end || sleep.created_at).getHours() * 60 + 
                                          new Date(sleep.end || sleep.created_at).getMinutes());
    
    // Calculate standard deviation for bedtimes and waketimes (in minutes)
    const bedtimeStdDev = calculateStandardDeviation(bedtimes);
    const waketimeStdDev = calculateStandardDeviation(waketimes);
    
    // WHOOP considers consistency good when standard deviation is low
    // Convert standard deviation to a score where lower deviation = higher score
    // This is a simplified version of WHOOP's algorithm
    const maxAcceptableDeviation = 90; // 90 minutes standard deviation as max
    const bedtimeScore = 100 - Math.min(100, (bedtimeStdDev / maxAcceptableDeviation) * 100);
    const waketimeScore = 100 - Math.min(100, (waketimeStdDev / maxAcceptableDeviation) * 100);
    
    // WHOOP weights both bedtime and waketime but gives slightly more importance to waketime
    return (bedtimeScore * 0.45) + (waketimeScore * 0.55);
  };
  
  // Helper function to calculate standard deviation
  const calculateStandardDeviation = (values: number[]) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(variance);
  };
  
  // Calculate median bedtime and waketime to recommend ideal sleep schedule
  const calculateIdealSchedule = () => {
    if (!sleepData || sleepData.length < 5) {
      return { 
        bedtime: "10:30 PM", 
        waketime: "6:30 AM",
        actualBedtime: "Unknown",
        actualWaketime: "Unknown" 
      };
    }
    
    // Get the last 14 days of sleep data
    const recentSleep = sleepData.slice(-14);
    
    // Extract DateTime objects for start and end times
    const bedtimeDates = recentSleep.map(sleep => new Date(sleep.start || sleep.created_at));
    const waketimeDates = recentSleep.map(sleep => new Date(sleep.end || sleep.created_at));
    
    // Sort times to find median
    const sortedBedtimes = [...bedtimeDates].sort((a, b) => 
      (a.getHours() * 60 + a.getMinutes()) - (b.getHours() * 60 + b.getMinutes())
    );
    
    const sortedWaketimes = [...waketimeDates].sort((a, b) => 
      (a.getHours() * 60 + a.getMinutes()) - (b.getHours() * 60 + b.getMinutes())
    );
    
    // Get median values
    const medianBedtime = sortedBedtimes[Math.floor(sortedBedtimes.length / 2)];
    const medianWaketime = sortedWaketimes[Math.floor(sortedWaketimes.length / 2)];
    
    // Format times in local time
    const formattedBedtime = formatTime(medianBedtime.toISOString());
    const formattedWaketime = formatTime(medianWaketime.toISOString());
    
    // Get actual latest bedtime and waketime
    const latestSleep = recentSleep[recentSleep.length - 1];
    const actualBedtime = latestSleep.start ? formatTime(latestSleep.start) : "Unknown";
    const actualWaketime = latestSleep.end ? formatTime(latestSleep.end) : "Unknown";
    
    return {
      bedtime: formattedBedtime,
      waketime: formattedWaketime,
      actualBedtime,
      actualWaketime
    };
  };
  
  const consistencyScore = Math.round(calculateConsistencyScore());
  const idealSchedule = calculateIdealSchedule();
  
  // Get consistency status based on score
  const getConsistencyStatus = (score: number) => {
    if (score >= 85) return { status: 'Excellent', color: 'text-emerald-400' };
    if (score >= 70) return { status: 'Good', color: 'text-blue-400' };
    if (score >= 50) return { status: 'Fair', color: 'text-amber-400' };
    return { status: 'Needs Improvement', color: 'text-rose-400' };
  };
  
  const consistencyStatus = getConsistencyStatus(consistencyScore);
  
  // Get customized recommendation based on consistency score
  const getConsistencyRecommendation = (score: number, schedule: { bedtime: string, waketime: string }) => {
    if (score >= 85) {
      return `Your excellent sleep consistency is helping optimize your recovery. Continue going to bed around ${schedule.bedtime} and waking up at ${schedule.waketime} to maintain this pattern.`;
    }
    if (score >= 70) {
      return `You have good sleep consistency. For even better results, try to be more precise with your ${schedule.bedtime} bedtime and ${schedule.waketime} wake time, even on weekends.`;
    }
    if (score >= 50) {
      return `Your sleep schedule has some inconsistency. Try to establish a more regular pattern by going to bed at ${schedule.bedtime} and waking up at ${schedule.waketime} within ±30 minutes each day.`;
    }
    return `Your sleep schedule is quite irregular. WHOOP recommends setting consistent times - aim for bed at ${schedule.bedtime} and waking at ${schedule.waketime} to improve your recovery and performance.`;
  };
  
  if (!sleepData || sleepData.length === 0) {
    return (
      <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-whoop-white/5 pb-3">
          <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white">
            SLEEP CONSISTENCY GUIDE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-whoop-white/50">
            No sleep consistency data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
      <CardHeader className="border-b border-whoop-white/5 pb-3">
        <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
          SLEEP CONSISTENCY GUIDE
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-whoop-white/50 hover:text-whoop-white">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                <p>Sleep consistency measures how regular your sleep and wake times are. WHOOP emphasizes consistency as a key factor in quality sleep and recovery.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consistency Score */}
          <div className="p-5 border border-whoop-white/10 rounded-lg bg-whoop-black/40 flex flex-col items-center justify-center">
            <h3 className="text-xs uppercase text-whoop-white/60 mb-3">Consistency Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-whoop-white/5"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
                <circle
                  className={`${consistencyScore >= 85 ? 'text-emerald-500' : 
                             consistencyScore >= 70 ? 'text-blue-500' : 
                             consistencyScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}
                  strokeWidth="6"
                  strokeDasharray={`${(consistencyScore / 100) * 365} 365`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold ${consistencyStatus.color}`}>{consistencyScore}%</span>
                <span className={`text-sm ${consistencyStatus.color}`}>{consistencyStatus.status}</span>
              </div>
            </div>
            <p className="text-xs text-whoop-white/70 text-center mt-3">
              WHOOP recommends a consistency score of ≥85% for optimal recovery
            </p>
          </div>
          
          {/* Recommended Schedule */}
          <div className="lg:col-span-2 p-5 border border-whoop-white/10 rounded-lg bg-whoop-black/40">
            <h3 className="text-xs uppercase text-whoop-white/60 mb-3">Your Ideal Sleep Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-whoop-sleep-blue/20">
                  <MoonStar className="h-5 w-5 text-whoop-sleep-blue" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-whoop-white/60">Target Bedtime</p>
                  <p className="text-xl font-bold text-whoop-white">{idealSchedule.bedtime}</p>
                  <p className="text-xs text-whoop-white/40">Last bedtime: {idealSchedule.actualBedtime}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-whoop-sleep-blue/20">
                  <AlarmClock className="h-5 w-5 text-whoop-sleep-blue" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-whoop-white/60">Target Wake Time</p>
                  <p className="text-xl font-bold text-whoop-white">{idealSchedule.waketime}</p>
                  <p className="text-xs text-whoop-white/40">Last wake time: {idealSchedule.actualWaketime}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-whoop-white/10 rounded-lg bg-gradient-to-r from-whoop-black/40 to-whoop-black/20">
              <p className="text-sm text-whoop-white/80">
                {getConsistencyRecommendation(consistencyScore, idealSchedule)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-whoop-sleep-blue/10 rounded-lg border border-whoop-sleep-blue/20">
          <h3 className="text-sm font-medium text-whoop-sleep-blue mb-2">Why Sleep Consistency Matters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-whoop-white/70">
            <div className="flex items-start">
              <ArrowRight className="h-3.5 w-3.5 text-whoop-sleep-blue mt-0.5 mr-1 flex-shrink-0" />
              <p>Consistent sleep times help regulate your circadian rhythm, improving both sleep quality and duration.</p>
            </div>
            <div className="flex items-start">
              <ArrowRight className="h-3.5 w-3.5 text-whoop-sleep-blue mt-0.5 mr-1 flex-shrink-0" />
              <p>WHOOP data shows users with 85%+ consistency scores average higher sleep efficiency and better recovery.</p>
            </div>
            <div className="flex items-start">
              <ArrowRight className="h-3.5 w-3.5 text-whoop-sleep-blue mt-0.5 mr-1 flex-shrink-0" />
              <p>Even on weekends, maintaining your sleep schedule within ±30 minutes helps preserve your sleep patterns.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepConsistencyGuide; 