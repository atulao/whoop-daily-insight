
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Plus, Timer, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyDayProps {
  sleepDuration: string;
  sleepTime: string;
  wakeTime: string;
}

const MyDay: React.FC<MyDayProps> = ({ sleepDuration, sleepTime, wakeTime }) => {
  return (
    <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-sans font-bold text-whoop-white">My Day</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-whoop-black/40 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-whoop-white/5 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-whoop-sleep-blue/20 rounded-lg flex items-center justify-center">
              <Moon className="h-6 w-6 text-whoop-sleep-blue" />
            </div>
            <div>
              <p className="font-din text-xl font-bold text-whoop-white">{sleepDuration}</p>
              <p className="text-sm text-whoop-white/70">
                {sleepTime} - {wakeTime}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-whoop-white/50" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="w-full bg-whoop-black/40 border-whoop-white/10 hover:bg-whoop-white/5 text-whoop-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
          <Button
            variant="outline"
            className="w-full bg-whoop-black/40 border-whoop-white/10 hover:bg-whoop-white/5 text-whoop-white"
          >
            <Timer className="h-4 w-4 mr-2" />
            Start Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyDay;
