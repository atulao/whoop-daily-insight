
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";

const History = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper
      isLoading={isLoading}
      loadingMessage="Loading your history..."
      className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <header className="flex items-center justify-between py-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-whoop-white mb-2 tracking-whoop">
            HISTORY
          </h1>
          <p className="text-xl text-whoop-white/70">
            Review your past performance and trends
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <HistoryIcon className="h-12 w-12 text-whoop-teal" />
              <h2 className="text-xl font-semibold text-whoop-white tracking-whoop">Historical Data</h2>
              <p className="text-center text-whoop-white/70">
                Coming soon - Track your performance history and analyze long-term trends
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default History;
