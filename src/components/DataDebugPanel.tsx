import React, { useState } from 'react';
import { WhoopSleep, whoopService } from '@/services/whoopService';
import { useQueryClient } from '@tanstack/react-query';

interface DataDebugPanelProps {
  sleepData?: WhoopSleep[] | null;
}

const DataDebugPanel: React.FC<DataDebugPanelProps> = ({ sleepData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Function to add log entries
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  // Function to force data refresh
  const forceRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    addLog("Starting manual data refresh...");
    
    try {
      // Clear React Query cache for WHOOP data
      queryClient.invalidateQueries({ queryKey: ["whoopSleep30"] });
      queryClient.invalidateQueries({ queryKey: ["whoopRecovery"] });
      addLog("Cache invalidated");
      
      // Refresh all data from WHOOP API
      const result = await whoopService.refreshAllData();
      addLog(`Data refreshed: ${result.sleep?.length || 0} sleep records`);
      
      // Refetch queries
      queryClient.refetchQueries({ queryKey: ["whoopSleep30"] });
      queryClient.refetchQueries({ queryKey: ["whoopRecovery"] });
      addLog("Queries refetched");
    } catch (error) {
      addLog(`Error refreshing: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to analyze date gaps
  const analyzeGaps = () => {
    if (!sleepData || sleepData.length === 0) {
      addLog("No sleep data available to analyze");
      return;
    }
    
    // Sort sleep data by end date
    const sortedData = [...sleepData].sort((a, b) => 
      new Date(a.end || a.created_at).getTime() - new Date(b.end || b.created_at).getTime()
    );
    
    // Check for missing days in the last week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeekDates: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      lastWeekDates.push(date);
    }
    
    // Find missing dates
    const missingDates: string[] = [];
    lastWeekDates.forEach(targetDate => {
      const hasData = sortedData.some(item => {
        const itemDate = new Date(item.end || item.created_at);
        return itemDate.getFullYear() === targetDate.getFullYear() &&
               itemDate.getMonth() === targetDate.getMonth() &&
               itemDate.getDate() === targetDate.getDate();
      });
      
      if (!hasData) {
        missingDates.push(targetDate.toLocaleDateString());
      }
    });
    
    if (missingDates.length > 0) {
      addLog(`Missing dates: ${missingDates.join(', ')}`);
    } else {
      addLog("No missing dates in the last week");
    }
    
    // Log the available dates for verification
    const availableDates = sortedData.slice(-7).map(item => {
      const date = new Date(item.end || item.created_at);
      return `${date.toLocaleDateString()} (${date.toLocaleDateString('en-US', { weekday: 'short' })})`;
    });
    
    addLog(`Available dates: ${availableDates.join(', ')}`);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-md shadow-lg p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
        <h3 className="text-white text-sm font-semibold">Data Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          Close
        </button>
      </div>
      
      <div className="space-y-2 mb-2">
        <button 
          onClick={forceRefresh}
          disabled={isRefreshing}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md mr-2 disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Force Data Refresh"}
        </button>
        
        <button 
          onClick={analyzeGaps}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-md"
        >
          Analyze Date Gaps
        </button>
      </div>
      
      <div className="text-xs text-gray-300 mt-2">
        <div className="mb-1 text-gray-400">Sleep Records: {sleepData?.length || 0}</div>
        
        <div className="bg-gray-950 p-2 rounded-md h-40 overflow-y-auto font-mono">
          {debugLog.length > 0 ? (
            debugLog.map((log, i) => (
              <div key={i} className="text-gray-300 text-xs mb-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No debug logs yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDebugPanel; 