import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check, Clock, Download, Monitor, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Install Implexa",
  description:
    "Download the Implexa desktop app for macOS. It installs Implexa into your own Claude Code and Codex and runs your agents on a schedule. Prefer the CLI? Install the plugin with one command.",
  alternates: { canonical: "/install" },
};

const WHAT_IT_DOES = [
  "Installs Implexa into your own Claude Code and Codex, in one click",
  "Runs your agents on a schedule, as you, on your real data",
  "Keeps your machine awake for scheduled runs and gathers the results",
  "Presence, not runtime: it never touches your model or your credentials",
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
          Install Implexa
        </h1>
        <p className="text-lg text-zinc-400 mb-10">
          One download. The desktop app installs Implexa into your own Claude Code
          and Codex, and runs your agents for you.
        </p>

        {/* Primary path: the desktop app. The notarized build is not published
            yet (pending an Apple Developer certificate), so the download is an
            honest coming-soon with an email capture, not a broken link. */}
        <Card className="bg-zinc-950 border-zinc-800 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Monitor className="size-5" aria-hidden="true" />
              Implexa for macOS
              <span className="text-xs font-normal text-amber-300/80 inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                Coming soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              The desktop app is the simplest way in: it installs Implexa into your
              Claude Code and Codex, keeps your scheduled agents running, and shows
              their results in one place. We are finishing Apple notarization so the
              download is safe and one-click. Leave your email and we will tell you
              the moment it is ready.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-md bg-zinc-800 text-zinc-500 px-4 py-2 text-sm font-medium cursor-not-allowed"
                aria-disabled="true"
              >
                <Download className="size-4" aria-hidden="true" />
                Download for macOS
              </button>
              <Link
                href="mailto:hello@implexa.ai?subject=Notify%20me%20when%20the%20Implexa%20macOS%20app%20is%20ready"
                className="text-sm text-amber-300/90 hover:text-amber-200 transition-colors"
              >
                Notify me when it is ready &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            What the app does
          </h2>
          <ul className="space-y-3">
            {WHAT_IT_DOES.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="size-5 text-white flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-zinc-300">{step}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="bg-zinc-900 mb-12" />

        {/* Secondary path: the CLI / plugin install for terminal-first users. */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="size-5 text-zinc-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">
              Prefer the CLI? Install the plugin manually
            </h2>
          </div>
          <p className="text-sm text-zinc-500 mb-6">
            If you live in the terminal, you can install the Implexa plugin into
            Claude Code or Codex right now with one command. The desktop app does
            this for you.
          </p>

          <div className="space-y-6">
            {/* Claude Code: install.sh handles device-auth + hooks + MCP server. */}
            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-white text-lg">Claude Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock command="curl -fsSL https://core.implexa.ai/install.sh | bash" />
                <p className="text-xs text-zinc-500 mt-3">
                  Opens a browser for sign-in (device-auth), writes the
                  UserPromptSubmit hook and the MCP server config, and registers the
                  plugin in Claude Code&apos;s marketplace cache. Fully quit and
                  relaunch Claude Code to pick up the new tools.
                </p>
              </CardContent>
            </Card>

            {/* Codex: separate script for ~/.codex/config.toml's shape. */}
            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-white text-lg">Codex</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock command="curl -fsSL https://core.implexa.ai/install-for-codex.sh | bash" />
                <p className="text-xs text-zinc-500 mt-3">
                  Requires the OpenAI Codex CLI 0.50 or newer (
                  <code className="text-zinc-400">npm install -g @openai/codex</code>
                  ). Same device-auth flow as Claude. Writes the Implexa MCP server
                  block to{" "}
                  <code className="text-zinc-400">~/.codex/config.toml</code> and
                  installs the plugin skills to the cache. Fully quit and relaunch
                  Codex to load them.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Verify it</h2>
          <p className="text-zinc-400 mb-3">
            After install and relaunch, type this in any session:
          </p>
          <CodeBlock command="implexa, find me a skill for outbound sequences" />
          <p className="text-xs text-zinc-500 mt-3">
            You should see ranked matches with a fit reason and a one-tap apply
            path. Or use the slash commands directly:{" "}
            <code className="text-zinc-400">/implexa:suggest</code>,{" "}
            <code className="text-zinc-400">/implexa:run</code>,{" "}
            <code className="text-zinc-400">/implexa:record</code>,{" "}
            <code className="text-zinc-400">/implexa:my-skills</code>,{" "}
            <code className="text-zinc-400">/implexa:schedule</code>,{" "}
            <code className="text-zinc-400">/implexa:share-this</code>. Codex uses{" "}
            <code className="text-zinc-400">$implexa-*</code> instead of{" "}
            <code className="text-zinc-400">/implexa:*</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Help</h2>
          <p className="text-zinc-400">
            Broken install or a weird match?{" "}
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
