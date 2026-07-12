// hub-catalog.ts — curated CATEGORY HUBS ("Best AI agents for X").
//
// The workflow data is tagged by ICP `vertical` (builder / realtor), but buyers
// search by TASK category ("best AI agents for SEO", "for social media", "for
// cold outreach"). This is the decoupled curated layer — the same pattern as
// QUERY_MAP in workflow-query.ts — that maps a task category to the workflows
// that serve it, with the AEO answer copy and trust-tier ranking. Add a hub or
// a keyword here without touching the page template.
//
// Launch set = the four the roadmap ships deep first (Growth · Content
// marketing · Sales outreach · SEO/AEO). Everything is Tier-A framed (runs on
// your own Claude/Codex, no browser required) so nothing on these pages depends
// on an unshipped capability.

import type { WorkflowCard } from "@/lib/workflow-catalog";
import { resolveQuery } from "@/lib/workflow-query";

export type Hub = {
  slug: string; // /agents/<slug>
  category: string; // human label, lowercase ("growth", "SEO & AEO")
  h1: string; // page H1 — the "best agents for X" query
  answer: string; // 2-sentence direct answer, written to be lifted verbatim by answer engines
  intro: string; // supporting line under the answer
  keywords: string[]; // matched (case-insensitive) against slug/name/outcome/query
};

export const HUBS: Hub[] = [
  {
    slug: "growth",
    category: "growth",
    h1: "Best AI agents for growth",
    answer:
      "These are agents that do the repetitive growth work — monitoring competitors, checking rankings, researching leads, and drafting outreach — on a schedule. Each one runs free inside the Claude or Codex subscription you already pay for, on your real data, and never touches your accounts or credentials.",
    intro:
      "Ranked by verified track record, not popularity. Build any of them from one sentence and it runs itself every morning.",
    keywords: [
      "growth", "lead", "leads", "prospect", "competitor", "monitor", "traffic",
      "signup", "funnel", "outreach", "market", "audience", "acquisition",
    ],
  },
  {
    slug: "content-marketing",
    category: "content marketing",
    h1: "Best AI agents for content marketing",
    answer:
      "These agents produce and repurpose content on a schedule — blog drafts, social posts, reels, video-to-article — inside your own Claude or Codex, free, on your real data. They draft where you approve, so you stay in control while the grunt work runs itself.",
    intro:
      "Ranked by verified track record, not popularity. Describe the content job once; the agent runs it on cadence.",
    keywords: [
      "content", "blog", "reel", "instagram", "youtube", "linkedin", "social",
      "post", "video", "thumbnail", "caption", "newsletter", "article", "seo blog",
    ],
  },
  {
    slug: "sales-outreach",
    category: "sales outreach",
    h1: "Best AI agents for sales outreach",
    answer:
      "These agents handle the outbound grind — prospect research, cold-email and follow-up drafting, CRM hygiene — on a schedule inside your own Claude or Codex, free, and never touching your inbox credentials. They prepare the send; you approve it.",
    intro:
      "Ranked by verified track record, not popularity. One sentence in; a repeatable outreach motion out.",
    keywords: [
      "outreach", "cold", "email", "prospect", "lead", "follow-up", "followup",
      "crm", "sequence", "dm", "sales", "pipeline", "decision-maker", "enrichment",
    ],
  },
  {
    slug: "seo-aeo",
    category: "SEO & AEO",
    h1: "Best AI agents for SEO and AEO",
    answer:
      "These agents run the ongoing search work — rank and index checks, SERP and competitor monitoring, content-brief drafting, and answer-engine (AEO) optimization — on a schedule inside your own Claude or Codex, free, on your real data. Unattended reading works today; nothing is published without your say-so.",
    intro:
      "Ranked by verified track record, not popularity. Set it once and get a standing view of where you rank and why.",
    keywords: [
      "seo", "aeo", "rank", "ranking", "serp", "keyword", "index", "sitemap",
      "backlink", "brief", "search", "answer engine", "llms.txt", "schema",
    ],
  },
];

export function getHub(slug: string): Hub | undefined {
  return HUBS.find((h) => h.slug === slug);
}

function haystack(w: WorkflowCard): string {
  return [w.slug, w.name, w.primary_outcome, w.description, resolveQuery(w)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Trust tier — the ONLY primary sort key. Popularity never enters (the
// anti-GPT-Store stance; stated on the page). curated (proven, hand-vetted) >
// measured (real non-degraded runs) > seeded (indexable, not amplified).
export function trustTier(w: WorkflowCard): 2 | 1 | 0 {
  if (w.curated) return 2;
  if (!w.unproven && (w.run_count > 0 || w.scheduled_count > 0)) return 1;
  return 0;
}

export function trustLabel(w: WorkflowCard): "verified" | "measured" | "seeded" {
  const t = trustTier(w);
  return t === 2 ? "verified" : t === 1 ? "measured" : "seeded";
}

export function selectForHub(hub: Hub, all: WorkflowCard[]): WorkflowCard[] {
  const matched = all.filter((w) => {
    const h = haystack(w);
    return hub.keywords.some((k) => h.includes(k));
  });
  // Rank by trust tier first; tie-break on real usage volume (never the reverse).
  return matched.sort((a, b) => {
    const t = trustTier(b) - trustTier(a);
    if (t !== 0) return t;
    return b.run_count + b.scheduled_count - (a.run_count + a.scheduled_count);
  });
}
