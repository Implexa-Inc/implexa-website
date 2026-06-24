import { cache } from "react";

// The proof-layer grade for a public agent: "delivered N% across M real runs."
// PUBLIC aggregate only, behind the backend's min-N / k-anonymity floor (returns
// hasGrade:false until enough distinct runs/users), so it can never expose a single
// private run. Graded on what actually happened, not an LLM score. See the
// outcome-ledger (migration 0091).

const BACKEND = (process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai").replace(/\/$/, "");

export type AgentGrade = {
  hasGrade: boolean;
  rate: number;
  label: "reliable" | "mixed" | "unproven";
  runs: number;
  confidence: number;
};

// Cached per-request (React dedup) + ISR (1h). Best-effort: any failure returns
// null so the page renders without the badge rather than erroring.
export const fetchAgentGrade = cache(async (slug: string): Promise<AgentGrade | null> => {
  if (!slug) return null;
  try {
    const res = await fetch(`${BACKEND}/api/v2/agents/${encodeURIComponent(slug)}/grade`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean; grade?: AgentGrade };
    return body?.grade?.hasGrade ? body.grade : null;
  } catch {
    return null;
  }
});
