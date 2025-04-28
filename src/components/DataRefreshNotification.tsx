import React from "react";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { cva } from "class-variance-authority";

interface DataRefreshNotificationProps {
  status: "refreshing" | "success" | "error";
  message?: string;
  visible: boolean;
}

const notificationVariants = cva(
  "fixed bottom-4 right-4 z-50 rounded-lg shadow-lg transition-all duration-300 border overflow-hidden max-w-md",
  {
    variants: {
      status: {
        refreshing: "bg-gradient-to-br from-gray-900 to-gray-800 border-whoop-white/20",
        success: "bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30",
        error: "bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/30",
      },
      visible: {
        true: "transform translate-y-0 opacity-100",
        false: "transform translate-y-10 opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      status: "refreshing",
      visible: false,
    },
  }
);

const DataRefreshNotification: React.FC<DataRefreshNotificationProps> = ({ 
  status, 
  message,
  visible
}) => {
  const getIcon = () => {
    switch (status) {
      case "refreshing":
        return <RefreshCw className="h-5 w-5 text-whoop-white animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "refreshing":
        return "Refreshing data...";
      case "success":
        return "Data refreshed";
      case "error":
        return "Refresh failed";
    }
  };

  return (
    <div className={notificationVariants({ status, visible })}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-whoop-white">{getTitle()}</p>
          {message && (
            <p className="mt-1 text-sm text-whoop-white/70">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataRefreshNotification; 