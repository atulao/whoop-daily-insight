
import React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import MainLayout from "@/components/layout/MainLayout";

interface PageWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isLoading,
  loadingMessage,
  error,
  onRetry,
  className,
}) => {
  return (
    <MainLayout>
      <div className={className}>
        {isLoading ? (
          <div className="h-[50vh] flex items-center justify-center">
            <LoadingState message={loadingMessage} />
          </div>
        ) : error ? (
          <div className="h-[50vh] flex items-center justify-center">
            <ErrorState 
              message={typeof error === 'string' ? error : error.message} 
              onRetry={onRetry} 
            />
          </div>
        ) : (
          children
        )}
      </div>
    </MainLayout>
  );
};

export default PageWrapper;
