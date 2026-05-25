import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Play, GitFork, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type RouteParams = { source: string; slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { source, slug } = await props.params;
  const title = slug.replace(/-/g, " ");
  return {
    title: `${title} (${source})`,
    description: `${title}, a SKILL.md from ${source}. one-click install to claude code, codex, or cursor via implexa.`,
    openGraph: {
      type: "article",
      title: `${title} | implexa`,
      description: `SKILL.md from ${source}, indexed by implexa.`,
    },
  };
}

export default async function SkillDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { source, slug } = await props.params;
  // placeholder. real fetch will hit /api/skills/:source/:slug or
  // call the backend's mcp endpoint directly server-side.
  const title = slug.replace(/-/g, " ");
  const deeplink = `claude://implexa/apply?slug=${encodeURIComponent(
    slug,
  )}&source=${encodeURIComponent(source)}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back to search
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
          >
            {source}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] border-zinc-800 text-zinc-500"
          >
            unverified placeholder data
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          {title}
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mb-8">
          placeholder description. real content lands when the skill detail
          fetch is wired to the aggregated_skills index. expect a 200-400 word
          summary, install command, and the canonical SKILL.md body.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href={deeplink}
            className={buttonVariants({
              size: "lg",
              className:
                "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base",
            })}
          >
            <Play className="size-4 mr-2" aria-hidden="true" />
            run inline in claude
          </Link>
          <Link
            href={`https://github.com/search?q=path%3A**%2FSKILL.md+${encodeURIComponent(
              title,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "border-zinc-800 text-zinc-300 hover:bg-zinc-950 hover:text-white h-12 px-6 text-base",
            })}
          >
            <ExternalLink className="size-4 mr-2" aria-hidden="true" />
            view source
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1">installs</div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <Star className="size-3" aria-hidden="true" /> karma
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <GitFork className="size-3" aria-hidden="true" /> forks
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-zinc-900 mb-10" />

        <div className="prose prose-invert max-w-none">
          <h2 className="text-lg font-semibold text-white mb-3">
            SKILL.md preview
          </h2>
          <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-xs text-zinc-400 overflow-auto">
            {`---
name: ${slug}
description: placeholder. replaced by real fetch.
source: ${source}
---

# ${title}

placeholder content. the real SKILL.md body lives in aggregated_skills.body
and gets streamed in via a server component fetch in P2.3+.`}
          </pre>
        </div>

        <div className="mt-10 text-sm text-zinc-500">
          <p>
            don't have the plugin yet?{" "}
            <Link href="/install" className="text-white hover:underline">
              install it
            </Link>{" "}
            then click "run inline in claude" again.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
