"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Single-line install command with a tap-to-copy button. Sign-up is
// implicit in the install flow (the script walks the user through it),
// so the hero no longer needs a separate "sign up" CTA on this surface.
//
// Two interaction notes:
//   - On copy, the button morphs to a green check for 1.6s then resets.
//   - The whole row is also clickable as a copy trigger so mobile taps
//     are forgiving (button target is generous, but the command text
//     itself is the obvious affordance).
export function CopyableInstall({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore: clipboard can fail in insecure contexts or when blocked
    }
  };

  return (
    <div className="max-w-xl mx-auto">
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
            <span className="text-amber-300">core.implexa.ai/install.sh</span>{" "}
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
        one command. signs you up + installs the plugin in claude code. free
        tier forever.
      </p>
    </div>
  );
}
