
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import SleepConsistency from "@/components/dashboard/SleepConsistency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSleepData } from "@/services/mockData";
import { Bed, Moon, Sunrise } from "lucide-react";

const Sleep = () => {
  const sleepData = generateSleepData();
  const todaySleep = sleepData[sleepData.length - 1];
  
  const sleepMetrics = [
    {
      icon: <Moon className="h-5 w-5" />,
      label: "Sleep Score",
      value: "87%",
      description: "Good sleep quality"
    },
    {
      icon: <Bed className="h-5 w-5" />,
      label: "Time in Bed",
      value: "8h 12m",
      description: "Target: 8h"
    },
    {
      icon: <Sunrise className="h-5 w-5" />,
      label: "Wake Time",
      value: todaySleep.wakeTime,
      description: "Consistent pattern"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Sleep Analysis</h1>
            <p className="text-xl text-muted-foreground">
              Optimize your recovery through better sleep
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sleepMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <h3 className="text-2xl font-bold">{metric.value}</h3>
                    <p className="text-sm text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SleepConsistency sleepData={sleepData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Sleep;
