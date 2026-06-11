import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * SkillAgentBanner - the funnel from an SEO skill page to the core benefit.
 *
 * Skill pages rank well and pull in organic / answer-engine traffic, but their
 * native CTAs are "run inline" / "install the plugin" - the old skill-discovery
 * framing. This banner reframes the visit around what Implexa is actually for:
 * turning a skill like this into a multi-step AGENT that runs on a schedule in
 * your own Claude or Codex, free. The copy is crawlable (AEO), keyword-led, and
 * the CTA carries a skill-aware intent straight into the build/signup flow.
 *
 * Server component - it's a styled link, no client state needed. The subtle
 * pulse is pure CSS so it stays "eye-popping" without JS.
 */
export function SkillAgentBanner({ skillName }: { skillName: string }) {
  const intent = `Build a multi-step agent that uses the "${skillName}" skill and runs on a schedule in my own Claude or Codex`;
  const href = `https://app.implexa.ai/signup?intent=${encodeURIComponent(
    intent.slice(0, 500),
  )}`;

  return (
    <aside className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.06] to-transparent p-4 sm:p-5">
      {/* soft glow accent */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-amber-500/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex-1">
          <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
            </span>
            <Sparkles className="size-3" aria-hidden="true" />
            Do more with this skill
          </div>
          <p className="text-base font-semibold text-white sm:text-lg">
            Create multi-step agents using this skill at Implexa
          </p>
          <p className="mt-0.5 text-sm text-zinc-400">
            Implexa builds skills like this into agents that run on a schedule
            inside your own Claude or Codex, as you, free.
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex flex-none items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-300"
        >
          Build an agent with this skill
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
