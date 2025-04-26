
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  iconSize?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  className,
  iconSize = 24,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6", className)}>
      <Loader2 className={`animate-spin text-whoop-teal mb-2 h-${iconSize} w-${iconSize}`} />
      <p className="text-whoop-white/70 font-medium text-sm">{message}</p>
    </div>
  );
};
