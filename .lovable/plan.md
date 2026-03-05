

## Deep Contextual Analysis

**Core Value Proposition**: Users want to *understand and optimize their physiology* -- not just see numbers. The app currently mirrors WHOOP's own display, offering zero differentiation.

**Hidden Data Assets**: Recovery/strain/sleep time-series data contains exploitable correlations (strain-to-recovery lag, sleep timing vs HRV, cumulative load patterns). None are surfaced.

**Architecture State**: Pure client-side SPA. No backend, no database, no auth beyond WHOOP OAuth tokens stored in localStorage. No Supabase, no Cloud. All data is ephemeral (lost on logout). History page is a placeholder. Profile/Settings are hardcoded. Sleep/Strain pages call the API directly with no fallback.

**Critical Gaps**: No data persistence, no server-side logic, no security layer, no multi-user support, no intelligence layer.

---

## Impact vs Effort Matrix

```text
                        HIGH IMPACT
                            |
   AI Daily Briefing        |   Correlation Engine
   (Lovable Cloud +         |   (needs 30+ days stored
    edge function)          |    data first)
   EFFORT: Medium           |   EFFORT: High
                            |
  ──────────────────────────┼──────────────────────────
                            |
   Journal / Subjective     |   Team Dashboards
   Logging                  |   (RBAC, multi-tenant,
   EFFORT: Medium           |    sharing)
                            |   EFFORT: Very High
                            |
                        LOW IMPACT

                            |
   Strain Budget Widget     |   Multi-Source Fusion
   (client-side calc,       |   (Strava, MFP APIs)
    no backend needed)      |   EFFORT: Very High
   EFFORT: Low              |
  ──────────────────────────┼──────────────────────────
                            |
   Sleep/Strain Demo        |   Predictive Recovery
   Fallback (mock data      |   (ML model, large
    on unauthenticated)     |    dataset needed)
   EFFORT: Very Low         |   EFFORT: Very High
```

---

## Top 5 Value-Add Features

### 1. AI Daily Briefing (Highest Impact / Medium Effort) -- THE TOP PRIORITY

A zero-click "Morning Intelligence" card on the dashboard that analyzes today's recovery, strain, sleep and generates a natural-language recommendation. Uses Lovable Cloud edge function + Lovable AI gateway. No external API key needed.

### 2. Strain Budget Widget (High Impact / Low Effort)

Real-time "remaining strain" gauge: given today's recovery score, calculate a recommended strain ceiling and show how much is left. Pure client-side math, no backend.

### 3. Backend Data Persistence (Foundational / Medium Effort)

Enable Lovable Cloud, create tables for `whoop_snapshots` (recovery, strain, sleep per day per user), and sync on each dashboard load. Unlocks history page, trend analysis, and the correlation engine.

### 4. Journal / Subjective Logging (High Impact / Medium Effort)

Let users log caffeine, alcohol, mood, soreness. Store in Supabase. Correlate with WHOOP metrics over time.

### 5. Sleep Optimizer (High Impact / Medium Effort)

Analyze stored sleep data to recommend optimal bedtime based on personal HRV/recovery patterns.

---

## Priority #1: AI Daily Briefing -- Full Implementation Plan

### Why This First
- Immediate "wow" factor -- zero-click intelligence the moment the dashboard loads
- Requires only Lovable Cloud (edge function + Lovable AI gateway) -- no external API keys
- Works with current mock data for demo, live data when authenticated
- Single highest differentiator vs WHOOP's own app

### Architecture

```text
Dashboard (Index.tsx)
  └─ <AIDailyBriefing recovery={} strain={} sleep={} />
       └─ calls supabase.functions.invoke("daily-briefing", { body: metrics })
            └─ Edge Function: POST Lovable AI Gateway
                 └─ System prompt + user metrics → natural language briefing
```

### Implementation Steps

**Step 1: Enable Lovable Cloud**
- Required to create edge functions and access `LOVABLE_API_KEY`

**Step 2: Create Edge Function `supabase/functions/daily-briefing/index.ts`**
- Accepts `{ recovery, strain, sleep }` metrics in request body
- Constructs a system prompt: "You are a sports science coach analyzing WHOOP data. Given the user's metrics, provide a 3-4 sentence briefing covering: current recovery state, what it means for training today, one specific actionable recommendation."
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with the prompt + metrics
- Returns non-streaming JSON response (briefings are short, no need to stream)
- Handles 429/402 errors gracefully

**Step 3: Update `supabase/config.toml`**
- Add `[functions.daily-briefing]` with `verify_jwt = false`

**Step 4: Create `src/components/dashboard/AIDailyBriefing.tsx`**
- Props: `recovery`, `strain`, `sleep` data (same types already used)
- On mount (or button click), invokes the edge function with latest metrics
- Displays a card with:
  - Header: "AI DAILY BRIEFING" with a sparkle/brain icon
  - Loading skeleton while fetching
  - The AI-generated text
  - Timestamp of when it was generated
  - "Refresh" button to regenerate
- Error state: shows friendly message if rate-limited or gateway unavailable
- Caches the result in React state so it doesn't re-fetch on every render

**Step 5: Integrate into Dashboard (`src/pages/Index.tsx`)**
- Add `<AIDailyBriefing>` component between the `DailyOverview` and the charts grid
- Pass `latestRecovery`, `latestStrain`, `latestSleep` as props
- Works with both mock and live data

**Step 6: Add Strain Budget to the same dashboard update**
- Pure client-side: if recovery >= 67, target strain = 14; if >= 34, target = 10; else target = 6
- Show a progress bar: "Strain Budget: 8.2 / 14.0 remaining"
- Add as a small card next to "My Day"

### Database Changes
None required for this feature. Data persistence (Step 3 in the roadmap) comes next.

### Security Considerations
- Edge function uses `LOVABLE_API_KEY` server-side only
- No user secrets exposed to client
- Rate limit errors (429/402) surfaced via toast

