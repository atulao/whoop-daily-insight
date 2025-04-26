
import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong. Please try again.",
  className,
  onRetry,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
      <AlertCircle className="text-whoop-recovery-low mb-4 h-12 w-12" />
      <p className="text-whoop-white/70 font-medium mb-4">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-whoop-teal text-whoop-black hover:brightness-110"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
