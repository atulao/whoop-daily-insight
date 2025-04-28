import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
import SleepStageChart from "@/components/dashboard/SleepStageChart";
import SleepEfficiency from "@/components/dashboard/SleepEfficiency";
import SleepDebtTracker from "@/components/dashboard/SleepDebtTracker";
import RespiratoryRateChart from "@/components/dashboard/RespiratoryRateChart";
import SleepCoachingTips from "@/components/dashboard/SleepCoachingTips";
import RecoveryImpact from "@/components/dashboard/RecoveryImpact";
import SleepTimeTracker from "@/components/dashboard/SleepTimeTracker";
import BedtimeTracker from "@/components/dashboard/BedtimeTracker";
import LastNightSleep from "@/components/dashboard/LastNightSleep";
import SleepEducationCard from "@/components/dashboard/SleepEducationCard";
import SleepCyclesInfo from "@/components/dashboard/SleepCyclesInfo";
import SleepConsistencyGuide from "@/components/dashboard/SleepConsistencyGuide";
import WhoopSleepInsights from "@/components/dashboard/WhoopSleepInsights";
import DataDebugPanel from "@/components/DataDebugPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { whoopService } from "@/services/whoopService";
import { Bed, Moon, Sunrise, Loader2, RefreshCw, Home, ChevronRight, ArrowRight, Info, Clock } from "lucide-react";
import { formatDuration, formatTime } from "./utils/formatters";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DataRefreshNotification from "@/components/DataRefreshNotification";

// Helper function to calculate WHOOP sleep performance score range display
const getSleepScoreDescription = (score: number): { text: string; color: string } => {
  if (score >= 85) return { text: 'Optimal', color: 'text-emerald-400' };
  if (score >= 70) return { text: 'Good', color: 'text-blue-400' };
  if (score >= 60) return { text: 'Fair', color: 'text-amber-400' };
  return { text: 'Poor', color: 'text-rose-400' };
};

// Helper for sleep efficiency rating (per WHOOP documentation)
const getSleepEfficiencyStatus = (value: number) => {
  if (value >= 90) return { text: 'Excellent', color: 'text-emerald-400' };
  if (value >= 85) return { text: 'Good', color: 'text-blue-400' };
  if (value >= 80) return { text: 'Average', color: 'text-amber-400' };
  return { text: 'Needs Improvement', color: 'text-rose-400' };
};

const Sleep = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<"refreshing" | "success" | "error" | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string>("");
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Fetch sleep data for the last 30 days
  const { data: sleepData, isLoading: isLoadingSleep, refetch: refetchSleep } = useQuery({
    queryKey: ["whoopSleep30"],
    queryFn: () => whoopService.getSleep(30),
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (reduced from 5)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Fetch recovery data to show relationship between sleep and recovery
  const { data: recoveryData, isLoading: isLoadingRecovery, refetch: refetchRecovery } = useQuery({
    queryKey: ["whoopRecovery"],
    queryFn: () => whoopService.getRecovery(7),
    enabled: !!sleepData, // Only fetch recovery once we have sleep data
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (reduced from 5)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Log data on each render for debugging
  useEffect(() => {
    if (sleepData) {
      const dates = sleepData.map(sleep => {
        const date = new Date(sleep.end || sleep.created_at);
        return {
          date: date.toLocaleDateString(),
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          hasScore: !!sleep.score
        };
      });
      
      console.log(`[DEBUG] Available sleep dates (${dates.length}):`, dates);
    }
  }, [sleepData]);

  // Auto-hide notification after timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (refreshStatus && showNotification) {
      timeoutId = setTimeout(() => {
        setShowNotification(false);
      }, 5000); // Hide after 5 seconds
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshStatus, showNotification]);

  // Update the last updated timestamp when data changes
  useEffect(() => {
    if (sleepData || recoveryData) {
      setLastUpdated(new Date());
    }
  }, [sleepData, recoveryData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setRefreshStatus("refreshing");
      setRefreshMessage("Fetching the latest data from WHOOP...");
      setShowNotification(true);
      
      // First try to refresh through the WHOOP API
      await whoopService.refreshAllData();
      
      // Then invalidate queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ["whoopSleep30"] });
      await queryClient.invalidateQueries({ queryKey: ["whoopRecovery"] });
      
      // Explicitly trigger refetches
      await refetchSleep();
      await refetchRecovery();
      
      // Debug log after refresh
      console.log("[DEBUG] Data refreshed manually at", new Date().toLocaleTimeString());
      
      setLastUpdated(new Date());
      setRefreshStatus("success");
      setRefreshMessage("Successfully updated with latest WHOOP data");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setRefreshStatus("error");
      setRefreshMessage("Could not retrieve the latest data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = isLoadingSleep || isLoadingRecovery;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-whoop-teal mx-auto mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Loading sleep data...</h2>
            <p className="text-whoop-white/70">Analyzing your sleep patterns and metrics</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get the most recent sleep data with a valid score
  const getLatestWithScore = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const withScore = data.find(item => item.score && Object.keys(item.score).length > 0);
    if (withScore) return withScore;
    return data[0];
  };

  const latestSleep = getLatestWithScore(sleepData || []);
  const latestRecovery = getLatestWithScore(recoveryData || []);
  
  // Calculate sleep score based on WHOOP's sleep performance percentage
  const sleepScore = latestSleep?.score?.sleep_performance_percentage
    ? Math.round(latestSleep.score.sleep_performance_percentage) : 0;
  
  // Get sleep score evaluation
  const sleepScoreStatus = getSleepScoreDescription(sleepScore);
    
  // Calculate time in bed vs. actual sleep time (WHOOP differentiates these)
  const timeInBed = latestSleep?.score?.stage_summary?.total_in_bed_time_milli 
    ? formatDuration(latestSleep.score.stage_summary.total_in_bed_time_milli / 1000) : "--:--";
  
  // WHOOP's actual sleep time excludes awake periods
  const actualSleepTime = latestSleep?.score?.stage_summary ? 
    formatDuration((
      latestSleep.score.stage_summary.total_in_bed_time_milli - 
      latestSleep.score.stage_summary.total_awake_time_milli - 
      latestSleep.score.stage_summary.total_no_data_time_milli
    ) / 1000) : "--:--";
    
  // Sleep need calculation follows WHOOP's approach:
  // 1. Baseline (demographic average: typically 7-9 hours)
  // 2. Sleep debt from previous nights (accumulation of missed sleep)
  // 3. Recent strain (physical activity increases sleep need)
  // 4. Recent naps (reduce night sleep need)
  const sleepNeeded = latestSleep?.score?.sleep_needed
    ? formatDuration((
        latestSleep.score.sleep_needed.baseline_milli + 
        latestSleep.score.sleep_needed.need_from_sleep_debt_milli + 
        latestSleep.score.sleep_needed.need_from_recent_strain_milli + 
        latestSleep.score.sleep_needed.need_from_recent_nap_milli
      ) / 1000) : '--:--';
      
  // Fix: Pass the string directly instead of creating a new Date object
  const wakeTime = latestSleep?.end 
    ? formatTime(latestSleep.end) : "--:--";
  
  const bedTime = latestSleep?.start
    ? formatTime(latestSleep.start) : "--:--";
    
  // WHOOP defines sleep efficiency as: Time Asleep ÷ Time in Bed
  const sleepEfficiency = latestSleep?.score?.sleep_efficiency_percentage ?? 0;
  const efficiencyStatus = getSleepEfficiencyStatus(sleepEfficiency);

  // Respiratory rate - important WHOOP health metric
  const respiratoryRate = latestSleep?.score?.respiratory_rate ?? 0;

  // Create WHOOP-style sleep metrics cards
  const sleepMetrics = [
    {
      icon: <Moon className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "SLEEP SCORE",
      value: sleepScore > 0 ? `${sleepScore}%` : "--",
      color: "#40A0FF", // sleep blue color
      description: sleepScoreStatus.text,
      descriptionColor: sleepScoreStatus.color,
      tooltip: "Sleep score measures your sleep quality relative to your sleep need. WHOOP calculates this as a percentage of needed sleep that you achieved."
    },
    {
      icon: <Bed className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "SLEEP NEED",
      value: sleepNeeded !== '--:--' ? sleepNeeded : "--",
      color: "#40A0FF", // sleep blue color
      description: `Actual: ${actualSleepTime}`,
      tooltip: "Your personalized sleep need based on your baseline, recent strain, sleep debt, and naps. WHOOP calculates this specifically for you each day."
    },
    {
      icon: <Clock className="h-5 w-5 text-whoop-sleep-blue" />,
      label: "SLEEP EFFICIENCY",
      value: `${Math.round(sleepEfficiency)}%`,
      color: "#40A0FF", // sleep blue color
      description: efficiencyStatus.text,
      descriptionColor: efficiencyStatus.color,
      tooltip: "Sleep efficiency measures how much of your time in bed was spent asleep, excluding wakeful periods. WHOOP calculates this as Time Asleep ÷ Time in Bed."
    }
  ];

  // Format the last updated time
  const formattedLastUpdated = lastUpdated.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <header className="py-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 text-xs text-whoop-white/50">Data by WHOOP</div>
            <h1 className="text-4xl font-bold uppercase tracking-whoop text-whoop-white mb-2">
              SLEEP ANALYSIS
            </h1>
            <div className="flex items-center text-sm text-whoop-white/70 mb-4 md:mb-0">
              <Link to="/" className="flex items-center text-whoop-white/60 hover:text-whoop-white mr-2">
                <Home className="h-3.5 w-3.5 mr-1" />
                <span>Dashboard</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-whoop-white/40 mx-1" />
              <span>Sleep Analysis</span>
              <span className="ml-4 px-2 py-1 bg-whoop-black/50 rounded text-xs">
                Last updated: {formattedLastUpdated}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline" 
            size="sm"
            className="bg-whoop-black/60 text-whoop-white border-whoop-white/20 hover:bg-whoop-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </header>

        {/* Sleep Status Summary - enhanced with WHOOP insights */}
        <div className={`p-3 rounded bg-whoop-sleep-blue/10 text-center animate-fadeIn mb-8`}>
          <p className={`text-sm text-whoop-sleep-blue font-medium`}>
            {sleepScore >= 85 
              ? 'Optimal sleep quality. Your recovery is maximized for peak performance.' 
              : sleepScore >= 70 
                ? 'Good sleep quality. Your body is recovering well for daily activities.' 
                : sleepScore >= 60
                  ? 'Fair sleep quality. Consider improving sleep habits for better recovery.'
                  : 'Sleep needs improvement to optimize recovery and performance.'}
          </p>
        </div>

        {/* Last Night's Sleep Overview */}
        <div className="mb-8">
          <LastNightSleep sleepData={latestSleep} />
        </div>

        {/* Sleep Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sleepMetrics.map((metric, index) => (
            <Card key={index} className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                    {metric.icon}
                      <span className="ml-2 text-xs font-medium uppercase tracking-whoop text-whoop-white/70">
                        {metric.label}
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-whoop-white/50 hover:text-whoop-white">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                          <p>{metric.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <h3 
                    className="text-5xl font-din font-bold mb-1"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </h3>
                  <p className={`text-sm font-medium ${metric.descriptionColor || 'text-whoop-white/70'}`}>
                      {metric.description}
                    </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* WHOOP Educational Content - NEW SECTION */}
        <div className="mb-8">
          <SleepEducationCard />
        </div>

        {/* Sleep Stage Breakdown & Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                SLEEP STAGES
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Breakdown of your sleep cycles, showing time spent in REM, Deep, and Light sleep stages. WHOOP tracks these to measure sleep quality.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SleepStageChart sleepData={latestSleep} />
            </CardContent>
          </Card>
          
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                SLEEP EFFICIENCY
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Sleep efficiency measures how much of your time in bed was spent asleep, excluding wakeful periods. WHOOP calculates this as Time Asleep ÷ Time in Bed.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SleepEfficiency 
                sleepData={sleepData} 
                currentSleep={latestSleep} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Sleep Cycles Analysis - NEW SECTION */}
        <div className="mb-8">
          <SleepCyclesInfo sleepData={latestSleep} />
        </div>

        {/* Sleep Health Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                RESPIRATORY RATE
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Respiratory rate measures your breaths per minute during sleep. WHOOP uses this key health indicator to monitor for potential health changes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RespiratoryRateChart sleepData={sleepData} />
            </CardContent>
          </Card>
          
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                RECOVERY IMPACT
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Shows how your sleep quality affects your recovery score, and how much improvement is possible. WHOOP analyzes this relationship to help optimize performance.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RecoveryImpact 
                sleepData={latestSleep} 
                recoveryData={latestRecovery} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Sleep Tracking & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                SLEEP DEBT TRACKER
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Tracks your accumulated sleep debt or surplus over time, based on your personalized sleep needs. WHOOP includes this in your daily sleep need calculations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SleepDebtTracker sleepData={sleepData} />
            </CardContent>
          </Card>
          
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                SLEEP COACHING TIPS
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Personalized recommendations based on your sleep patterns to help improve your sleep quality. WHOOP's sleep coach gives actionable advice.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SleepCoachingTips 
                sleepData={sleepData}
                currentSleep={latestSleep}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Sleep Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                SLEEP TIME TRACKER
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Tracks your total sleep duration over time, compared to your sleep need. WHOOP analyzes this relationship to optimize your recovery.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SleepTimeTracker sleepData={sleepData} />
            </CardContent>
          </Card>
          
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
                BEDTIME TRACKER
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-whoop-white/50 hover:text-whoop-white">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                      <p>Shows your bedtime patterns over time. WHOOP emphasizes consistent sleep schedules for optimal recovery and performance.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <BedtimeTracker sleepData={sleepData} />
            </CardContent>
          </Card>
        </div>

        {/* Sleep Consistency Guide - NEW SECTION */}
        <div className="mb-8">
          <SleepConsistencyGuide sleepData={sleepData} />
        </div>

        {/* Sleep Consistency Section */}
        <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-whoop-white/5 pb-3">
            <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
              SLEEP CONSISTENCY
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-whoop-white/50 hover:text-whoop-white">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                    <p>Shows your sleep patterns over time. WHOOP tracks consistent sleep and wake times as a key factor in improving sleep quality and recovery.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SleepConsistency sleepData={sleepData || []} />
          </CardContent>
        </Card>
        
        {/* WHOOP Sleep Science Insights - NEW SECTION */}
        <div className="mt-8 mb-8">
          <WhoopSleepInsights />
        </div>
      </div>
      
      {/* Data refresh notification */}
      {refreshStatus && (
        <DataRefreshNotification 
          status={refreshStatus}
          message={refreshMessage}
          visible={showNotification}
        />
      )}
      
      {/* Debug panel */}
      <DataDebugPanel sleepData={sleepData} />
    </MainLayout>
  );
};

export default Sleep;
