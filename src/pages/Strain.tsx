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
    queryKey: ["whoopStrain"],
    queryFn: () => whoopService.getStrain(7),
  });
  const { data: recoveryData, isLoading: isLoadingRecovery } = useQuery({
    queryKey: ["whoopRecovery"],
    queryFn: () => whoopService.getRecovery(7),
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

  const getLatestWithScore = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const withScore = data.find(item => item.score && Object.keys(item.score).length > 0);
    
    if (withScore) {
      console.log('[DEBUG] Found record with score:', withScore);
      return withScore;
    }
    
    console.log('[WARNING] No records with score found, using first record:', data[0]);
    return data[0];
  };

  const latestStrain = getLatestWithScore(strainData || []);
  const latestRecovery = getLatestWithScore(recoveryData || []);

  const strainValue = latestStrain?.score?.strain ? latestStrain.score.strain.toFixed(1) : "--";
  const recoveryScore = latestRecovery?.score?.recovery_score ?? 0;
  const recoveryValue = recoveryScore > 0 ? `${recoveryScore}%` : "--";

  const getRecoveryColorClass = (score: number) => {
    if (score >= 67) return "text-whoop-recovery-high";
    if (score >= 34) return "text-whoop-recovery-med";
    return "text-whoop-recovery-low";
  };
  
  const getRecoveryColor = (score: number) => {
    if (score >= 67) return "#16EC06"; // green
    if (score >= 34) return "#FFDE00"; // yellow
    return "#FF0026"; // red
  };
  
  const recoveryColorClass = getRecoveryColorClass(recoveryScore);
  const recoveryColor = getRecoveryColor(recoveryScore);

  const getStrainDescription = (strain: number) => {
    if (strain >= 18) return "Extreme activity";
    if (strain >= 14) return "High activity";
    if (strain >= 8) return "Moderate activity";
    return "Light activity";
  };

  const getRecoveryDescription = (score: number) => {
    if (score >= 67) return "Primed to perform";
    if (score >= 34) return "Ready to go";
    return "Needs recovery";
  };

  const strainMetrics = [
    {
      icon: <Zap className="h-5 w-5 text-whoop-blue" />,
      label: "DAY STRAIN",
      value: strainValue,
      color: "#0093E7", // blue
      description: latestStrain?.score?.strain ? getStrainDescription(latestStrain.score.strain) : "No data"
    },
    {
      icon: <Heart className={cn("h-5 w-5", recoveryColorClass)} />,
      label: "RECOVERY",
      value: recoveryValue,
      color: recoveryColor,
      description: recoveryScore > 0 ? getRecoveryDescription(recoveryScore) : "No data"
    },
    {
      icon: <Activity className="h-5 w-5 text-whoop-white" />,
      label: "ACTIVITY SCORE",
      value: "--",
      color: "#FFFFFF",
      description: "Calculation N/A"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <header className="pb-8">
          <div className="mb-2 text-xs text-whoop-white/50">Data by WHOOP</div>
          <h1 className="text-4xl font-bold uppercase tracking-whoop text-whoop-white mb-2">
            STRAIN
          </h1>
          <p className="text-lg text-whoop-white/70">
            Track your daily cardiovascular load
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {strainMetrics.map((metric, index) => (
            <Card key={index} className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-3">
                    {metric.icon}
                    <span className="ml-2 text-xs font-medium uppercase tracking-whoop text-whoop-white/70">
                      {metric.label}
                    </span>
                  </div>
                  <h3 
                    className="text-5xl font-din font-bold mb-1"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </h3>
                  <p className="text-sm text-whoop-white/70 font-medium">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-whoop-white/5 pb-3">
              <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white">WEEKLY STRAIN OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[350px]">
                <div className="text-xs uppercase tracking-wide text-whoop-white/50 mb-4 pl-4">
                  7-DAY STRAIN VS. RECOVERY
                </div>
                <div className="text-xs text-whoop-white/50 mb-2 pl-4">Data by WHOOP</div>
                <StrainChart strainData={strainData} recoveryData={recoveryData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Strain;
