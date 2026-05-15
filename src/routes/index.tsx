import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Flame,
  Copy,
  Play,
  Circle,
  Share2,
  TrendingUp,
  ArrowRight,
  Trophy,
  Crown,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircuitReveal } from "@/components/CircuitReveal";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Implexa — Stop teaching Claude the same workflow every time." },
      {
        name: "description",
        content:
          "Implexa captures every workflow you run in Claude — across CLI, Desktop, and Cowork — and turns it into a reusable skill anyone can replay with their own tools.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label="Implexa"
      className={`group relative inline-flex select-none items-center ${className}`}
    >
      <span className="flex items-baseline text-[22px] font-semibold tracking-tight text-[var(--heading)]">
        {/* lowercase 'i' — emerald node replaces the tittle */}
        <span className="relative inline-block">
          <span className="font-semibold">ı</span>
          <span
            aria-hidden
            className="absolute -top-[1px] left-1/2 size-[6px] -translate-x-1/2 rounded-full bg-emerald-400 ring-1 ring-[var(--background)] shadow-[0_0_10px_rgba(16,185,129,0.75)] transition-transform duration-300 group-hover:scale-125"
          />
        </span>
        mple
        {/* 'x' — flame node at the crossing */}
        <span className="relative inline-block">
          <span>x</span>
          <span
            aria-hidden
            className="absolute left-1/2 top-[50%] size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame ring-1 ring-[var(--background)] shadow-[0_0_10px_rgba(255,138,60,0.8)] transition-transform duration-300 group-hover:scale-125"
          />
        </span>
        a
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-[rgba(10,8,5,0.7)] border-b border-divider"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <Wordmark />
        <div className="flex items-center gap-1 sm:gap-3 text-sm">
          <a
            href="#how-it-works"
            className="hidden sm:inline-block px-3 py-2 text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hidden sm:inline-block px-3 py-2 text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            Pricing
          </a>
          <a
            href="https://app.implexa.ai"
            className="px-3 py-2 text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            Sign in
          </a>
          <a
            href="https://app.implexa.ai/signup"
            className="rounded-md bg-flame px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-all hover:glow-flame"
          >
            Get started — free
          </a>
        </div>
      </nav>
    </header>
  );
}

function TerminalBlock() {
  const lines: Array<{ comment?: string; cmd?: string; trail?: string }> = [
    { comment: "# Inside Claude Code, Desktop, or Cowork:" },
    { cmd: "record-skill", trail: "← captures this session" },
    { cmd: "run daily-prospecting", trail: "← replay a saved skill" },
    { cmd: "share-this", trail: "← team or public" },
  ];
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText("/implexa:record-skill");
        toast("Copied!", {
          style: {
            background: "var(--surface-2)",
            color: "var(--ember)",
            border: "1px solid var(--divider)",
          },
        });
      }}
      className="group cursor-pointer rounded-md border-l-[3px] border-l-flame border border-divider bg-surface px-5 py-4 font-mono text-[13px] text-left transition-colors hover:border-flame/50"
    >
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.4, duration: 0.35 }}
          className="flex items-center gap-3 leading-7"
        >
          {l.comment ? (
            <span className="text-muted-foreground/70">{l.comment}</span>
          ) : (
            <>
              <span className="text-muted-foreground/60">$</span>
              <span>
                <span className="text-flame">/implexa:</span>
                <span className="text-[var(--heading)]">{l.cmd}</span>
              </span>
              <span className="text-muted-foreground/60">{l.trail}</span>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20"
    >
      <div className="absolute inset-0 -z-10 radial-firelight" />
      <div className="mx-auto max-w-[1100px] px-6 text-center">
        <motion.div
          {...fadeUp}
          className="mb-10 text-[11px] sm:text-[12px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: "#FF5722" }}
        >
          ⚡ For teams that want to adopt Claude 10× faster
        </motion.div>
        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="text-[34px] sm:text-[52px] lg:text-[64px] font-semibold tracking-tight leading-[1.08] text-[var(--heading)]"
        >
          From Claude <span className="underline-flame">work</span> to workflows.
          <br />
          Automatically, across <span className="underline-flame">teams</span>!
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mx-auto mt-12 max-w-[640px] text-[17px] sm:text-[19px] font-normal leading-relaxed"
          style={{ color: "var(--ink-200, #d4d4d8)" }}
        >
          Implexa watches your Claude sessions, converts them into shareable
          skills, and tracks what's actually working — so the whole team gets
          faster every time someone figures something out.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.22 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://app.implexa.ai/signup"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-flame px-6 py-3 font-medium text-[var(--primary-foreground)] transition-all hover:glow-flame-lg"
          >
            Get started — free <ArrowRight className="size-4" />
          </a>
          <button
            onClick={() => toast("Demo player coming soon")}
            className="inline-flex items-center justify-center gap-2 text-[var(--heading)] transition-colors hover:text-flame"
          >
            Watch a 90-second demo →
          </button>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="mt-12 mx-auto max-w-[640px]"
        >
          <TerminalBlock />
        </motion.div>
      </div>
    </section>
  );
}

function StoryCard({
  icon,
  title,
  body,
  cmd,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cmd: string;
  delay: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      className="group relative flex flex-col rounded-2xl border border-divider bg-surface p-7 transition-colors hover:border-flame/40"
    >
      <div className="mb-5">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-[15px] text-muted-foreground">{body}</p>
      <div className="mt-6 inline-block self-start rounded-md border border-divider bg-[var(--background)] px-3 py-1.5 font-mono text-[12px] text-flame">
        {cmd}
      </div>
    </motion.div>
  );
}

function PromiseCard({
  num,
  numColor,
  title,
  body,
  cmd,
  delay,
}: {
  num: string;
  numColor: string;
  title: string;
  body: string;
  cmd: string;
  delay: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      className="group relative flex flex-col rounded-2xl border border-divider bg-surface p-7 transition-colors hover:border-flame/40"
    >
      <span
        className={`mb-5 inline-flex size-9 items-center justify-center rounded-full border font-mono text-[13px] font-semibold ${numColor}`}
      >
        {num}
      </span>
      <h3 className="text-lg font-semibold leading-snug text-[var(--heading)]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-6 inline-block self-start rounded-md border border-divider bg-[var(--background)] px-3 py-1.5 font-mono text-[12px] text-flame">
        {cmd}
      </div>
    </motion.div>
  );
}

function ThreeAct() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1180px] px-6 pt-12 pb-28 sm:pt-16 sm:pb-28">
      <div className="mx-auto max-w-[820px] text-center">
        <motion.div {...fadeUp} className="text-[12px] font-semibold uppercase tracking-[0.18em] text-flame">
          What you get
        </motion.div>
        <motion.h2
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-3xl sm:text-4xl font-semibold text-[var(--heading)]"
        >
          Three promises. Three commands. One compounding library.
        </motion.h2>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <PromiseCard
          delay={0}
          num="01"
          numColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          title="Convert your Claude sessions into skills. Automatically."
          body="Run your usual workflow. Implexa watches the session, captures every tool call and every prompt-response turn, then asks 3-5 quick questions to extract the decision points and outcome signal. The result: a structured skill anyone can re-invoke."
          cmd="/implexa:record-skill"
        />
        <PromiseCard
          delay={0.08}
          num="02"
          numColor="text-flame bg-flame/10 border-flame/30"
          title="Replay with a single line. Share with your team or the world."
          body="Saved skills become first-class slash commands inside Claude. Domain-gated team shares keep skills internal — only your @company.com can install. Public shares put your skill in front of every Claude user via Trending Globally."
          cmd="/implexa:share-this"
        />
        <PromiseCard
          delay={0.16}
          num="03"
          numColor="text-ember bg-ember/10 border-ember/30"
          title="Measure outcomes. Improve what works."
          body="Every invocation is logged with structured outputs. When your CRM, calendar, or ATS shows a meeting booked, a deal closed, or a role filled, Implexa attributes it back to the skill that drove it. You see what's working — not what feels productive."
          cmd="/implexa:skill-roi"
        />
      </div>
    </section>
  );
}

function SkillCardCenterpiece() {
  return (
    <section className="relative mx-auto max-w-[1180px] px-6 pb-28">
      <div className="absolute inset-x-0 top-1/2 -z-10 h-[400px] -translate-y-1/2 radial-firelight opacity-50" />
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-[820px] rounded-2xl border border-divider bg-surface p-2 shadow-2xl"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-divider">
          <span className="size-2.5 rounded-full bg-[#3a2a1a]" />
          <span className="size-2.5 rounded-full bg-[#3a2a1a]" />
          <span className="size-2.5 rounded-full bg-[#3a2a1a]" />
          <span className="ml-3 font-mono text-[12px] text-muted-foreground">
            SKILL.md
          </span>
        </div>
        <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-7 text-[var(--foreground)]">
{`---
description: Daily target account brief — pulls closed-lost re-engagement
candidates and net-new accounts in Staffing/Construction, filters by ICP score.
---

`}<span className="text-flame font-semibold">{`# Daily Account Targeting`}</span>{`

`}<span className="text-flame font-semibold">{`## Step 1`}</span>{` — Query closed-lost opportunities from past 3 months
Call `}<span className="text-ember">{`crm_query`}</span>{` with `}<span className="text-ember">{`StageName`}</span>{` = 'Closed Lost'
AND `}<span className="text-ember">{`CloseDate`}</span>{` >= LAST_N_MONTHS:3

`}<span className="text-flame font-semibold">{`## Step 2`}</span>{` — Query net-new accounts with no prior touchpoints
...

`}<span className="text-flame font-semibold">{`## Outcome signal`}</span>{`
`}<span className="text-ember">{`meeting_booked`}</span>{`  ·  source: calendar  ·  target: >5%`}
        </pre>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-divider px-6 py-4 text-[13px] text-muted-foreground"
        >
          <span className="text-flame font-medium">Used 47×</span> this week ·{" "}
          <span className="text-ember">12 attributed meetings</span> ·{" "}
          <span className="text-[var(--heading)]">$84K pipeline</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrendingGlobally() {
  const skills = [
    { name: "Daily LinkedIn prospect discovery", slug: "/implexa:linkedin-prospects", fn: "Sales", uses: 234, by: "Devon" },
    { name: "PR review summary from GitHub", slug: "/implexa:pr-review-summary", fn: "Engineering", uses: 198, by: "Priya" },
    { name: "Renewal risk brief", slug: "/implexa:renewal-risk", fn: "Customer Success", uses: 167, by: "Jules" },
    { name: "Bug triage from Sentry alerts", slug: "/implexa:sentry-triage", fn: "Engineering", uses: 142, by: "Marcus" },
    { name: "Performance review prep", slug: "/implexa:perf-review-prep", fn: "HR / People Ops", uses: 118, by: "Maya" },
  ];
  const rankColor = (i: number) =>
    i === 0 ? "text-ember bg-ember/10 border-ember/30"
    : i === 1 ? "text-[#C0C0C0] bg-white/5 border-white/15"
    : i === 2 ? "text-flame bg-flame/10 border-flame/30"
    : "text-muted-foreground bg-surface-2 border-divider";
  return (
    <section className="relative bg-surface border-y border-divider">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame/40 to-transparent" />
      <div className="mx-auto max-w-[1180px] px-6 py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
            Skills your peers are publishing right now.
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            <span className="text-flame">🔥 Trending Globally</span> — the
            community surface for cross-org skill discovery.
          </motion.p>
        </div>
        <motion.div
          {...fadeUp}
          className="mx-auto mt-12 max-w-[820px] divide-y divide-divider rounded-2xl border border-divider bg-[var(--background)]"
        >
          {skills.map((s, i) => (
            <div
              key={s.slug}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface"
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full border font-mono text-[12px] font-semibold ${rankColor(i)}`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-medium text-[var(--heading)]">
                    {s.name}
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-flame">{s.slug}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
                  <span className="rounded border border-divider bg-surface-2 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-[var(--ink-300,#a1a1aa)]">{s.fn}</span>
                  <span>Used <span className="text-[var(--foreground)]">{s.uses}×</span> this week · Shared by {s.by}</span>
                </div>
              </div>
              <a
                href="https://app.implexa.ai/signup"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-flame/10 px-3 py-1.5 text-[12px] font-medium text-flame transition-colors hover:bg-flame hover:text-[var(--primary-foreground)]"
              >
                <Play className="size-3" /> Run in Claude
              </a>
            </div>
          ))}
        </motion.div>
        <p className="mx-auto mt-6 max-w-[640px] text-center text-[13px] text-muted-foreground">
          Every published skill stays attributed to its creator. Earn your spot
          on the leaderboard.
        </p>
      </div>
    </section>
  );
}

function ThreeSurfaces() {
  const cols = [
    {
      title: "Claude Code (CLI)",
      sub: "Full capture — tool calls + every prompt + every response",
      body: "Install the plugin via the marketplace in your terminal. Hooks fire natively. The deepest integration — for power users.",
      code: "/plugin marketplace add github.com/Implexa-Inc/implexa-claude-plugin\n/plugin install implexa@implexa",
      badge: "RECOMMENDED",
    },
    {
      title: "Cowork (web)",
      sub: "Plugin install via marketplace UI",
      body: "Customize → Personal plugins → Add marketplace → install Implexa. Adds 30+ MCP tools to your Cowork sessions. Also auto-enables Desktop Chat.",
      code: "Customize → Personal plugins\n→ Add marketplace → Implexa",
    },
    {
      title: "Claude Desktop chat",
      sub: "One-URL paste — 30 seconds",
      body: "Click + → Connectors → Add connector. Paste the URL we generate for you. No marketplace, no install dance. Just MCP.",
      code: "https://core.implexa.ai/api/v2/mcp\n  ?api_key=imp_live_…",
    },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
          Works wherever you use Claude.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Same skill recording, three install methods. Pick what fits.
        </motion.p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {cols.map((c, i) => (
          <motion.div
            key={c.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            className="relative flex flex-col rounded-2xl border border-divider bg-surface p-7 transition-colors hover:border-flame/40"
          >
            {c.badge && (
              <span className="absolute right-5 top-5 rounded-full border border-flame/40 bg-flame/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-flame">
                {c.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <div className="mt-1 text-[13px] text-flame">{c.sub}</div>
            <p className="mt-4 text-[14px] text-muted-foreground">{c.body}</p>
            <pre className="mt-5 overflow-x-auto rounded-md border border-divider border-l-[3px] border-l-flame bg-[var(--background)] px-3 py-3 font-mono text-[12px] leading-6 text-muted-foreground">
{c.code}
            </pre>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MCPSection() {
  const tools = [
    "Salesforce", "HubSpot", "Coresignal", "Apollo",
    "Fiber AI", "Exa", "Browserbase", "Gmail",
    "Calendar", "Slack", "GitHub", "Linear",
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
          Works with whatever you've already <span className="text-flame">wired into Claude.</span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Salesforce. HubSpot. Bullhorn. GitHub. Slack. Apollo. Your custom MCP server.
        </motion.p>
      </div>

      {/* radial visual */}
      <motion.div
        {...fadeUp}
        className="relative mx-auto mt-16 grid h-[420px] max-w-[820px] place-items-center"
      >
        <div className="absolute inset-0 radial-firelight opacity-60" />
        {/* center node */}
        <div className="relative z-10 flex size-20 items-center justify-center rounded-full border border-flame/50 bg-surface glow-flame-lg">
          <Flame className="size-8 text-flame" />
        </div>
        {/* orbit nodes */}
        {tools.map((t, i) => {
          const angle = (i / tools.length) * 2 * Math.PI - Math.PI / 2;
          const r = 180;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          return (
            <div
              key={t}
              className="absolute hidden md:flex"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <span className="rounded-full border border-divider bg-surface px-3 py-1.5 text-[12px] text-muted-foreground hover:border-flame/40 hover:text-[var(--heading)] transition-colors">
                {t}
              </span>
            </div>
          );
        })}
        {/* connecting lines via svg */}
        <svg
          className="absolute inset-0 hidden md:block"
          viewBox="-410 -210 820 420"
          preserveAspectRatio="xMidYMid meet"
        >
          {tools.map((_, i) => {
            const angle = (i / tools.length) * 2 * Math.PI - Math.PI / 2;
            const r = 180;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke="url(#flameGrad)"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.15;0.55;0.15"
                  dur="3s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </line>
            );
          })}
          <defs>
            <linearGradient id="flameGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8A3C" />
              <stop offset="100%" stopColor="#FFD93D" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* mobile fallback chip cloud */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 md:hidden">
          {tools.map((t) => (
            <span
              key={t}
              className="rounded-full border border-divider bg-surface px-3 py-1 text-[11px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-[1000px] gap-8 md:grid-cols-3">
        {[
          {
            t: "Captures workflows from any MCP-compatible tool.",
            d: "If your team can run it in Claude, Implexa can capture it as a skill. That's it.",
          },
          {
            t: "You stay in control of integrations.",
            d: "New MCP server in your Claude? Skills using it work immediately. The skill library adapts to your stack, not vice versa.",
          },
          {
            t: "Open by default.",
            d: "Skills are portable across MCP clients — Claude Code, Claude Desktop, Cowork. Your work isn't locked into one surface.",
          },
        ].map((b, i) => (
          <motion.div
            key={b.t}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.05 }}
          >
            <div className="text-sm font-semibold text-[var(--heading)]">
              {b.t}
            </div>
            <p className="mt-2 text-[14px] text-muted-foreground">{b.d}</p>
          </motion.div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[680px] text-center text-[15px] text-muted-foreground">
        If your team can run it in Claude, Implexa can capture it as a skill. <span className="text-[var(--heading)]">That's it.</span>
      </p>
    </section>
  );
}

function FoundingCreator() {
  return (
    <section className="relative bg-surface border-y border-divider">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
      <div className="mx-auto max-w-[1180px] px-6 py-28">
        <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <motion.div
            {...fadeUp}
            className="relative mx-auto flex size-32 items-center justify-center rounded-2xl border border-ember/40 bg-[var(--background)]"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,217,61,0.18), transparent 65%), var(--background)",
              boxShadow: "0 0 60px rgba(255,217,61,0.18)",
            }}
          >
            <Trophy className="size-14 text-ember" />
          </motion.div>
          <div>
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 text-[11px] uppercase tracking-wider text-ember"
            >
              <Crown className="size-3" /> Founding Creator program
            </motion.div>
            <motion.h2
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-5 text-3xl sm:text-4xl font-semibold"
            >
              Publish one skill publicly. <span className="text-ember">Unlock everything.</span>
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-4 max-w-[640px] text-[15px] text-muted-foreground"
            >
              For the first 1,000 people who publish a public skill, we're
              permanently unlocking the Free plan ceiling. No credit card.
            </motion.p>
            <motion.ul
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-6 grid gap-2 text-[14px] text-[var(--foreground)] sm:grid-cols-2"
            >
              {[
                "Unlimited skill captures (no 5/month cap)",
                "🏆 Founding Creator badge on your profile",
                "One free Pro seat for life when Pro launches",
                "First access to upcoming features",
              ].map((it) => (
                <li key={it} className="flex items-start gap-2">
                  <span className="mt-[7px] inline-block size-1.5 rounded-full bg-ember" />
                  <span>{it}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-8"
            >
              <a
                href="https://app.implexa.ai/signup"
                className="inline-flex items-center gap-2 rounded-md bg-flame px-6 py-3 font-medium text-[var(--primary-foreground)] transition-all hover:glow-flame-lg"
              >
                Get started → become a Founding Creator <ArrowRight className="size-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingTease() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      sub: "forever",
      tagline: "For solo Claude users making their workflows reusable.",
      features: [
        "5 skills captured / month",
        "Unlimited use of skills in your library",
        "Fork all 30 base Playbooks (and growing)",
        "Domain-gated team shares",
      ],
      cta: "Get started",
      featured: false,
    },
    {
      name: "Pro",
      price: "$19",
      sub: "/user/mo",
      tagline: "For teams + power users who've outgrown the cap.",
      features: [
        "Unlimited skill captures",
        "Unlimited team-shared skills",
        "Skill ROI dashboard",
        "Priority support",
      ],
      cta: "Join the waitlist",
      featured: true,
      footnote: "Founding Creators get a free Pro seat for life.",
    },
    {
      name: "Enterprise",
      price: "Custom",
      sub: "talk to us",
      tagline: "For orgs with security, compliance, or scale needs.",
      features: [
        "SSO + audit logs",
        "On-prem MCP server (BYO key)",
        "Custom contract terms + SLA",
        "Dedicated success engineer",
      ],
      cta: "Talk to us →",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-6 py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
          Free forever, or upgrade when your team scales.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Capture-first pricing. The 5/month cap on Free is the only constraint —
          using, forking, and sharing are unlimited.
        </motion.p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            className={`relative flex flex-col rounded-2xl border bg-surface p-7 transition-colors ${
              t.featured
                ? "border-flame/60 shadow-[0_0_60px_rgba(255,138,60,0.12)]"
                : "border-divider hover:border-flame/30"
            }`}
          >
            {t.featured && (
              <span className="absolute right-5 top-5 rounded-full bg-flame px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary-foreground)]">
                Most popular
              </span>
            )}
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[var(--heading)]">{t.price}</span>
              <span className="text-sm text-muted-foreground">{t.sub}</span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">{t.tagline}</p>
            <ul className="mt-6 space-y-2.5 text-[14px] text-[var(--foreground)]">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-[6px] inline-block size-1.5 rounded-full bg-flame" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://app.implexa.ai/signup"
              className={`mt-7 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                t.featured
                  ? "bg-flame text-[var(--primary-foreground)] hover:glow-flame"
                  : "border border-divider text-[var(--heading)] hover:bg-surface-2"
              }`}
            >
              {t.cta}
            </a>
            {t.footnote && (
              <p className="mt-3 text-center text-[12px] text-ember">{t.footnote}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      q: "We replaced our 11-page SDR playbook with three Implexa skills. New reps ramp in days, not weeks.",
      n: "Maya Chen",
      r: "VP Sales, mid-market SaaS",
    },
    {
      q: "Our recruiting team's daily standup brief used to take 30 minutes per recruiter. Now it's a /implexa:bullhorn-standup away.",
      n: "Devon Park",
      r: "Head of Talent, staffing agency",
    },
    {
      q: "Implexa is the first AI product where the killer feature is the first feature you use.",
      n: "Jules Ortiz",
      r: "Founder, AI tooling startup",
    },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-28">
      <motion.div
        {...fadeUp}
        className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground"
      >
        Trusted by
      </motion.div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.figure
            key={it.n}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            className="rounded-2xl border border-divider bg-surface p-7"
          >
            <blockquote className="text-[15px] text-[var(--foreground)] leading-relaxed">
              "{it.q}"
            </blockquote>
            <figcaption className="mt-5 text-[13px]">
              <div className="font-medium text-[var(--heading)]">{it.n}</div>
              <div className="text-muted-foreground">{it.r}</div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,138,60,0.18), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-[820px] px-6 py-32 text-center">
        <motion.h2
          {...fadeUp}
          className="text-3xl sm:text-5xl font-semibold tracking-tight"
        >
          Your team's institutional knowledge,{" "}
          <span className="text-flame">finally portable.</span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-5 text-lg text-muted-foreground"
        >
          Start free. No credit card. 5 skills/month — and unlimited everything else.
        </motion.p>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <a
            href="https://app.implexa.ai/signup"
            className="inline-flex items-center gap-2 rounded-md bg-flame px-7 py-3.5 text-base font-medium text-[var(--primary-foreground)] transition-all hover:glow-flame-lg"
          >
            Get started <ArrowRight className="size-4" />
          </a>
          <div className="text-[13px] text-muted-foreground">
            or run{" "}
            <span className="font-mono text-flame">/implexa:record-skill</span>{" "}
            inside Claude
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-divider bg-[var(--background)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-[260px] text-sm text-muted-foreground">
            Skill recording for any AI session.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Product
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#pricing" className="hover:text-[var(--heading)]">Pricing</a></li>
            <li><a href="#docs" className="hover:text-[var(--heading)]">Docs</a></li>
            <li><a href="#changelog" className="hover:text-[var(--heading)]">Changelog</a></li>
            <li><a href="#status" className="hover:text-[var(--heading)]">Status</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Company
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#about" className="hover:text-[var(--heading)]">About</a></li>
            <li><a href="#privacy" className="hover:text-[var(--heading)]">Privacy</a></li>
            <li><a href="#terms" className="hover:text-[var(--heading)]">Terms</a></li>
            <li><a href="#contact" className="hover:text-[var(--heading)]">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Community
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#trending" className="hover:text-[var(--heading)]"><span className="text-flame">🔥</span> Trending Globally</a></li>
            <li><a href="#founding" className="hover:text-[var(--heading)]"><Medal className="inline size-3 text-ember" /> Founding Creators</a></li>
            <li><a href="#discord" className="hover:text-[var(--heading)]">Discord</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-divider py-6 text-center text-xs text-muted-foreground">
        Made with <span className="inline-block animate-pulse">❤️</span> in a small lab in San Francisco 🌉
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      <CircuitReveal />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <ThreeAct />
        <SkillCardCenterpiece />
        <TrendingGlobally />
        <ThreeSurfaces />
        <MCPSection />
        <FoundingCreator />
        <PricingTease />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
