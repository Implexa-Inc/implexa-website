"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// One-line install command box with a tap-to-copy button + a platform
// toggle (Claude Code / Codex). Sign-up is implicit in the install flow —
// the script walks the user through device auth — so the hero no longer
// needs a separate "sign up" CTA on this surface.
//
// Two interaction notes:
//   - On copy, the button morphs to a green check for 1.6s then resets.
//   - Switching the platform pill rewrites the command + resets the
//     copy state so a fresh copy always reflects the visible command.

type Platform = "claude" | "codex";

const COMMANDS: Record<Platform, { label: string; cmd: string; tail: string }> = {
  claude: {
    label: "claude code",
    cmd: "curl -fsSL core.implexa.ai/install.sh | bash",
    tail: "core.implexa.ai/install.sh",
  },
  codex: {
    label: "codex",
    cmd: "curl -fsSL core.implexa.ai/install-for-codex.sh | bash",
    tail: "core.implexa.ai/install-for-codex.sh",
  },
};

export function CopyableInstall() {
  const [platform, setPlatform] = useState<Platform>("claude");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMMANDS[platform].cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore: clipboard can fail in insecure contexts or when blocked
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* platform toggle. amber-tinted when active to match the brand */}
      <div
        className="inline-flex items-center gap-1 p-1 rounded-full border border-zinc-800 bg-zinc-950 mb-3"
        role="tablist"
        aria-label="select platform"
      >
        {(Object.keys(COMMANDS) as Platform[]).map((p) => {
          const active = p === platform;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setPlatform(p);
                setCopied(false);
              }}
              className={
                "px-3 py-1 rounded-full text-xs font-medium transition-colors " +
                (active
                  ? "bg-amber-500/15 text-amber-300"
                  : "text-zinc-400 hover:text-white")
              }
            >
              {COMMANDS[p].label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="group w-full text-left bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden transition-colors"
        aria-label="copy install command"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <code className="font-mono text-sm sm:text-[15px] text-zinc-100 overflow-x-auto whitespace-nowrap">
            <span className="text-zinc-600 select-none mr-2">$</span>
            <span className="text-emerald-400">curl</span>{" "}
            <span className="text-zinc-400">-fsSL</span>{" "}
            <span className="text-amber-300">{COMMANDS[platform].tail}</span>{" "}
            <span className="text-zinc-500">|</span>{" "}
            <span className="text-emerald-400">bash</span>
          </code>
          <span
            className={
              "inline-flex items-center gap-1.5 text-xs shrink-0 transition-colors " +
              (copied
                ? "text-emerald-400"
                : "text-zinc-500 group-hover:text-zinc-300")
            }
          >
            {copied ? (
              <>
                <Check className="size-3.5" aria-hidden="true" />
                copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" aria-hidden="true" />
                copy
              </>
            )}
          </span>
        </div>
      </button>
      <p className="text-center text-xs text-zinc-500 mt-3">
        one command. signs you up + installs the plugin in {COMMANDS[platform].label}. free
        tier forever.
      </p>
    </div>
  );
}
