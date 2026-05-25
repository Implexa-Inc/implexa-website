"use client";

import { useState } from "react";
import { Play, Check, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  slug: string;
  source: string;
};

// The previous implementation used a `claude://implexa/apply?...` deeplink
// but no protocol handler is registered for it. Clicking did nothing on
// most machines.
//
// New behavior: copy the invocation command to clipboard, show a "copied"
// state for 2 seconds. The user pastes it into their Claude Code session
// and the installed Implexa plugin recognizes "implexa run <slug>" and
// triggers apply_recommended_skill.
//
// For users without the plugin installed, a small hint below the button
// links to /install.
export function RunInClaudeButton({ slug, source }: Props) {
  const [copied, setCopied] = useState(false);
  const command = `implexa run ${source}/${slug}`;

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Some browsers / iframes block clipboard. Silent fail; the inline
      // pre block below the button shows the command anyway.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={buttonVariants({
          size: "lg",
          className:
            "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base inline-flex items-center gap-2",
        })}
        aria-label={copied ? "command copied to clipboard" : "copy run command to clipboard"}
      >
        {copied ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            copied! paste in claude code
          </>
        ) : (
          <>
            <Play className="size-4" aria-hidden="true" />
            run inline in claude
          </>
        )}
      </button>
      <div className="text-[11px] text-zinc-500 font-mono inline-flex items-center gap-1.5 ml-1">
        <Copy className="size-3 opacity-60" aria-hidden="true" />
        copies: <span className="text-zinc-300">{command}</span>
      </div>
    </div>
  );
}
