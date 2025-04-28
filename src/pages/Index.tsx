import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import DailyOverview from "@/components/dashboard/DailyOverview";
import SleepSummary from "@/components/dashboard/SleepSummary";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import StrainChart from "@/components/dashboard/StrainChart";
import HrvTimeline from "@/components/dashboard/HrvTimeline";
import { whoopService } from "@/services/whoopService";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataRefreshNotification from "@/components/DataRefreshNotification";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<"refreshing" | "success" | "error" | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string>("");
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Fetch profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["whoopProfile"],
    queryFn: () => whoopService.getProfile(),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  // Fetch recovery data
  const { data: recoveryData, isLoading: isLoadingRecovery } = useQuery({
    queryKey: ["whoopRecovery"],
    queryFn: () => whoopService.getRecovery(7),
    enabled: !!profileData,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  // Fetch strain data
  const { data: strainData, isLoading: isLoadingStrain } = useQuery({
    queryKey: ["whoopStrain"],
    queryFn: () => whoopService.getStrain(7),
    enabled: !!profileData,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  // Fetch sleep data
  const { data: sleepData, isLoading: isLoadingSleep } = useQuery({
    queryKey: ["whoopSleep"],
    queryFn: () => whoopService.getSleep(7),
    enabled: !!profileData,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  // Function to get the latest data with a score
  const getLatestWithScore = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    // Find the first item with a valid score
    const withScore = data.find(item => item.score && Object.keys(item.score).length > 0);
    
    if (withScore) {
      console.log('[DEBUG] Found record with score:', withScore);
      return withScore;
    }
    
    console.log('[WARNING] No records with score found, using first record:', data[0]);
    return data[0];
  };

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
    if (recoveryData || strainData || sleepData) {
      setLastUpdated(new Date());
    }
  }, [recoveryData, strainData, sleepData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setRefreshStatus("refreshing");
      setRefreshMessage("Fetching the latest data from WHOOP...");
      setShowNotification(true);
      
      await whoopService.refreshAllData();
      
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["whoopProfile"] });
      queryClient.invalidateQueries({ queryKey: ["whoopRecovery"] });
      queryClient.invalidateQueries({ queryKey: ["whoopStrain"] });
      queryClient.invalidateQueries({ queryKey: ["whoopSleep"] });
      
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

  // Display a loading state while fetching data
  const isLoading = isLoadingProfile || isLoadingRecovery || isLoadingStrain || isLoadingSleep;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-whoop-teal mx-auto mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Loading your insights...</h2>
            <p className="text-whoop-white/70">Analyzing your recovery and performance data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get the latest data for each metric
  const latestRecovery = getLatestWithScore(recoveryData || []);
  const latestStrain = getLatestWithScore(strainData || []);
  const latestSleep = getLatestWithScore(sleepData || []);

  // Format the last updated time
  const formattedLastUpdated = lastUpdated.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-whoop text-whoop-white mb-2">
              Overview {profileData?.first_name ? `- ${profileData.first_name}` : ''}
            </h1>
            <p className="text-sm text-whoop-white/70 flex items-center space-x-2">
              <span>{new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="px-2 py-1 bg-whoop-black/50 rounded text-xs">
                Last updated: {formattedLastUpdated}
              </span>
            </p>
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DailyOverview 
                latestRecovery={latestRecovery}
                latestStrain={latestStrain}
                latestSleep={latestSleep}
              />
            </div>
            <div>
              <SleepSummary latestSleep={latestSleep} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrainChart strainData={strainData} recoveryData={recoveryData} />
            <HrvTimeline data={recoveryData} />
          </div>

          <WeeklyOverview recoveryData={recoveryData} strainData={strainData} sleepData={sleepData} />
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
    </MainLayout>
  );
};

export default Dashboard;

