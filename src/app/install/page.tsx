import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "install",
  description:
    "install the implexa plugin in claude code or codex. one curl command, ~30 seconds, signs you up + writes the config.",
  alternates: { canonical: "/install" },
};

const STEPS = [
  "implexa runs alongside your session",
  "watches every prompt, semantic-matches against 22k+ skills across 6 sources",
  "surfaces the best fit with a 15-word reason",
  "one command to apply inline. no download, no install per skill",
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
          back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          install implexa
        </h1>
        <p className="text-lg text-zinc-400 mb-10">
          one curl command. ~30 seconds. signs you up + writes the config.
        </p>

        <section className="space-y-6 mb-12">
          {/* claude code — uses install.sh which handles device-auth + hooks
              + MCP server registration in one pass */}
          <Card className="bg-zinc-950 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white text-lg">claude code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock command="curl -fsSL https://core.implexa.ai/install.sh | bash" />
              <p className="text-xs text-zinc-500 mt-3">
                opens a browser for sign-in (device-auth), writes the
                UserPromptSubmit hook + the MCP server config, registers
                the plugin in claude code&apos;s marketplace cache. fully
                quit + relaunch claude code to pick up the new tools.
              </p>
            </CardContent>
          </Card>

          {/* codex CLI — separate script because ~/.codex/config.toml uses
              a different shape than ~/.claude/* (headers instead of bearer_token,
              query-param auth, marketplace + plugin registration blocks) */}
          <Card className="bg-zinc-950 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white text-lg">codex</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock command="curl -fsSL https://core.implexa.ai/install-for-codex.sh | bash" />
              <p className="text-xs text-zinc-500 mt-3">
                requires openai codex CLI ≥0.50 (
                <code className="text-zinc-400">npm install -g @openai/codex</code>
                ). same device-auth flow as claude. writes the implexa MCP
                server block to{" "}
                <code className="text-zinc-400">~/.codex/config.toml</code> and
                installs the plugin skills to the cache. fully quit + relaunch
                codex to load them.
              </p>
            </CardContent>
          </Card>

          {/* cursor — honest about state. we haven't built or verified this
              path, marketplace install scripts don't exist yet. soft signup
              for "tell me when it's ready" instead of fake commands. */}
          <Card className="bg-zinc-950 border-zinc-900 opacity-70">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                cursor
                <span className="text-xs font-normal text-amber-300/80 inline-flex items-center gap-1">
                  <Clock className="size-3" aria-hidden="true" />
                  coming soon
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-3">
                cursor&apos;s MCP config (
                <code className="text-zinc-400">.cursor/mcp.json</code>
                ) supports streamable HTTP servers, so the technical path
                exists. we&apos;re still verifying the auth + tool-discovery
                shape end-to-end before publishing an install script.
              </p>
              <Link
                href="mailto:hello@implexa.ai?subject=Tell%20me%20when%20Cursor%20support%20ships"
                className="text-sm text-amber-300/90 hover:text-amber-200 transition-colors"
              >
                tell me when it&apos;s ready →
              </Link>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-900 mb-12" />

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            what implexa does
          </h2>
          <ul className="space-y-3">
            {STEPS.map((step, i) => (
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

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">verify it</h2>
          <p className="text-zinc-400 mb-3">
            after install + relaunch, type this in any session:
          </p>
          <CodeBlock command="implexa, find me a skill for outbound sequences" />
          <p className="text-xs text-zinc-500 mt-3">
            you should see ranked matches with a fit reason and a one-tap
            apply path. or use the slash commands directly:{" "}
            <code className="text-zinc-400">
              /implexa:suggest
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:run
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:record
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:my-skills
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:help
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:schedule
            </code>
            ,{" "}
            <code className="text-zinc-400">
              /implexa:share-this
            </code>
            . codex uses{" "}
            <code className="text-zinc-400">$implexa-*</code> instead of{" "}
            <code className="text-zinc-400">/implexa:*</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">help</h2>
          <p className="text-zinc-400">
            broken install or weird match?{" "}
            <Link
              href="https://github.com/Implexa-Inc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              open an issue
            </Link>
            . most fixes ship same-day.
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
