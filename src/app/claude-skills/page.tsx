import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import {
  jsonLdGraph,
  breadcrumbSchema,
} from "@/lib/jsonld";

// /claude-skills — pillar SEO landing for the "claude skills" search term.
// Rendered as bespoke TSX (not the markdown pipeline) because the layout
// includes a sticky TOC, comparison tables, and section-anchored cross
// links to /scores, /search, and /pricing that the markdown prose styling
// doesn't carry cleanly.
//
// Voice: sentence case section headers + body, no em-dashes.
// Matches /pricing + /scores.
//
// SEO intent: this is the canonical destination for "what are claude
// skills" head terms. We don't have a SoftwareApplication-style schema
// for a guide, so we ship Article + BreadcrumbList. Together with the
// inline TOC and explicit section IDs this is the strongest signal we
// can give Google about the structure of the page.

const PUBLISHED_AT = "2026-05-18";

export const metadata: Metadata = {
  // SEO intent differentiation 2026-05-27: this page kept overlapping with
  // /blog/what-are-claude-skills on identical title + meta wording, causing
  // keyword cannibalization (170 + 71 = 241 impressions split across two
  // pages with 0 clicks). New positioning: /claude-skills = transactional
  // "browse + use" landing. /blog/what-are-claude-skills = informational
  // "what + why" explainer.
  title: "Claude skills marketplace: 40,000+ ranked and runnable | implexa",
  description:
    "Browse, search, and run any of 40,000+ ranked Claude skills inline. No install per skill. Cross-vendor index across Anthropic, Smithery, ClawHub, Skills.sh, and GitHub, ranked by SkillRank.",
  alternates: { canonical: "/claude-skills" },
  openGraph: {
    type: "article",
    url: absoluteUrl("/claude-skills"),
    title: "Claude skills marketplace: 40,000+ ranked and runnable | implexa",
    description:
      "Browse + run any of 40,000+ ranked Claude skills inline, no install per skill. Cross-vendor index across Anthropic, Smithery, ClawHub, Skills.sh, GitHub.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ImplexaAI",
    title: "What are Claude skills?",
    description:
      "The pillar guide: SKILL.md anatomy + the 6-component contract.",
  },
  // og:image / twitter:image are injected automatically from the colocated
  // opengraph-image.tsx (the dynamic card generator) — no images field above.
};

// Table of contents entries, kept in one array so both the sticky sidebar
// and the SEO ItemList schema generate from the same source.
const TOC: ReadonlyArray<{ id: string; label: string }> = [
  { id: "definition", label: "The one-line version" },
  { id: "why", label: "Why Claude skills exist" },
  { id: "structure", label: "How a skill is structured" },
  { id: "six", label: "The 6 components of a great skill" },
  { id: "build", label: "Two ways to build a skill" },
  { id: "run", label: "How skills run" },
  { id: "share", label: "Sharing skills with your team" },
  { id: "works", label: "What makes a skill actually work" },
  { id: "install", label: "Install Implexa to record your first skill" },
  { id: "faq", label: "FAQ" },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-16 mb-5">
        {title}
      </h2>
      <div className="text-zinc-300 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export default function ClaudeSkillsPage() {
  const articleUrl = absoluteUrl("/claude-skills");

  // Article + Breadcrumb. We mint the Article node inline (rather than
  // calling articleSchema()) because articleSchema is hardcoded to the
  // /resources/ URL convention and this page lives at the root.
  const articleNode = {
    "@type": "Article",
    "@id": articleUrl,
    headline:
      "What are Claude skills? (and the right way to build them)",
    description:
      "Claude Skills are reusable instructions Claude loads on demand. The 6-component contract, two ways to build, and how skills run.",
    image: absoluteUrl("/claude-skills/opengraph-image"),
    datePublished: PUBLISHED_AT,
    dateModified: PUBLISHED_AT,
    author: { "@id": `${absoluteUrl("/")}#organization` },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  const ldJson = jsonLdGraph(
    articleNode,
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "claude skills", url: articleUrl },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back home
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
          >
            pillar guide
          </Badge>
          <span className="text-xs text-zinc-500">Published May 18, 2026</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-5 max-w-4xl">
          What are Claude skills? (and the right way to build them)
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl mb-12">
          A Claude Skill is a small, self-contained instruction pack, usually a
          single <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
          file, that Claude loads on demand to handle a specific task. Think of it as a function
          Claude knows how to call: it has a name, a description, and a procedure inside.
        </p>

        {/* layout: sticky TOC on the left, prose on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-10">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-mono">
                contents
              </div>
              <nav className="space-y-2">
                {TOC.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="block text-sm text-zinc-400 hover:text-white transition-colors leading-snug"
                  >
                    {t.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-zinc-900">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-mono">
                  related
                </div>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/scores"
                    className="block text-zinc-400 hover:text-white"
                  >
                    Top-rated skills →
                  </Link>
                  <Link
                    href="/search"
                    className="block text-zinc-400 hover:text-white"
                  >
                    Search the index →
                  </Link>
                  <Link
                    href="/pricing"
                    className="block text-zinc-400 hover:text-white"
                  >
                    Pricing →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* prose */}
          <article className="max-w-3xl">
            <Section id="definition" title="The one-line version">
              <p>
                A Claude Skill is a function Claude knows how to call,
                defined in plain markdown, loaded automatically when its
                description matches the user&apos;s request.
              </p>
              <p>
                When Claude encounters a request that matches a skill&apos;s
                description, it loads the skill, follows the procedure, and
                produces the output. Skills replace pasting the same
                multi-paragraph prompt into every new conversation.
              </p>
            </Section>

            <Section id="why" title="Why Claude skills exist">
              <p>
                Most people use Claude by writing a prompt every time they
                want something done. That works for one-off tasks. It falls
                apart the moment you want repeatability: pricing a deal,
                drafting a stand-up update, reviewing a PR, sourcing
                candidates for a role.
              </p>
              <p>You end up with:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
                <li>A Notes file of prompts you keep pasting</li>
                <li>Slightly different output every time, because the prompt drifted</li>
                <li>No way to share the prompt with your team</li>
                <li>No record of which prompt produced which result</li>
              </ul>
              <p>
                <strong className="text-white">Claude Skills solve the repeatability problem.</strong>{" "}
                Once a skill exists, Claude triggers it automatically when the request matches.
                The same input produces the same output. Your team can use it. Your future self can use it.
              </p>
            </Section>

            <Section id="structure" title="How a Claude skill is structured">
              <p>
                Every Claude Skill is a directory with at least one file:{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>.
              </p>
              <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-sm font-mono text-zinc-200 overflow-x-auto leading-relaxed">{`my-skill/
├── SKILL.md         ← required: instructions + frontmatter
├── reference.md     ← optional: additional context Claude can read
└── examples/        ← optional: sample inputs/outputs`}</pre>
              <p>
                The <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                file has YAML frontmatter at the top, followed by markdown instructions:
              </p>
              <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-sm font-mono text-zinc-200 overflow-x-auto leading-relaxed">{`---
name: prep-sales-call
description: Pull recent activity for an account before a sales call.
             Company news, contact roles, last touchpoint, open opportunities.
---

# Sales call prep

## When to use
Trigger when the user mentions an upcoming meeting with a named company.

## Inputs needed
- Company name or domain
- Meeting date (defaults to next 7 days)

## Procedure
1. Look up the company in the CRM
2. Pull last 5 activities across all contacts
3. Check for news in the past 30 days
4. Summarize in the format below

## Output format
**Account:** {name}
**Last touch:** {date, channel, who}
**Recent news:** {bullets}
**Open opps:** {stage, amount}
**Recommended angle:** {one sentence}`}</pre>
              <p>
                That frontmatter{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">description</code>{" "}
                is the most important field. Claude reads it to decide whether to load the skill,
                so it has to be specific. &quot;help with sales&quot; is too vague.
                &quot;pull recent activity for an account before a sales call&quot; is specific enough to trigger reliably.
              </p>
            </Section>

            <Section id="six" title="The 6 components of a great skill">
              <p>
                Most &quot;skill&quot; tutorials online stop at three things: name, description, procedure.
                That&apos;s enough to make Claude load the skill. It&apos;s not enough to make
                the skill consistently produce good output.
              </p>
              <p>A skill that holds up under real use covers six components:</p>
              <div className="rounded-lg border border-zinc-900 overflow-hidden my-6">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950 border-b border-zinc-900 text-zinc-400">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium w-12">#</th>
                      <th className="text-left px-4 py-2 font-medium w-44">Component</th>
                      <th className="text-left px-4 py-2 font-medium">What it answers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {[
                      ["1", "Intent", "What is this skill for? When should Claude trigger it?"],
                      ["2", "Inputs", "What does the user need to provide? What defaults apply?"],
                      ["3", "Procedure", "What's the step-by-step? Which tools get called?"],
                      ["4", "Decision points", "Where does the workflow branch? Why pick path A over B?"],
                      ["5", "Output contract", "What does the result look like? What format, what fields?"],
                      ["6", "Outcome signal", "How do you know it worked? What event in your system of record confirms success?"],
                    ].map(([n, c, w]) => (
                      <tr key={n} className="text-zinc-300">
                        <td className="px-4 py-2.5 text-zinc-500 font-mono">{n}</td>
                        <td className="px-4 py-2.5 font-medium text-white">{c}</td>
                        <td className="px-4 py-2.5 leading-relaxed">{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Most hand-written skills cover 1, 2, 3, and 5. They skip{" "}
                <strong className="text-white">decision points</strong> (the why-this-not-that choices)
                and <strong className="text-white">outcome signal</strong> (how you&apos;d measure
                if the skill actually worked).
              </p>
              <p>
                Skipping those two is why hand-written skills feel brittle. The procedure looks right,
                but the moment the input shifts slightly, the skill doesn&apos;t know how to branch,
                because the author never wrote down <em>why</em> they made each choice when they did it themselves.
              </p>
            </Section>

            <Section id="build" title="Two ways to build a Claude skill">
              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Approach 1: write it by hand</h3>
              <p>
                Open a text editor, write the{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>,
                drop it in{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">~/.claude/skills/your-skill/</code>,
                and Claude will pick it up.
              </p>
              <p>
                <strong className="text-white">Pros:</strong> total control. Good for very short skills (under ~20 lines).
              </p>
              <p>
                <strong className="text-white">Cons:</strong> you have to articulate every decision you&apos;d make subconsciously
                while doing the work. Most people miss the branches. You write down what you <em>think</em> you do,
                not what you <em>actually</em> do.
              </p>
              <p>
                This is the path Anthropic&apos;s official{" "}
                <a href="https://docs.anthropic.com/" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  skill creator
                </a>{" "}
                plugin guides you through. It interviews you, then drafts the file. It works, but it relies
                on you accurately describing your own workflow from memory.
              </p>

              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Approach 2: demonstrate it once, let it be captured</h3>
              <p>
                The other approach: do the workflow normally, once. The tool calls, the data you pulled,
                the decisions you made, the output you produced, all of it gets captured. Then a short
                post-demonstration interview fills in the gaps: <em>why</em> did you choose this filter
                over that one, what signals success, what edge cases matter.
              </p>
              <p>
                The output is the same{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                file. But because it was captured from your actual behavior plus a structured interview
                about decision rationale, it covers all six components, including the decision points
                most authors leave out.
              </p>
              <p>
                This is what <Link href="/" className="text-white underline decoration-zinc-600 hover:decoration-white">Implexa</Link> does.
                We call the captured layer <strong className="text-white">decision traces</strong>: the visible tool calls{" "}
                <em>plus</em> the interview-extracted rationale behind each branch. It&apos;s the difference between
                a skill that handles your happy path and a skill that knows what to do when the input doesn&apos;t match.
              </p>
              <p>
                Walkthrough in{" "}
                <Link href="/blog/how-to-create-a-claude-skill" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  how to create a Claude skill
                </Link>.
              </p>
            </Section>

            <Section id="run" title="How skills run">
              <p>
                When you make a request, Claude scans available skills&apos;{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">description</code>{" "}
                fields. If one matches, it loads that skill&apos;s{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                and follows the procedure. The skill can call tools (MCP servers, your CRM, your
                data warehouse), read additional reference files, and produce structured output.
              </p>
              <p>
                You don&apos;t have to invoke skills explicitly. If the description is well-written,
                Claude triggers them automatically. You <em>can</em> invoke explicitly with{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">/your-skill-name</code>{" "}
                if you want to force a specific one.
              </p>
              <p>Skills live in two places:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
                <li>
                  <strong className="text-white">User-level:</strong>{" "}
                  <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">~/.claude/skills/</code>{" "}
                  (only you can run them)
                </li>
                <li>
                  <strong className="text-white">Project-level:</strong>{" "}
                  <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">.claude/skills/</code>{" "}
                  in a repo (anyone who clones the repo gets them)
                </li>
              </ul>
              <p>
                If you&apos;re sharing skills across a team without git, you need a separate sharing
                layer (next section).
              </p>
              <p className="text-sm text-zinc-400">
                Want to see the highest-ranked skills already out there?{" "}
                <Link href="/scores" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  Browse the SkillRank leaderboard
                </Link>{" "}
                or{" "}
                <Link href="/search" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  search 40,000+ skills
                </Link>{" "}
                across six sources.
              </p>
            </Section>

            <Section id="share" title="Sharing Claude skills with your team">
              <p>
                There&apos;s no built-in way to share{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                files across a team. You can:
              </p>
              <ol className="list-decimal pl-6 space-y-1.5 text-zinc-300">
                <li>
                  <strong className="text-white">Commit to a shared repo</strong>: works if every teammate
                  clones the same repo
                </li>
                <li>
                  <strong className="text-white">Paste in Slack</strong>: works once, becomes stale immediately
                </li>
                <li>
                  <strong className="text-white">Use a skill-graph host</strong>: what Implexa provides.
                  Skills get a shareable link, your org sees them in a library, every run reports outcome
                  data back so you can see which skills are working
                </li>
              </ol>
              <p>
                The third option also opens up a public library: workflows other people have shared,
                ready to fork into your own org. If three people on different teams all build a
                &quot;weekly competitor intel&quot; skill, only one of them needs to exist publicly;
                the rest fork it and customize.{" "}
                <Link href="/pricing" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  Pricing
                </Link>{" "}
                lists the org-library tier.
              </p>
            </Section>

            <Section id="works" title="What makes a skill actually work">
              <p>
                A few things separate skills that work the first time from ones that need three rounds of fixing:
              </p>
              <p>
                <strong className="text-white">Specific descriptions.</strong>{" "}
                &quot;sales help&quot; doesn&apos;t trigger. &quot;pull last 30 days of CRM activity for a
                named account before a meeting&quot; triggers exactly when you want it to.
              </p>
              <p>
                <strong className="text-white">Named tools.</strong>{" "}
                If your skill needs a CRM lookup, name the tool. Don&apos;t say &quot;look up the account&quot;.
                Say &quot;call{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">crm_query</code>{" "}
                with the account name.&quot; Claude is much better at executing specific tool calls than improvising.
              </p>
              <p>
                <strong className="text-white">Output examples.</strong>{" "}
                Show what good looks like. One sample output beats three paragraphs of &quot;should be concise&quot;.
              </p>
              <p>
                <strong className="text-white">Decision rationale.</strong>{" "}
                Write down <em>why</em> you&apos;d pick option A. When the input shifts and the skill needs
                to branch, that rationale is what lets Claude generalize.
              </p>
              <p>
                <strong className="text-white">Outcome signal.</strong>{" "}
                Write down what event tells you the skill worked next time. CRM stage change? Calendar event
                accepted? Reply received? Without this, you have no feedback loop.
              </p>
            </Section>

            <Section id="install" title="Install Implexa to record your first skill">
              <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed">
                <span className="text-zinc-600">$</span>{" "}
                <span className="text-emerald-400">curl</span> -fsSL{" "}
                <span className="text-amber-400">https://core.implexa.ai/install.sh</span>{" "}
                | <span className="text-emerald-400">bash</span>
              </pre>
              <p>This installs the plugin into Claude Code. Restart Claude, then run:</p>
              <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-sm font-mono text-amber-300 overflow-x-auto leading-relaxed">
                /implexa:record
              </pre>
              <p>
                Demonstrate the workflow once. Answer 2 to 4 short interview questions. You get a working
                skill with all six components covered, plus a shareable link if you want to give it to your
                team or post it publicly.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href="/install"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "bg-white text-black hover:bg-zinc-200 h-11 px-5 inline-flex items-center gap-2",
                  })}
                >
                  <Download className="size-4" aria-hidden="true" />
                  Install the plugin
                </Link>
                <Link
                  href="/blog/how-to-create-a-claude-skill"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "border-zinc-700 text-zinc-300 hover:bg-zinc-950 hover:text-white h-11 px-5 inline-flex items-center gap-2",
                  })}
                >
                  Step-by-step tutorial
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Section>

            <Section id="faq" title="FAQ">
              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                What&apos;s the difference between Claude Skills and Claude Code Skills?
              </h3>
              <p>
                They&apos;re the same thing. &quot;Claude Skills&quot; is the general term;
                &quot;Claude Code Skills&quot; refers to using them inside the Claude Code CLI specifically.
                The{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                format is identical in both.
              </p>

              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                Where do Claude Skills live on disk?
              </h3>
              <p>
                User-level skills live in{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">~/.claude/skills/</code>.
                Project-level skills live in{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">.claude/skills/</code>{" "}
                inside the repo. Both are auto-discovered.
              </p>

              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                Can I share a skill without giving someone access to my whole codebase?
              </h3>
              <p>
                Yes. Either commit the skill to a public repo and share the path, or use a skill-graph
                host (like Implexa) that gives each skill its own shareable link.
              </p>

              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                Do Claude Skills work outside Claude Code?
              </h3>
              <p>
                The{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>{" "}
                format is specific to Claude Code&apos;s loader. Claude Desktop and the Anthropic API don&apos;t
                auto-load skills the same way. You&apos;d paste the contents into a system prompt or wrap them in an agent.
              </p>

              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                How is this different from MCP?
              </h3>
              <p>
                MCP (Model Context Protocol) is the protocol Claude uses to <em>call</em> external tools.
                Skills are the <em>instructions</em> for when and how to call them. A skill can use one or
                more MCP servers; an MCP server is useful even without skills.
              </p>

              <h3 className="text-base font-semibold text-white mt-6 mb-2">
                What does Anthropic&apos;s Skill Creator plugin do?
              </h3>
              <p>
                Skill Creator is Anthropic&apos;s official skill-authoring tool. It interviews you about
                a workflow, then generates a{" "}
                <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.875em]">SKILL.md</code>.
                It&apos;s a description-first approach: you tell it what the workflow is.{" "}
                <Link href="/blog/how-to-create-a-claude-skill" className="text-white underline decoration-zinc-600 hover:decoration-white">
                  Implexa
                </Link>{" "}
                is a demonstration-first approach: you do the workflow once and the capture layer plus
                interview produce the skill.
              </p>
            </Section>

            <hr className="border-zinc-900 my-12" />

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Next reads</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/blog/how-to-create-a-claude-skill"
                    className="text-white underline decoration-zinc-600 hover:decoration-white"
                  >
                    How to create a Claude skill (step-by-step)
                  </Link>
                  <span className="text-zinc-400"> · 7-step walkthrough from install to running your first skill.</span>
                </li>
                <li>
                  <Link
                    href="/blog/what-are-claude-skills"
                    className="text-white underline decoration-zinc-600 hover:decoration-white"
                  >
                    What are Claude skills? (5-minute explainer)
                  </Link>
                  <span className="text-zinc-400"> · Short definitional read with sample SKILL.md.</span>
                </li>
                <li>
                  <Link
                    href="/resources/what-is-a-skill-graph"
                    className="text-white underline decoration-zinc-600 hover:decoration-white"
                  >
                    What is a skill graph?
                  </Link>
                  <span className="text-zinc-400"> · The structure that connects many skills together, plus how AI teams use them.</span>
                </li>
              </ul>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
