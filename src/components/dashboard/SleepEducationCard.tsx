import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Moon, Brain, Battery, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SleepEducationCard: React.FC = () => {
  // Ideal sleep stage ranges according to WHOOP
  const sleepStages = [
    {
      name: "Light Sleep",
      idealRange: "41-50%",
      description: "Transition stage to deeper sleep. Your body is more responsive to the environment.",
      icon: <Moon className="h-5 w-5 text-blue-300" />,
      color: "bg-blue-300"
    },
    {
      name: "Deep Sleep",
      idealRange: "17-20%",
      description: "Physical restoration. Your body repairs tissues, builds muscle, and strengthens immunity.",
      icon: <Battery className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-600"
    },
    {
      name: "REM Sleep",
      idealRange: "19-26%",
      description: "Mental restoration. Memory consolidation and dreaming occur during this stage.",
      icon: <Brain className="h-5 w-5 text-purple-400" />,
      color: "bg-purple-400"
    },
    {
      name: "Awake",
      idealRange: "2-10%",
      description: "Brief disturbances are normal. Most people experience 10-20 per night.",
      icon: <Clock className="h-5 w-5 text-orange-400" />,
      color: "bg-orange-400"
    }
  ];

  // Other key sleep metrics that WHOOP tracks
  const sleepMetrics = [
    {
      name: "Sleep Cycles",
      description: "A healthy adult typically experiences 3-5 complete sleep cycles per night. Each cycle includes Light, Deep, and REM sleep stages.",
      idealRange: "3-5 cycles"
    },
    {
      name: "Sleep Efficiency",
      description: "The percentage of time in bed actually spent asleep. Higher efficiency indicates more restorative sleep.",
      idealRange: "≥85%"
    },
    {
      name: "Sleep Consistency",
      description: "Going to bed and waking up at similar times each day helps regulate your circadian rhythm and improves sleep quality.",
      idealRange: "≥85%"
    },
    {
      name: "Respiratory Rate",
      description: "Tracking breathing rate during sleep can signal changes in health. Consistent rates indicate good recovery.",
      idealRange: "Consistent baseline"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-whoop-white/5 pb-3">
          <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
            UNDERSTANDING SLEEP STAGES
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-whoop-white/50 hover:text-whoop-white">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                  <p>WHOOP tracks all 4 sleep stages and their functions to optimize your recovery.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sleepStages.map((stage, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-whoop-black/40 rounded-lg border border-whoop-white/5">
                <div className={`${stage.color} p-2 rounded-full flex items-center justify-center`}>
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-whoop-white">{stage.name}</h3>
                    <span className="text-xs font-medium text-whoop-white/70">{stage.idealRange}</span>
                  </div>
                  <p className="text-xs text-whoop-white/60 mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-lg border border-whoop-white/10 bg-gradient-to-r from-whoop-black/40 to-whoop-black/70">
            <p className="text-xs text-whoop-white/80">
              <span className="font-medium text-whoop-sleep-blue">WHOOP Insight:</span> The ideal distribution varies by individual, but WHOOP users average Light Sleep (41-50%), Deep Sleep (17-20%), REM Sleep (19-26%), and Awake (2-10%). Your personalized sleep coach adjusts recommendations based on your unique patterns.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-whoop-white/5 pb-3">
          <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
            KEY SLEEP QUALITY INDICATORS
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-whoop-white/50 hover:text-whoop-white">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                  <p>WHOOP uses these metrics to assess overall sleep quality and recovery impact.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sleepMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-whoop-black/40 rounded-lg border border-whoop-white/5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-whoop-white">{metric.name}</h3>
                  <span className="text-xs font-medium text-whoop-white/70">Ideal: {metric.idealRange}</span>
                </div>
                <p className="text-xs text-whoop-white/60">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-lg border border-whoop-white/10 bg-gradient-to-r from-whoop-black/40 to-whoop-black/70">
            <p className="text-xs text-whoop-white/80">
              <span className="font-medium text-whoop-sleep-blue">WHOOP Insight:</span> WHOOP calculates your sleep need based on: (1) Baseline need from demographic data, (2) Sleep debt from previous nights, (3) Strain from physical activity, and (4) Recent naps. This personalized approach helps optimize recovery.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SleepEducationCard; 