import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StrainChart from "@/components/dashboard/StrainChart";
import { whoopService } from "@/services/whoopService";
import { Activity, Heart, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Strain = () => {
  const { data: strainData, isLoading: isLoadingStrain } = useQuery({
    queryKey: ["whoopStrain30"],
    queryFn: () => whoopService.getStrain(30),
  });
  const { data: recoveryData, isLoading: isLoadingRecovery } = useQuery({
    queryKey: ["whoopRecovery30"],
    queryFn: () => whoopService.getRecovery(30),
    enabled: !!strainData,
  });

  const isLoading = isLoadingStrain || isLoadingRecovery;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-whoop-teal" />
        </div>
      </MainLayout>
    );
  }

  const latestStrain = strainData?.[strainData.length - 1];
  const latestRecovery = recoveryData?.[recoveryData.length - 1];

  const strainValue = latestStrain?.score?.toFixed(1) ?? "--";
  const recoveryScore = latestRecovery?.score ?? 0;
  const recoveryValue = recoveryScore > 0 ? `${recoveryScore}%` : "--";

  const getRecoveryColorClass = (score: number) => {
    if (score >= 67) return "text-whoop-recovery-high";
    if (score >= 34) return "text-whoop-recovery-med";
    return "text-whoop-recovery-low";
  };
  const recoveryColorClass = getRecoveryColorClass(recoveryScore);

  const strainMetrics = [
    {
      icon: <Zap className="h-5 w-5 text-whoop-blue" />,
      label: "DAY STRAIN",
      value: strainValue,
      description: latestStrain?.score ? (latestStrain.score > 14 ? "High activity" : "Moderate activity") : "No data"
    },
    {
      icon: <Heart className={cn("h-5 w-5", recoveryColorClass)} />,
      label: "RECOVERY",
      value: recoveryValue,
      description: recoveryScore > 0 ? (recoveryScore >= 67 ? "Primed to perform" : recoveryScore >= 34 ? "Ready to go" : "Needs recovery") : "No data"
    },
    {
      icon: <Activity className="h-5 w-5 text-whoop-teal" />,
      label: "ACTIVITY SCORE",
      value: "--",
      description: "Calculation N/A"
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
            <Card key={index} className={cn("bg-whoop-black/80 backdrop-blur-sm", 
              metric.label === "RECOVERY" ? `border-${recoveryColorClass.split('-')[2]}/20` : "border-whoop-blue/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className={cn("p-2 rounded-full", 
                    metric.label === "RECOVERY" ? `bg-${recoveryColorClass.split('-')[2]}/10` : "bg-whoop-blue/10"
                  )}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-whoop text-whoop-white/70">
                      {metric.label}
                    </p>
                    <h3 className={cn("text-2xl font-din font-bold", 
                       metric.label === "RECOVERY" ? recoveryColorClass : "text-whoop-white"
                    )}>{metric.value}</h3>
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
              <StrainChart strainData={strainData} recoveryData={recoveryData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Strain;
