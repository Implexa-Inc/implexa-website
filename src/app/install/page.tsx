import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Monitor,
  Terminal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const DASHBOARD_URL = "https://app.implexa.ai";
// Stable "latest" link — always resolves to the newest published universal dmg
// (Apple Silicon + Intel), signed + notarized. Hosted on the public releases repo
// so the desktop source stays private.
const MAC_DOWNLOAD_URL =
  "https://github.com/Implexa-Inc/implexa-releases/releases/latest/download/Implexa-universal.dmg";

export const metadata: Metadata = {
  title: "Get started with Implexa",
  description:
    "Download the one-click macOS app, or paste one command into your own Claude Code or Codex to connect Implexa. Your agents build and run on the plan you already pay for.",
  alternates: { canonical: "/install" },
};

// Two honest steps. Sign-up first (so your idea is saved and we can show you
// your agent), then one connect command pasted into Claude or Codex. The
// desktop app will collapse this to one click; until it ships, this is the way
// in, and it works on both Claude and Codex at parity.
const STEPS = [
  {
    n: "1",
    title: "Create your free account",
    body: "Takes a few seconds. If you came here from a job you typed, it is already saved and waiting.",
  },
  {
    n: "2",
    title: "Connect Claude or Codex",
    body: "Paste one command into your own Claude Code or Codex. It installs the Implexa plugin and signs you in.",
  },
  {
    n: "3",
    title: "Your agent builds itself",
    body: "Implexa picks up the job, builds the agent inside your own AI, and you put it on a schedule.",
  },
];

export default function InstallPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          Get started in two minutes
        </h1>
        <p className="text-lg text-zinc-400 mb-6">
          Download the one-click app, or paste one command into your own Claude
          or Codex. Your agents build and run on the plan you already pay for.
        </p>

        {/* Primary path, top of page: the one-click macOS app (live, notarized). */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
          <a
            href={MAC_DOWNLOAD_URL}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            <Download className="size-4" aria-hidden="true" />
            Download for macOS
          </a>
          <span className="text-xs text-zinc-500">
            Universal &middot; macOS 11+ &middot; signed &amp; notarized &middot; free &mdash; or use the command below for Claude Code / Codex.
          </span>
        </div>

        {/* Step 1 - the honey-trap: sign up first, so the idea is captured and we
            can show the connect command on the dashboard, scoped to the user. */}
        <div className="rounded-xl border border-zinc-700 bg-gradient-to-b from-zinc-950 to-black p-6 sm:p-8 mb-10">
          <div className="text-xs uppercase tracking-wider text-amber-400 mb-2 font-mono">
            Step 1
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Create your free account
          </h2>
          <p className="text-sm text-zinc-400 mb-5 max-w-xl">
            Free forever for one person. No card. Once you are in, your dashboard
            shows the exact command to connect your own Claude or Codex, and your
            first agent is waiting to build.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${DASHBOARD_URL}/signup?plan=free`}
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-white text-black hover:bg-zinc-200 h-11 px-6 inline-flex items-center gap-2 font-medium",
              })}
            >
              Create free account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={`${DASHBOARD_URL}/login`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Already have one? Sign in &rarr;
            </Link>
          </div>
        </div>

        {/* The three-step shape, so a visitor sees the whole path at a glance. */}
        <section className="mb-12 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center text-amber-300 font-mono text-sm mb-3">
                {s.n}
              </div>
              <h3 className="text-base font-medium text-white mb-1.5">
                {s.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </section>

        <Separator className="bg-zinc-900 mb-12" />

        {/* Step 2 - the connect command, at parity for Claude and Codex. After
            signup the dashboard shows this scoped to the user; it is here too so
            terminal-first people can self-serve. */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="size-5 text-zinc-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">
              Step 2: connect Claude or Codex
            </h2>
          </div>
          <p className="text-sm text-zinc-500 mb-6">
            One command. It installs the Implexa plugin and signs you in. Pick
            the one you use, both are first-class.
          </p>

          <div className="space-y-6">
            {/* Claude Code */}
            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-white text-lg">Claude Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock command="curl -fsSL https://core.implexa.ai/install.sh | bash" />
                <p className="text-xs text-zinc-500 mt-3">
                  Opens a browser for sign-in, writes the Implexa hook and MCP
                  server config, and registers the plugin in Claude Code. Fully
                  quit and relaunch Claude Code to pick up the new tools.
                </p>
              </CardContent>
            </Card>

            {/* Codex */}
            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-white text-lg">Codex</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock command="curl -fsSL https://core.implexa.ai/install-for-codex.sh | bash" />
                <p className="text-xs text-zinc-500 mt-3">
                  Requires the OpenAI Codex CLI 0.50 or newer (
                  <code className="text-zinc-400">npm install -g @openai/codex</code>
                  ). Same sign-in flow as Claude. Writes the Implexa MCP server
                  block to{" "}
                  <code className="text-zinc-400">~/.codex/config.toml</code> and
                  installs the agent skills. Fully quit and relaunch Codex to load
                  them.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Step 3 - what to do once connected (running agents, not searching). */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Step 3: build your first agent
          </h2>
          <p className="text-zinc-400 mb-3">
            After install and relaunch, just say what you want it to do:
          </p>
          <CodeBlock command="Implexa, build me an agent that emails me my key numbers every morning" />
          <p className="text-xs text-zinc-500 mt-3">
            Implexa builds it, you put it on a schedule, and it runs as you, on
            your data. Or use the slash commands directly:{" "}
            <code className="text-zinc-400">/implexa:run</code>,{" "}
            <code className="text-zinc-400">/implexa:schedule</code>,{" "}
            <code className="text-zinc-400">/implexa:my-skills</code>. Codex uses{" "}
            <code className="text-zinc-400">$implexa-*</code> instead of{" "}
            <code className="text-zinc-400">/implexa:*</code>.
          </p>
        </section>

        <Separator className="bg-zinc-900 mb-12" />

        {/* The desktop app collapses all of this to one click - now downloadable. */}
        <Card className="bg-zinc-950 border-zinc-800 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Monitor className="size-5" aria-hidden="true" />
              One-click app for macOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              The desktop app does Step 2 and 3 for you: it installs Implexa into
              your Claude Code and Codex, keeps your scheduled agents running, and
              shows their results in one place. Signed and notarized by Apple, so
              it opens with no warning, and one universal download runs on both
              Apple Silicon and Intel Macs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={MAC_DOWNLOAD_URL}
                className={buttonVariants({ size: "lg" })}
              >
                <Download className="size-4" aria-hidden="true" />
                Download for macOS
              </a>
              <span className="text-xs text-zinc-500">
                Universal &middot; macOS 11+ &middot; free
              </span>
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Help</h2>
          <p className="text-zinc-400">
            Stuck on the connect step?{" "}
            <Link
              href="https://github.com/Implexa-Inc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              Open an issue
            </Link>
            . Most fixes ship same-day.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function CodeBlock({ command }: { command: string }) {
  return (
    <pre className="bg-black border border-zinc-800 rounded-md p-3 text-sm text-zinc-200 overflow-auto">
      <code>{command}</code>
    </pre>
  );
}
