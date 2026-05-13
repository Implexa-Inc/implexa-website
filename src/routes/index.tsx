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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircuitReveal } from "@/components/CircuitReveal";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Implexa — Adopt Claude faster, together." },
      {
        name: "description",
        content:
          "Implexa turns the workflows your team already runs in Claude into reusable, shareable, measurable skills. Capture once. Replay forever. Improve over time.",
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
      <span className="flex items-baseline text-[18px] font-semibold tracking-tight text-[var(--heading)]">
        {/* lowercase 'i' — emerald node replaces the tittle */}
        <span className="relative inline-block">
          <span className="font-semibold">ı</span>
          <span
            aria-hidden
            className="absolute -top-[5px] left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-emerald-400 ring-1 ring-[var(--background)] shadow-[0_0_8px_rgba(16,185,129,0.75)] transition-transform duration-300 group-hover:scale-125"
          />
        </span>
        mple
        {/* 'x' — flame node at the crossing */}
        <span className="relative inline-block">
          <span>x</span>
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame ring-1 ring-[var(--background)] shadow-[0_0_8px_rgba(255,138,60,0.8)] transition-transform duration-300 group-hover:scale-125"
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
            href="#pricing"
            className="hidden sm:inline-block px-3 py-2 text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#docs"
            className="hidden sm:inline-block px-3 py-2 text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            Docs
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

function CopyInstall() {
  const cmd = "claude plugin install implexa";
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(cmd);
        toast("Copied!", {
          style: {
            background: "var(--surface-2)",
            color: "var(--ember)",
            border: "1px solid var(--divider)",
          },
        });
      }}
      className="group inline-flex items-center gap-3 rounded-md border border-divider bg-surface px-4 py-2.5 font-mono text-[13px] text-muted-foreground transition-colors hover:border-flame/50 hover:text-[var(--heading)]"
    >
      <span className="text-flame">$</span>
      <span>{cmd}</span>
      <Copy className="size-3.5 opacity-50 group-hover:opacity-100" />
    </button>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-40 pb-28 sm:pt-48 sm:pb-36"
    >
      <div className="absolute inset-0 -z-10 radial-firelight" />
      <div className="mx-auto max-w-[820px] px-6 text-center">
        <motion.div {...fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="text-flame">⚡</span> for teams building with Claude
          </span>
        </motion.div>
        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-8 text-[40px] sm:text-[64px] lg:text-[72px] font-bold tracking-tight"
        >
          Adopt Claude{" "}
          <span className="underline-flame">faster</span>, together.
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mx-auto mt-6 max-w-[640px] text-lg sm:text-2xl text-muted-foreground"
        >
          Implexa turns the workflows your team already runs in Claude into
          reusable, shareable, measurable skills. Capture once. Replay forever.
          Improve over time.
        </motion.p>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="https://app.implexa.ai/signup"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-flame px-6 py-3 font-medium text-[var(--primary-foreground)] transition-all hover:glow-flame-lg"
          >
            Get started — free <ArrowRight className="size-4" />
          </a>
          <button
            onClick={() => toast("Demo player coming soon")}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-divider bg-transparent px-6 py-3 font-medium text-[var(--heading)] transition-colors hover:bg-surface"
          >
            <Play className="size-4 text-flame" /> Watch a 90-second demo
          </button>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <CopyInstall />
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

function ThreeAct() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-28">
      <div className="mx-auto max-w-[720px] text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
          Record. Share. Improve.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Three actions that compound into your team's collective intelligence.
        </motion.p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <StoryCard
          delay={0}
          icon={
            <span className="relative inline-flex">
              <Circle className="size-5 fill-flame text-flame" />
              <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-flame/40" />
            </span>
          }
          title="Demonstrate once."
          body="Show Claude how you research a target account, write a status update, prep for a call, or close a ticket. Implexa captures every step — your tools, your decisions, your reasoning — and saves it as a structured skill anyone on your team can replay."
          cmd="/implexa:record-skill"
        />
        <StoryCard
          delay={0.08}
          icon={<Share2 className="size-5 text-ember" />}
          title="One click to your team. One link to the world."
          body="Domain-gated share links keep skills internal — only people with your work email can install. Or share publicly — PII removed, workflow + sample data become a resource the whole community can fork."
          cmd="/implexa:share-this"
        />
        <StoryCard
          delay={0.16}
          icon={<TrendingUp className="size-5 text-flame" />}
          title="Tied to real outcomes."
          body="When a saved skill closes a deal, books a meeting, ships a PR, or saves an hour — Implexa attributes the outcome back to the skill. You see which workflows are actually working, and the platform learns which patterns to suggest next."
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

function EnterpriseBand() {
  const integrations = [
    "Salesforce", "HubSpot", "Slack", "Google Calendar",
    "Notion", "Bullhorn", "Microsoft 365", "Anthropic",
  ];
  return (
    <section className="relative bg-surface border-y border-divider">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame/40 to-transparent" />
      <div className="mx-auto max-w-[1180px] px-6 py-28">
        <motion.h2
          {...fadeUp}
          className="mx-auto max-w-[820px] text-center text-3xl sm:text-4xl font-semibold"
        >
          Built for teams adopting Claude org-wide.
        </motion.h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-divider bg-[var(--background)] p-8"
          >
            <h3 className="text-lg font-semibold">
              Maximize Claude across functions
            </h3>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Every team builds the same workflows in private. Sales reps
              reinvent prospect research. CS reinvents renewal prep. Recruiters
              reinvent candidate matching. Implexa makes those workflows
              portable so your whole org gets to the best version, faster.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="rounded-2xl border border-divider bg-[var(--background)] p-8"
          >
            <h3 className="text-lg font-semibold">
              Attribution that proves the ROI
            </h3>
            <p className="mt-3 text-[15px] text-muted-foreground">
              We connect to your CRM (Salesforce, HubSpot), your ATS (Bullhorn,
              Workday), your calendar, and your data warehouse. When a skill
              drives a real outcome, attribution is automatic. Your leadership
              sees Claude's actual revenue contribution — not vibes.
            </p>
          </motion.div>
        </div>
        <motion.div
          {...fadeUp}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {integrations.map((name) => (
            <span
              key={name}
              className="text-sm text-muted-foreground/70 hover:text-[var(--heading)] transition-colors cursor-default"
            >
              {name}
            </span>
          ))}
        </motion.div>
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
      <div className="mx-auto max-w-[720px] text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold">
          Connects to your entire AI tool universe.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Implexa is built on MCP — the open standard for AI tool integration.
          Every tool your team uses inside Claude becomes part of every
          captured skill, automatically.
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
            t: "Bring your own tools.",
            d: "Any MCP-compatible tool becomes part of your captured skills. No re-integration needed.",
          },
          {
            t: "We're adding more every week.",
            d: "Sales, recruiting, CS, engineering, RevOps, finance — Implexa's tool catalog keeps expanding so your team gets richer skills automatically.",
          },
          {
            t: "Open by default.",
            d: "Skills are portable across MCP clients — Claude Code, Claude Desktop, Cursor, claude.ai. Your work isn't locked into one surface.",
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
          Free plan ships with 500 credits/month. No credit card.
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
            or{" "}
            <span className="font-mono text-flame">
              claude plugin install implexa
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-divider bg-[var(--background)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-3">
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
      </div>
      <div className="border-t border-divider py-6 text-center text-xs text-muted-foreground">
        Made with love at a small lab in San Francisco.{" "}
        <span className="inline-block animate-pulse">🔥</span>
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
        <EnterpriseBand />
        <MCPSection />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
