
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StrainChart from "@/components/dashboard/StrainChart";
import { generateWeeklyData } from "@/services/mockData";
import { Activity, Heart, Zap } from "lucide-react";

const Strain = () => {
  const weeklyData = generateWeeklyData();
  const todayStrain = weeklyData[weeklyData.length - 1];

  // Add default values in case properties are undefined
  const strainValue = todayStrain && todayStrain.strain !== undefined 
    ? todayStrain.strain.toFixed(1) 
    : "0.0";

  const recoveryValue = todayStrain && todayStrain.recovery !== undefined
    ? `${todayStrain.recovery}%`
    : "0%";

  const strainMetrics = [
    {
      icon: <Zap className="h-5 w-5 text-whoop-blue" />,
      label: "DAY STRAIN",
      value: strainValue,
      description: "Moderate activity"
    },
    {
      icon: <Heart className="h-5 w-5 text-whoop-recovery-med" />,
      label: "RECOVERY",
      value: recoveryValue,
      description: "Good recovery state"
    },
    {
      icon: <Activity className="h-5 w-5 text-whoop-teal" />,
      label: "ACTIVITY SCORE",
      value: "82",
      description: "Above average"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-whoop text-whoop-white mb-2">Strain</h1>
            <p className="text-lg text-whoop-white/70">
              Track your daily cardiovascular load
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {strainMetrics.map((metric, index) => (
            <Card key={index} className="bg-whoop-black/80 backdrop-blur-sm border-whoop-blue/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-whoop-blue/10 rounded-full">
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-whoop text-whoop-white/70">
                      {metric.label}
                    </p>
                    <h3 className="text-2xl font-din font-bold text-whoop-white">{metric.value}</h3>
                    <p className="text-sm text-whoop-white/50">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-blue/20">
            <CardHeader>
              <CardTitle className="uppercase tracking-whoop text-whoop-white">Weekly Strain Overview</CardTitle>
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
