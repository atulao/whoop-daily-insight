import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { grant_type, code, redirect_uri, code_verifier, client_id, refresh_token } = await req.json();

    const WHOOP_CLIENT_SECRET = Deno.env.get("WHOOP_CLIENT_SECRET");
    if (!WHOOP_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "WHOOP_CLIENT_SECRET is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the token request body
    const tokenBody: Record<string, string> = {
      grant_type,
      client_id,
      client_secret: WHOOP_CLIENT_SECRET,
    };

    if (grant_type === "authorization_code") {
      tokenBody.code = code;
      tokenBody.redirect_uri = redirect_uri;
      if (code_verifier) tokenBody.code_verifier = code_verifier;
    } else if (grant_type === "refresh_token") {
      tokenBody.refresh_token = refresh_token;
    }

    const response = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokenBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WHOOP token error:", response.status, JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: data.error_description || data.error || "Token exchange failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("whoop-token-exchange error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
