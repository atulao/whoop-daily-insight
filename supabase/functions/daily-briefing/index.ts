import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recovery, strain, sleep } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const metricsText = `
Recovery Score: ${recovery?.score ?? "N/A"}%
Resting Heart Rate: ${recovery?.restingHeartRate ?? "N/A"} bpm
HRV: ${recovery?.hrvMs ?? "N/A"} ms
Strain Score: ${strain?.score ?? "N/A"}
Average Heart Rate: ${strain?.averageHeartRate ?? "N/A"} bpm
Max Heart Rate: ${strain?.maxHeartRate ?? "N/A"} bpm
Calories Burned: ${strain?.kilojoules ? Math.round(strain.kilojoules * 0.239006) : "N/A"} kcal
Sleep Duration: ${sleep?.qualityDuration ? (sleep.qualityDuration / 3600000).toFixed(1) : "N/A"} hours
Sleep Need: ${sleep?.sleepNeed ? (sleep.sleepNeed / 3600000).toFixed(1) : "N/A"} hours
Respiratory Rate: ${sleep?.respiratoryRate ?? "N/A"} rpm
    `.trim();

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an elite sports science coach analyzing WHOOP biometric data. Given the user's daily metrics, provide a concise 3-4 sentence briefing that covers:
1. Current recovery state and what it means physiologically
2. Training recommendation for today (intensity level, type of workout)
3. One specific, actionable optimization tip (sleep, nutrition, or recovery strategy)

Be direct, confident, and data-driven. Use the actual numbers. Avoid generic advice. Write like a personal coach who knows the athlete well. Do not use markdown formatting, bullet points, or headers — write in flowing prose.`,
            },
            {
              role: "user",
              content: `Here are my WHOOP metrics for today:\n\n${metricsText}`,
            },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const briefing = data.choices?.[0]?.message?.content ?? "Unable to generate briefing.";

    return new Response(
      JSON.stringify({ briefing, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("daily-briefing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
