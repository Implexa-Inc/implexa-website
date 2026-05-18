import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircuitReveal } from "@/components/CircuitReveal";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Implexa — Record any Claude workflow once. Run it forever." },
      {
        name: "description",
        content:
          "One demo, six-component skill. Portable across Claude Code (CLI + Desktop), Cowork, and Chat. Skill Graph for AI agents. Free forever, unlimited runs.",
      },
      {
        property: "og:title",
        content: "Implexa — Record any Claude workflow once. Run it forever.",
      },
      {
        property: "og:description",
        content: "curl -fsSL https://core.implexa.ai/install.sh | bash",
      },
    ],
  }),
});

const INSTALL_CMD = "curl -fsSL https://core.implexa.ai/install.sh | bash";

// ─── Copy button with visual confirmation ───────────────────────────────
function CopyButton({
  text,
  className = "",
  primary = false,
}: {
  text: string;
  className?: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const base = primary
    ? "bg-brand-500 hover:bg-brand-600 text-white"
    : "bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 border border-ink-700";
  const ok = "bg-success-400/20 text-success-700";
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className={`shrink-0 text-[10px] uppercase tracking-wider font-medium rounded px-3 py-1.5 transition-colors ${
        copied ? ok : base
      } ${className}`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

// ─── Types for /api/v2/skills ───────────────────────────────────────────
type TrendingSkill = {
  slug: string;
  name?: string;
  title?: string;
  description?: string;
  tags?: string[];
  author?: string;
  author_name?: string;
  by?: string;
  installs?: number;
  install_count?: number;
  trending_score?: number;
  rank_delta?: number;
};

function Index() {
  const [modal, setModal] = useState<{ slug: string; name: string } | null>(
    null,
  );

  return (
    <div className="text-ink-200 antialiased min-h-screen relative isolate">
      <CircuitReveal />
      <div>
      {/* NAV */}
      <nav className="border-b border-ink-800 sticky top-0 z-40 backdrop-blur-md bg-ink-950/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Implexa" className="h-7 w-auto transition-opacity duration-300 group-hover:opacity-90" />
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm text-ink-300">
            <a href="https://app.implexa.ai/skills" className="hover:text-ink-50">Skills</a>
            <a href="#pricing" className="hover:text-ink-50">Pricing</a>
            <div className="relative group">
              <button className="hover:text-ink-50 flex items-center gap-1">
                Resources
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4.5L6 7.5L9 4.5" /></svg>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-ink-900 border border-ink-800 rounded-lg shadow-xl py-2 min-w-[260px]">
                  <a href="/claude-skills" className="block px-4 py-2 hover:bg-ink-800 hover:text-ink-50">
                    <div className="text-sm text-ink-100">What Are Claude Skills?</div>
                    <div className="text-xs text-ink-400 mt-0.5">The pillar guide</div>
                  </a>
                  <a href="/blog/how-to-create-a-claude-skill" className="block px-4 py-2 hover:bg-ink-800 hover:text-ink-50">
                    <div className="text-sm text-ink-100">How to Create a Claude Skill</div>
                    <div className="text-xs text-ink-400 mt-0.5">Step-by-step tutorial</div>
                  </a>
                  <a href="/blog/what-are-claude-skills" className="block px-4 py-2 hover:bg-ink-800 hover:text-ink-50">
                    <div className="text-sm text-ink-100">Claude Skills Explained</div>
                    <div className="text-xs text-ink-400 mt-0.5">5-minute explainer</div>
                  </a>
                </div>
              </div>
            </div>
            <a href="https://github.com/Implexa-Inc/implexa-claude-plugin" className="hover:text-ink-50">GitHub</a>
            <a href="https://app.implexa.ai/login" className="hover:text-ink-50">Sign in</a>
            <a
              href="https://app.implexa.ai/signup"
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-glow pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold rounded-full px-3 py-1 bg-brand-500/15 text-brand-500 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 pulse-dot"></span>
            Skill Graph for Claude
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink-50 leading-[1.05] mb-6">
            Record any Claude workflow once.<br />
            <span className="text-brand-500">Run it forever.</span>
          </h1>

          <p className="text-xl text-ink-300 leading-relaxed max-w-2xl mx-auto mb-10">
            Implexa lets you save any Claude workflow once and re-run it like a slash command forever. Your team's best AI work becomes everyone's reusable command — no more rebuilding prompts, no more retraining new hires.
          </p>

          <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 shadow-glow max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <span className="text-[10px] uppercase tracking-wider font-bold rounded px-2 py-0.5 bg-brand-500/15 text-brand-500">★ Recommended</span>
              <span className="text-xs text-ink-400">One command · ~30s · macOS / Linux / WSL</span>
            </div>

            <div className="bg-ink-950 border border-ink-700 rounded-md px-4 py-3 flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] text-ink-400 px-2 py-1 rounded bg-ink-800 border border-ink-700 font-mono shrink-0">curl</span>
              <code className="flex-1 text-sm text-ink-100 font-mono whitespace-nowrap overflow-x-auto hide-scrollbar text-left">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} />
            </div>

            <p className="text-sm text-ink-300 mt-4 leading-relaxed">
              Browser opens for sign-in or sign-up. Approve, and your terminal finishes the rest. Installs API key, hooks, plugin, MCP wiring — all in one paste.
            </p>
          </div>

          <p className="text-xs text-ink-400 mt-6">
            Free forever. No credit card. <a href="https://github.com/Implexa-Inc/implexa-claude-plugin" className="text-brand-500 hover:underline">MIT-licensed plugin</a> · hosted service.
          </p>

          <div className="mt-10 max-w-3xl mx-auto">
            <video
              autoPlay
              loop
              muted
              playsInline
              controls
              controlsList="nodownload"
              preload="metadata"
              poster="/videos/implexa-demo-poster.jpg"
              className="block w-full h-auto aspect-video rounded-lg border border-ink-700 shadow-2xl bg-ink-950"
            >
              <source src="/videos/implexa-demo.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-ink-400">
            <span><strong className="text-ink-200">42</strong> public skills shared</span>
            <span className="text-ink-700">·</span>
            <span><strong className="text-ink-200">1,200+</strong> skill runs</span>
            <span className="text-ink-700">·</span>
            <span><strong className="text-ink-200">8</strong> Founding Creators</span>
            <span className="text-ink-700">·</span>
            <span><strong className="text-ink-200">Live</strong> on macOS, Linux, WSL</span>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20 px-6 border-t border-ink-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">What you get</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-3">Record. Run. Share.</h2>
            <p className="text-lg text-ink-300 max-w-2xl mx-auto">One demo. Forever portable. Same library across every Claude surface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "① Record",
                cmd: "/implexa:record-skill",
                title: "Demo any workflow once.",
                body: "Implexa watches your tool calls + conversation, then runs a structured interview to lock the intent. Output: a 6-component skill — replayable, measurable, portable.",
              },
              {
                label: "② Run",
                cmd: '/implexa:run "the X one"',
                title: "Re-execute anywhere.",
                body: "Fuzzy-match your library by description. Claude finds the right skill, applies it with your current context. Outcomes attribute back automatically.",
              },
              {
                label: "③ Share",
                cmd: "/implexa:share-this",
                title: "One link, anyone can install.",
                bodyNode: (
                  <>
                    Send a share URL to your team or the world. Recipients click → install link → skill is in their library. Public shares unlock <strong className="text-brand-500">Founding Creator</strong> perks.
                  </>
                ),
              },
            ].map((c) => (
              <div key={c.label} className="bg-ink-900 border border-ink-700 rounded-xl p-6 hover:border-brand-500/40 transition-colors">
                <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-3">{c.label}</div>
                <code className="block bg-ink-950 border border-ink-700 rounded px-3 py-2 text-sm text-ink-100 font-mono mb-4">{c.cmd}</code>
                <h3 className="text-lg font-semibold text-ink-50 mb-2">{c.title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{c.bodyNode ?? c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 border-t border-ink-800 bg-ink-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">How it works</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50">From install to first skill in 5 minutes.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: 1,
                title: "Connect Claude",
                body: "Paste one curl in your terminal. Browser opens, you approve, terminal finishes the rest in ~30 seconds. No API key juggling.",
                code: <><span className="text-ink-500">$ </span>curl ...install.sh | bash</>,
              },
              {
                n: 2,
                title: "Record a workflow",
                body: "Tell Claude to start recording. Do your work as usual. Implexa captures every tool call + prompt + response, then runs a quick interview to lock the intent.",
                code: <><span className="text-brand-500">/implexa:</span>record-skill</>,
              },
              {
                n: 3,
                title: "Re-run anywhere",
                body: "Skill is now in your library, ready to invoke by description. Use it yourself or share it with your team. Outcomes auto-attribute.",
                code: <><span className="text-brand-500">/implexa:</span>run "the prospecting one"</>,
              },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center text-sm font-bold text-brand-500">{s.n}</div>
                <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 pl-8 h-full">
                  <h3 className="text-lg font-semibold text-ink-50 mb-2">{s.title}</h3>
                  <p className="text-sm text-ink-300 leading-relaxed mb-4">{s.body}</p>
                  <div className="bg-ink-950 border border-ink-700 rounded px-3 py-2 text-xs font-mono text-ink-100 overflow-x-auto hide-scrollbar">
                    {s.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING SKILLS */}
      <TrendingSkillsSection onRun={(slug, name) => setModal({ slug, name })} />

      {/* INSTALL OPTIONS */}
      <section className="py-20 px-6 border-t border-ink-800 bg-ink-900/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">Install</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-3">
              Install Implexa in 30 seconds.
            </h2>
            <p className="text-lg text-ink-300 max-w-2xl mx-auto">
              Same command we hand you after signup. Works on macOS, Linux, and WSL.
            </p>
          </div>

          <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold rounded px-1.5 py-0.5 bg-brand-500/15 text-brand-500">★ Recommended</span>
              <span className="text-xs text-ink-400">Claude Code (CLI) — one command, ~30s</span>
            </div>

            <div className="bg-ink-950 border border-ink-700 rounded-md px-4 py-3 mb-3 flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] text-ink-400 px-2 py-1 rounded bg-ink-800 border border-ink-700 font-mono shrink-0">curl</span>
              <code className="flex-1 text-sm text-ink-100 font-mono whitespace-nowrap overflow-x-auto hide-scrollbar">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} />
            </div>

            <p className="text-sm text-ink-300 leading-relaxed">
              The script auto-installs everything: <strong className="text-ink-100">API key, hooks, the Implexa plugin, MCP wiring.</strong> Your browser opens to approve the install; once you click Approve, the terminal finishes the rest.
            </p>
            <p className="text-xs text-ink-400 mt-2">Works on macOS, Linux, and Windows (WSL).</p>
          </div>

          <div className="pl-1 space-y-2 mb-8">
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-medium">After install</p>
            {[
              { label: "Launch Claude Code", cmd: "claude" },
              { label: "Verify connection", cmd: "/implexa:setup" },
              { label: "Record your first skill", cmd: "/implexa:record-skill" },
            ].map((r) => (
              <div key={r.cmd} className="flex items-center gap-3 text-sm">
                <span className="text-ink-300 w-44 shrink-0">{r.label}</span>
                <code className="font-mono text-xs bg-ink-900 border border-ink-700 rounded px-2 py-1 text-ink-100 flex-1 truncate">{r.cmd}</code>
                <CopyButton text={r.cmd} className="px-2 py-1" />
              </div>
            ))}
          </div>

          <details className="bg-ink-900 border border-ink-700 rounded-xl group">
            <summary className="cursor-pointer hover:bg-ink-800/40 transition-colors px-5 py-4 select-none flex items-center gap-2 text-sm text-ink-100">
              <span className="text-ink-400 group-open:rotate-90 transition-transform inline-block">▸</span>
              <span>Don't use Claude Code? Install for <strong>Cowork</strong>, <strong>Chat</strong>, or via the visual <strong>Desktop UI</strong></span>
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-ink-700/60 space-y-4 text-sm">
              <div>
                <h4 className="text-ink-100 font-semibold mb-1">Cowork (browser)</h4>
                <p className="text-ink-300 leading-relaxed">Plugin install via <strong>Customize → Personal plugins → + Create plugin → Add marketplace</strong>. Paste:</p>
                <code className="block bg-ink-950 border border-ink-700 rounded px-3 py-2 text-xs font-mono text-ink-100 mt-2 overflow-x-auto hide-scrollbar">https://github.com/Implexa-Inc/implexa-claude-plugin</code>
              </div>
              <div>
                <h4 className="text-ink-100 font-semibold mb-1">Claude Code Desktop (visual)</h4>
                <p className="text-ink-300 leading-relaxed">Same flow as Cowork. Customize → Personal plugins → Add marketplace with the URL above. Same plugin, just installed visually.</p>
              </div>
              <div>
                <h4 className="text-ink-100 font-semibold mb-1">Claude Chat (Desktop)</h4>
                <p className="text-ink-300 leading-relaxed">Custom Connector URL — paste one URL into <strong>Customize → Connectors → + → Add custom connector</strong>:</p>
                <code className="block bg-ink-950 border border-ink-700 rounded px-3 py-2 text-xs font-mono text-ink-100 mt-2 overflow-x-auto hide-scrollbar">https://core.implexa.ai/api/v2/mcp?api_key=YOUR_KEY</code>
                <p className="text-xs text-ink-400 mt-2">Sign up to generate your API key — <a href="https://app.implexa.ai/signup" className="text-brand-500 hover:underline">create a free account →</a></p>
              </div>
              <p className="text-xs text-ink-400 border-t border-ink-800 pt-3">
                For full step-by-step instructions on any surface, sign in and visit <a href="https://app.implexa.ai/install" className="text-brand-500 hover:underline">app.implexa.ai/install</a>.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* SKILL GRAPH FLYWHEEL */}
      <section className="py-20 px-6 border-t border-ink-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">The Skill Graph flywheel</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-3">
              One power user's workflow becomes the org's skill.
            </h2>
            <p className="text-lg text-ink-300 max-w-2xl mx-auto">
              Every team has a few power users with the right integrations wired up. Implexa turns their expertise into a portable, runnable thing the rest of the org can invoke.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">① Power users connect</div>
              <h3 className="text-lg font-semibold text-ink-50 mb-2">HubSpot, Salesforce, Linear, GitHub, Coresignal, Apollo, Stripe, Slack, Fiber AI…</h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                Whoever in your org first wires up an MCP integration into Claude is the seed. Their stack becomes the team's stack — without anyone else having to learn each tool from scratch.
              </p>
            </div>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">② They record a skill</div>
              <h3 className="text-lg font-semibold text-ink-50 mb-2">Demo a workflow that uses those tools</h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                <code className="text-xs bg-ink-800 px-1.5 py-0.5 rounded">/implexa:record-skill</code> captures every tool call. The structured interview locks the intent. Result: a portable skill that knows which tools it needs.
              </p>
            </div>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">③ Implexa learns the tool chain</div>
              <h3 className="text-lg font-semibold text-ink-50 mb-2">Required tools are baked into the skill</h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                The skill manifest says "needs HubSpot, Apollo, Slack" — explicitly. So when someone runs it, we know upfront whether their session has the right wiring.
              </p>
            </div>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">④ A teammate runs it</div>
              <h3 className="text-lg font-semibold text-ink-50 mb-2">
                <code className="text-sm bg-ink-800 px-1.5 py-0.5 rounded font-mono">/implexa:run "the prospecting one"</code>
              </h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                Fuzzy match against the library. Claude picks up the skill, applies it with the teammate's current context (their account, their CRM, their pipeline).
              </p>
            </div>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 md:col-span-2 border-brand-500/40">
              <div className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">⑤ Implexa surfaces missing integrations</div>
              <h3 className="text-lg font-semibold text-ink-50 mb-2">"This skill needs the HubSpot MCP. Install it via Customize → Personal plugins → HubSpot."</h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                If the teammate is missing a tool the skill needs, the skill response includes the install hint. They click through, install the integration, run the skill — done.
              </p>
            </div>
          </div>

          <div className="text-center py-8 px-6 bg-gradient-to-r from-brand-500/10 via-ink-900 to-brand-500/10 border border-brand-500/30 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">⑥ Outcome</p>
            <p className="text-xl font-semibold text-ink-50 mb-2">Everyone in the org now has the power user's stack.</p>
            <p className="text-sm text-ink-300 leading-relaxed max-w-2xl mx-auto">
              Without having to discover, evaluate, and learn each integration. Power users get rewarded with <strong className="text-brand-500">Founding Creator</strong> status — unlimited captures forever + a free Pro seat for life.
            </p>
          </div>
        </div>
      </section>

      {/* VS SKILL-CREATOR */}
      <section className="py-20 px-6 border-t border-ink-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">Why not just write the skill?</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-3">
              Captured, not authored.
            </h2>
            <p className="text-lg text-ink-300 max-w-2xl mx-auto leading-relaxed">
              A great workflow isn't a sequence of tool calls — it's a sequence of <strong className="text-ink-100">judgment calls</strong>. The why behind each filter. The edge case you handle silently. The signal that tells you it worked.
              <br /><br />
              Skill-creator and other prompt editors capture the visible half (what you describe). Implexa captures both halves — the demonstration captures the tool sequence, the post-demo interview maps the <strong className="text-brand-500">decision trace</strong> behind it.
            </p>
          </div>

          <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden mb-10">
            <div className="grid grid-cols-3 gap-0 text-xs uppercase tracking-wider font-bold text-ink-400 border-b border-ink-700">
              <div className="p-4"></div>
              <div className="p-4 text-center border-l border-ink-700">Prompt-editor approach</div>
              <div className="p-4 text-center border-l border-ink-700 text-brand-500">Implexa Skill Graph</div>
            </div>
            <div className="divide-y divide-ink-800">
              {[
                ["Origin of the skill", "You describe; Claude imagines", "You demonstrate; we capture the real tool calls"],
                ["Decision trace", "Not captured — only the prompt text", "Mapped via post-demo interview: why this filter, what's the edge case, what's the signal"],
                ["Format", "Free-form markdown prompt", "6-component contract: intent + inputs + procedure + decision points + output contract + outcome signal"],
                ["Validation", "Hope the imagined tool chain works", "Already ran once during capture — proven"],
                ["Iteration", "Hand-edit markdown when you want to add a step", "Re-record into existing skill; new demo merges into existing decision trace"],
                ["Distribution", "Copy/paste between machines", "One share link → recipient clicks → in their library"],
                ["Tool awareness", "None — skill is just text", "Required-tool manifest auto-captured; install hints surface when a teammate forks"],
                ["Measurement", "None — skills can't be A/B tested", "Outcomes attribute back to skills (deal closed → which skill drove it) within 30 days"],
                ["Built for", "Solo power users", "Teams where one person's expertise should compound"],
              ].map(([label, left, right]) => (
                <div key={label} className="grid grid-cols-3 gap-0 items-center">
                  <div className="p-4 text-sm font-semibold text-ink-100">{label}</div>
                  <div className="p-4 text-sm text-ink-300 border-l border-ink-700">{left}</div>
                  <div className="p-4 text-sm text-ink-200 border-l border-ink-700">{right}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-500/10 via-ink-900 to-brand-500/5 border border-brand-500/40 rounded-xl p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-3">The decision trace</p>
            <p className="text-lg text-ink-200 leading-relaxed mb-3">
              When a senior teammate handles an account differently than a junior, the difference isn't usually <em>which</em> tools they call — it's <em>when</em> they decide to pivot, <em>what</em> signals tell them to stop, <em>how</em> they frame the output.
            </p>
            <p className="text-lg text-ink-200 leading-relaxed">
              That's the decision trace. It's the part of expertise that lives in someone's head, never gets written down, and walks out the door when they leave. Implexa is the first AI skill system designed to capture it — through demonstration, not description. The 6-component contract is just the file format. The real product is the <strong className="text-brand-500">decision trace becoming portable</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section id="pricing" className="py-20 px-6 border-t border-ink-800 bg-ink-900/30 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight text-ink-50">Free forever for individuals.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <h3 className="text-xs uppercase tracking-wider text-ink-400 font-bold mb-3">Free</h3>
              <p className="text-3xl font-bold text-ink-50 mb-1">$0</p>
              <p className="text-xs text-ink-400 mb-6">forever</p>
              <ul className="text-sm text-ink-300 space-y-2 mb-6">
                <li>✓ 5 skill captures / month</li>
                <li>✓ Unlimited skill runs</li>
                <li>✓ Public sharing</li>
                <li>✓ Solo workspace</li>
              </ul>
              <a href="https://app.implexa.ai/signup" className="block text-center w-full py-2 border border-ink-700 hover:border-brand-500 hover:text-brand-500 text-ink-200 rounded-md transition-colors text-sm font-medium">Start free</a>
            </div>

            <div className="bg-gradient-to-b from-brand-500/10 to-ink-900 border-2 border-brand-500 rounded-xl p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] uppercase tracking-wider font-bold rounded px-2 py-1">Founding Creator</span>
              <h3 className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-3 mt-2">Free perk</h3>
              <p className="text-3xl font-bold text-ink-50 mb-1">$0</p>
              <p className="text-xs text-brand-500 mb-6">unlock with 1 public share</p>
              <ul className="text-sm text-ink-300 space-y-2 mb-6">
                <li>✓ Unlimited skill captures</li>
                <li>✓ Free Pro seat for life</li>
                <li>✓ Trending Globally placement</li>
                <li>✓ Founder badge on your profile</li>
              </ul>
              <a href="https://app.implexa.ai/signup" className="block text-center w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-colors text-sm font-medium">Become a Creator</a>
            </div>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
              <h3 className="text-xs uppercase tracking-wider text-ink-400 font-bold mb-3">Pro</h3>
              <p className="text-3xl font-bold text-ink-50 mb-1">$19<span className="text-base font-normal text-ink-400">/mo</span></p>
              <p className="text-xs text-ink-400 mb-6">or $190 / year</p>
              <ul className="text-sm text-ink-300 space-y-2 mb-6">
                <li>✓ Unlimited skill captures</li>
                <li>✓ Team library sharing</li>
                <li>✓ Outcome attribution + audit log</li>
                <li>✓ SSO (Google / Microsoft)</li>
              </ul>
              <a href="/pricing" className="block text-center w-full py-2 border border-ink-700 hover:border-brand-500 hover:text-brand-500 text-ink-200 rounded-md transition-colors text-sm font-medium">See full plans</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 border-t border-ink-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-4">
            Start with one curl.
          </h2>
          <p className="text-lg text-ink-300 mb-8">
            ~30 seconds. Free forever. One paste and you're recording your first skill.
          </p>

          <div className="bg-ink-900 border border-ink-700 rounded-xl p-4 max-w-lg mx-auto">
            <div className="bg-ink-950 border border-ink-700 rounded-md px-4 py-3 flex items-center gap-3">
              <code className="flex-1 text-sm text-ink-100 font-mono whitespace-nowrap overflow-x-auto hide-scrollbar text-left">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} primary />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold tracking-tight text-ink-50 mb-3">implex<span className="text-brand-500">a</span></div>
              <p className="text-sm text-ink-400 leading-relaxed">Skill Graph for AI agents. Record once, run forever.</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-400 font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-ink-300">
                <li><a href="https://app.implexa.ai/skills" className="hover:text-ink-50">Public skills</a></li>
                <li><a href="#pricing" className="hover:text-ink-50">Pricing</a></li>
                <li><a href="https://app.implexa.ai/install" className="hover:text-ink-50">Install</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-400 font-bold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-ink-300">
                <li><a href="/claude-skills" className="hover:text-ink-50">What Are Claude Skills?</a></li>
                <li><a href="/blog/how-to-create-a-claude-skill" className="hover:text-ink-50">How to Create a Claude Skill</a></li>
                <li><a href="/blog/what-are-claude-skills" className="hover:text-ink-50">Claude Skills Explained</a></li>
                <li><a href="https://github.com/Implexa-Inc/implexa-claude-plugin" className="hover:text-ink-50">GitHub</a></li>
                <li><a href="https://github.com/Implexa-Inc/implexa-claude-plugin#readme" target="_blank" rel="noopener noreferrer" className="hover:text-ink-50">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-400 font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-ink-300">
                <li><a href="/contact" className="hover:text-ink-50">Contact</a></li>
                <li><a href="/privacy" className="hover:text-ink-50">Privacy</a></li>
                <li><a href="/terms" className="hover:text-ink-50">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-ink-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <code className="text-xs font-mono text-ink-500">{INSTALL_CMD}</code>
            <p className="text-xs text-ink-500">© 2026 Implexa Inc. MIT-licensed plugin · hosted service.</p>
          </div>
        </div>
      </footer>

      <RunModal
        open={modal !== null}
        slug={modal?.slug ?? ""}
        name={modal?.name ?? ""}
        onClose={() => setModal(null)}
      />
      </div>
    </div>
  );
}

// ─── Trending skills section (live feed) ────────────────────────────────
function TrendingSkillsSection({
  onRun,
}: {
  onRun: (slug: string, name: string) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending-skills"],
    queryFn: async (): Promise<TrendingSkill[]> => {
      const res = await fetch(
        "https://core.implexa.ai/api/v2/skills?scope=universal&sort=trending&limit=6",
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      // Tolerate a few common envelope shapes
      if (Array.isArray(body)) return body;
      if (Array.isArray(body?.skills)) return body.skills;
      if (Array.isArray(body?.data)) return body.data;
      if (Array.isArray(body?.results)) return body.results;
      return [];
    },
    staleTime: 60_000,
  });

  return (
    <section className="py-20 px-6 border-t border-ink-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-2">🔥 Trending globally</p>
          <h2 className="text-4xl font-bold tracking-tight text-ink-50 mb-3">Skills your peers are publishing right now.</h2>
          <p className="text-lg text-ink-300 max-w-2xl mx-auto">
            Real workflows from real users. One click to run any of these in your own Claude session.
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-ink-900 border border-ink-700 rounded-xl p-5 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center text-sm text-ink-400">
            Couldn't load trending skills right now. <a href="https://app.implexa.ai/skills" className="text-brand-500 hover:underline">Browse on app.implexa.ai →</a>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((s) => {
              const name = s.name ?? s.title ?? s.slug;
              const author = s.author_name ?? s.author ?? s.by ?? "Implexa community";
              const installs = s.install_count ?? s.installs ?? 0;
              const delta = s.rank_delta ?? s.trending_score;
              return (
                <article key={s.slug} className="bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col hover:border-brand-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-ink-50">{name}</h3>
                    {typeof delta === "number" && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold rounded px-1.5 py-0.5 bg-brand-500/15 text-brand-500">
                        ↑ {Math.round(delta)}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-ink-300 leading-relaxed mb-3 flex-1">{s.description}</p>
                  )}
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {s.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[10px] uppercase font-mono text-ink-500 bg-ink-800 rounded px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-ink-400 mb-3 pt-3 border-t border-ink-800">
                    <span>by <strong className="text-ink-200">{author}</strong></span>
                    <span>{installs} installs</span>
                  </div>
                  <button
                    onClick={() => onRun(s.slug, name)}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-md transition-colors text-sm"
                  >
                    ▶ Run in Claude
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="text-center text-sm text-ink-400">No trending skills yet — be the first to publish one.</div>
        )}

        <div className="text-center mt-10">
          <a href="https://app.implexa.ai/skills" className="inline-flex items-center gap-2 text-sm text-brand-500 hover:underline">
            Browse all public skills →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Run-in-Claude modal (React state) ──────────────────────────────────
function RunModal({
  open,
  slug,
  name,
  onClose,
}: {
  open: boolean;
  slug: string;
  name: string;
  onClose: () => void;
}) {
  const runCmd = `/implexa:run ${slug}`;

  // Body scroll lock, matching the original DOM script's behavior
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-ink-900 border-ink-700 max-w-lg p-6 text-ink-200">
        <DialogHeader>
          <p className="text-xs uppercase tracking-wider text-brand-500 font-bold mb-1 text-left">Run in Claude</p>
          <DialogTitle className="text-xl font-bold text-ink-50 text-left">{name || "Skill"}</DialogTitle>
        </DialogHeader>

        <ol className="space-y-5 mt-2">
          <li>
            <p className="text-sm text-ink-300 mb-2"><strong className="text-ink-100">1.</strong> Install Implexa (skip if already installed):</p>
            <div className="bg-ink-950 border border-ink-700 rounded-md px-3 py-2 flex items-center gap-2">
              <code className="flex-1 text-xs text-ink-100 font-mono whitespace-nowrap overflow-x-auto hide-scrollbar">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} className="px-2 py-1" />
            </div>
          </li>
          <li>
            <p className="text-sm text-ink-300 mb-2"><strong className="text-ink-100">2.</strong> Launch Claude Code and run:</p>
            <div className="bg-ink-950 border border-ink-700 rounded-md px-3 py-2 flex items-center gap-2">
              <code className="flex-1 text-xs text-ink-100 font-mono whitespace-nowrap overflow-x-auto hide-scrollbar">{runCmd}</code>
              <CopyButton text={runCmd} className="px-2 py-1" />
            </div>
            <p className="text-xs text-ink-400 mt-2 leading-relaxed">
              Or just say <em className="text-ink-200">"Implexa, run this skill"</em> in natural language — Claude fuzzy-matches.
            </p>
          </li>
        </ol>

        <div className="mt-6 pt-5 border-t border-ink-700">
          <p className="text-xs text-ink-400 leading-relaxed">
            New here? <a href="https://app.implexa.ai/signup" className="text-brand-500 hover:underline">Create a free account →</a> No credit card. Sign up, install, run — all in under a minute.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
