import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Brain, Heart, Activity, ZapOff, LineChart, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const WhoopSleepInsights: React.FC = () => {
  // Key WHOOP sleep insights based on research and WHOOP methodology
  const sleepInsights = [
    {
      title: "Sleep Cycles",
      description: "Your brain cycles through 3-5 complete sleep cycles per night, each lasting 90-110 minutes. Each cycle includes Light, Deep, and REM stages, with REM periods becoming longer toward morning.",
      icon: <Brain className="h-5 w-5 text-whoop-sleep-blue" />,
      link: "https://www.whoop.com/thelocker/podcast-57-sleep-cycles-stages-rem-deep-light/",
    },
    {
      title: "Recovery Connection",
      description: "WHOOP has found that increasing your sleep performance by just 10% can improve your next-day recovery score by an average of 5-7%. Quality sleep is the strongest predictor of recovery.",
      icon: <Heart className="h-5 w-5 text-whoop-red" />,
      link: "https://www.whoop.com/thelocker/maximize-sleep-recovery/",
    },
    {
      title: "Strain Impact",
      description: "For every 1 hour increase in Strain, WHOOP calculates you need an extra 15-20 minutes of sleep to fully recover. High strain days require significantly more sleep to support recovery.",
      icon: <Activity className="h-5 w-5 text-whoop-green" />,
      link: "https://www.whoop.com/thelocker/recovery-strain-relationship/",
    },
    {
      title: "Sleep Disruptions",
      description: "WHOOP has identified that late meals, alcohol, and screen time before bed can reduce Deep and REM sleep by 5-20%, with alcohol having particularly negative effects on REM sleep.",
      icon: <ZapOff className="h-5 w-5 text-amber-400" />,
      link: "https://www.whoop.com/thelocker/alcohol-affects-sleep/",
    },
    {
      title: "Sleep Consistency",
      description: "WHOOP data shows that members with 85%+ sleep consistency scores average 42% higher sleep quality and see an average of 8% higher recovery scores than those with inconsistent schedules.",
      icon: <LineChart className="h-5 w-5 text-blue-400" />,
      link: "https://www.whoop.com/thelocker/sleep-consistency-improves-recovery/",
    },
    {
      title: "Sleep Debt",
      description: "WHOOP calculates that accumulated sleep debt can take up to 4 days to fully recover from. One hour of sleep debt requires approximately 1.5 hours of extra sleep spread over subsequent nights.",
      icon: <AlertTriangle className="h-5 w-5 text-rose-400" />,
      link: "https://www.whoop.com/thelocker/sleep-need-vs-debt/",
    }
  ];

  return (
    <Card className="bg-whoop-black/70 backdrop-blur-sm border-whoop-white/10 shadow-lg overflow-hidden">
      <CardHeader className="border-b border-whoop-white/5 pb-3">
        <CardTitle className="text-lg uppercase tracking-whoop text-whoop-white flex items-center justify-between">
          WHOOP SLEEP SCIENCE
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-whoop-white/50 hover:text-whoop-white">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border-gray-700 text-white p-2 max-w-xs">
                <p>Key insights from WHOOP's sleep research and data analysis from millions of sleep cycles.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sleepInsights.map((insight, index) => (
            <div 
              key={index} 
              className="p-4 border border-whoop-white/10 rounded-lg bg-whoop-black/40 hover:bg-whoop-black/30 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-2 rounded-full bg-whoop-black/60 flex-shrink-0">
                  {insight.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-whoop-white mb-1">{insight.title}</h3>
                  <p className="text-xs text-whoop-white/70 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-whoop-sleep-blue/20 to-whoop-black/40 rounded-lg border border-whoop-sleep-blue/20">
          <h3 className="text-sm font-medium text-whoop-sleep-blue mb-2">Why WHOOP's Sleep Tracking Matters</h3>
          <p className="text-xs text-whoop-white/80 leading-relaxed">
            WHOOP utilizes advanced algorithms to analyze data from millions of sleep cycles across its user base. This data-driven approach allows WHOOP to provide personalized sleep recommendations based on your unique patterns, strain levels, and recovery needs. By tracking all four sleep stages and applying sleep science research, WHOOP helps optimize your sleep quality to maximize performance and recovery.
          </p>
          <div className="mt-3 text-right">
            <a 
              href="https://www.whoop.com/thelocker/improve-sleep-quality/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-whoop-sleep-blue hover:text-whoop-sleep-blue/80 transition-colors"
            >
              Learn more about WHOOP sleep research →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhoopSleepInsights; 