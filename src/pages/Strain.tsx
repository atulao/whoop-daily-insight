
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StrainChart from "@/components/dashboard/StrainChart";
import { generateWeeklyData } from "@/services/mockData";
import { Activity, Heart, Zap } from "lucide-react";

const Strain = () => {
  const weeklyData = generateWeeklyData();
  const todayStrain = weeklyData[weeklyData.length - 1];

  const strainMetrics = [
    {
      icon: <Zap className="h-5 w-5" />,
      label: "Day Strain",
      value: todayStrain.strain.toFixed(1),
      description: "Moderate activity"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Recovery",
      value: `${todayStrain.recovery}%`,
      description: "Good recovery state"
    },
    {
      icon: <Activity className="h-5 w-5" />,
      label: "Activity Score",
      value: "82",
      description: "Above average"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Strain</h1>
            <p className="text-xl text-muted-foreground">
              Track your daily cardiovascular load
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {strainMetrics.map((metric, index) => (
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
          <Card>
            <CardHeader>
              <CardTitle>Weekly Strain Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <StrainChart data={weeklyData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Strain;
