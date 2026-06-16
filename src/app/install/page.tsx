import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Download } from "lucide-react";
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
    "Download the one-click macOS app to build and run AI agents in your own Claude or Codex. Free, on the plan you already pay for. Windows, Linux, and terminal users can connect with one command.",
  alternates: { canonical: "/install" },
};

// What happens after the download. The whole point of the app is that there
// are no commands to paste: it signs you in and wires Implexa into your own
// Claude/Codex, so all that's left is to describe a job. Three short beats,
// not a wall of steps.
const AFTER = [
  {
    n: "1",
    title: "Open the app",
    body: "It signs you in and connects Implexa to your own Claude or Codex. Nothing to paste.",
  },
  {
    n: "2",
    title: "Describe a job",
    body: "Say what you want done in one sentence. Implexa builds the agent inside your own AI.",
  },
  {
    n: "3",
    title: "Put it on a schedule",
    body: "It runs as you, on your data. The result lands in your inbox.",
  },
];

export default function InstallPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-10"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          Get started
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-xl">
          One download. The app connects your own Claude or Codex and runs your
          agents on the plan you already pay for. Free.
        </p>

        {/* The single primary action. Everything else on the page supports it. */}
        <a
          href={MAC_DOWNLOAD_URL}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-6 py-3 text-base font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Download className="size-5" aria-hidden="true" />
          Download for macOS
        </a>
        <p className="text-xs text-zinc-500 mt-3">
          Universal &middot; macOS 11+ &middot; signed &amp; notarized &middot; free
        </p>

        {/* What happens next — light, three beats. */}
        <section className="mt-14 space-y-6">
          {AFTER.map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="shrink-0 size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center text-amber-300 font-mono text-sm">
                {s.n}
              </div>
              <div>
                <h3 className="text-base font-medium text-white mb-0.5">
                  {s.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* The one escape hatch, collapsed. Non-Mac + terminal-first + Codex
            users live here; everyone else never has to see a command. */}
        <details className="mt-14 group rounded-lg border border-zinc-800 bg-zinc-950">
          <summary className="cursor-pointer select-none list-none px-5 py-4 text-sm text-zinc-300 hover:text-white flex items-center gap-2">
            <span className="text-zinc-500 group-open:rotate-90 transition-transform inline-block">
              &#9656;
            </span>
            Not on a Mac, or prefer the terminal?
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-zinc-800 space-y-5">
            <p className="text-sm text-zinc-400">
              Paste one command into your own Claude Code or Codex. It installs
              the Implexa plugin and creates your free account on sign-in. Fully
              quit and relaunch to pick up the new tools.
            </p>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                Claude Code
              </p>
              <CodeBlock command="curl -fsSL https://core.implexa.ai/install.sh | bash" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                Codex
              </p>
              <CodeBlock command="curl -fsSL https://core.implexa.ai/install-for-codex.sh | bash" />
              <p className="text-xs text-zinc-500 mt-2">
                Needs the OpenAI Codex CLI 0.50 or newer (
                <code className="text-zinc-400">npm install -g @openai/codex</code>
                ).
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              Prefer to start on the web?{" "}
              <Link
                href={`${DASHBOARD_URL}/signup?plan=free`}
                className="text-white hover:underline"
              >
                Create your free account
              </Link>{" "}
              and your dashboard shows the command scoped to you.
            </p>
          </div>
        </details>

        <p className="mt-12 text-sm text-zinc-500">
          Stuck?{" "}
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
