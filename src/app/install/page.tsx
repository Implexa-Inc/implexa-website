import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "install",
  description:
    "install the implexa plugin in claude code, codex, or cursor. one command per runtime, takes 30 seconds.",
};

const STEPS = [
  "implexa runs alongside your session",
  "watches every prompt, semantic-matches against 100k+ skills",
  "surfaces the best fit with a 15-word reason",
  "one tap to apply inline. no download, no install",
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
          30 seconds. one command per runtime. cross-vendor by design.
        </p>

        <section className="space-y-6 mb-12">
          <Card className="bg-zinc-950 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white text-lg">claude code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock command="/plugin marketplace add Implexa-Inc/implexa-plugin" />
              <p className="text-xs text-zinc-500 mt-3">
                requires claude code 1.5+. installs the UserPromptSubmit hook
                plus the implexa MCP server.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white text-lg">codex CLI</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock command="codex skill add implexa@latest" />
              <p className="text-xs text-zinc-500 mt-3">
                requires openai codex CLI 0.4+. uses the agentskills.io standard.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white text-lg">cursor</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock command="cursor mcp add implexa https://core.implexa.ai/api/v2/mcp" />
              <p className="text-xs text-zinc-500 mt-3">
                rules sync via cursor's remote-rules surface. plugin runs as an
                MCP server.
              </p>
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
            after install, type this in any session:
          </p>
          <CodeBlock command="implexa, find me a skill for outbound sequences" />
          <p className="text-xs text-zinc-500 mt-3">
            you should see top-3 matches with a fit reason and a one-click run
            button.
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
