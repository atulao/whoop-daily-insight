import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { WhoopRecovery, WhoopStrain, WhoopSleep } from "@/services/whoopService";

interface AIDailyBriefingProps {
  recovery: WhoopRecovery | null | undefined;
  strain: WhoopStrain | null | undefined;
  sleep: WhoopSleep | null | undefined;
}

const AIDailyBriefing: React.FC<AIDailyBriefingProps> = ({ recovery, strain, sleep }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("daily-briefing", {
        body: { recovery, strain, sleep },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setBriefing(data.briefing);
      setGeneratedAt(data.generatedAt);
    } catch (e: any) {
      const msg = e?.message || "Failed to generate briefing";
      setError(msg);
      toast({ title: "Briefing Error", description: msg, variant: "destructive" });
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }, [recovery, strain, sleep]);

  // Auto-fetch on first render if we have data
  React.useEffect(() => {
    if (!hasFetched && !loading && (recovery || strain || sleep)) {
      fetchBriefing();
    }
  }, [hasFetched, loading, recovery, strain, sleep, fetchBriefing]);

  return (
    <Card className="bg-whoop-black/80 backdrop-blur-sm border-whoop-teal/20 relative overflow-hidden">
      {/* Subtle glow accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-whoop-teal to-transparent" />

      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-whoop-teal" />
          <CardTitle className="text-sm font-sans font-bold uppercase tracking-whoop text-whoop-white">
            AI Daily Briefing
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-whoop-white/50 hover:text-whoop-teal hover:bg-whoop-white/5"
          onClick={fetchBriefing}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {loading && !briefing ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-whoop-white/10" />
            <Skeleton className="h-4 w-[90%] bg-whoop-white/10" />
            <Skeleton className="h-4 w-[75%] bg-whoop-white/10" />
          </div>
        ) : error && !briefing ? (
          <div className="flex items-start gap-2 text-whoop-white/60">
            <AlertCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : briefing ? (
          <div>
            <p className="text-sm text-whoop-white/90 leading-relaxed font-normal">
              {briefing}
            </p>
            {generatedAt && (
              <p className="text-xs text-whoop-white/40 mt-3">
                Generated {new Date(generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-whoop-white/50">Waiting for metrics…</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDailyBriefing;
