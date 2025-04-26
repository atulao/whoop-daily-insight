
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const History = () => {
  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">History</h1>
            <p className="text-xl text-muted-foreground">
              Review your past performance and trends
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Historical Data</h2>
                <p className="text-center text-muted-foreground">
                  Coming soon - Track your performance history and analyze long-term trends
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default History;
