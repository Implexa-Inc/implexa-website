import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Play, GitFork, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type RouteParams = { source: string; slug: string };

type AggregatedSkill = {
  ok: boolean;
  id?: string;
  source?: string;
  slug?: string;
  name?: string;
  description?: string;
  content?: string;
  author?: string;
  source_url?: string;
  install_count?: number | null;
  star_count?: number | null;
  last_seen_at?: string;
  is_active?: boolean;
  error?: string;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Server-side fetch of one aggregated_skills row via the get_aggregated_skill
// MCP tool. Read-only, no side effects. Returns null on any failure path so
// the detail page can fall back to a graceful 404 / placeholder state.
async function fetchAggregatedSkill(
  source: string,
  slug: string,
): Promise<AggregatedSkill | null> {
  if (!TOKEN) return null;

  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_aggregated_skill",
          arguments: { source, slug },
        },
      }),
      signal: AbortSignal.timeout(10000),
      // Cache at the edge for 5 min. Detail page content rarely changes; the
      // crawler refreshes nightly. Revalidating per request would be wasteful.
      next: { revalidate: 300 },
    });

    if (!upstream.ok) return null;

    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: AggregatedSkill = JSON.parse(raw);
    if (!parsed?.ok) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { source, slug } = await props.params;
  const skill = await fetchAggregatedSkill(source, slug);
  const title = skill?.name ?? slug.replace(/-/g, " ");
  const description =
    skill?.description ??
    `${title}, a SKILL.md from ${source}. one-click install to claude code, codex, or cursor via implexa.`;

  return {
    title: `${title} (${source})`,
    description,
    openGraph: {
      type: "article",
      title: `${title} | implexa`,
      description,
    },
  };
}

export default async function SkillDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { source, slug } = await props.params;
  const skill = await fetchAggregatedSkill(source, slug);

  // If the backend doesn't recognize this (source, slug), render 404 so we
  // don't pollute Google with placeholder pages for skills we don't have.
  if (!skill) {
    notFound();
  }

  const title = skill.name ?? slug.replace(/-/g, " ");
  const description = skill.description ?? "";
  const content = skill.content ?? "";
  const sourceUrl =
    skill.source_url ??
    `https://github.com/search?q=path%3A**%2FSKILL.md+${encodeURIComponent(title)}`;
  const installs =
    typeof skill.install_count === "number" ? skill.install_count : null;
  const stars =
    typeof skill.star_count === "number" ? skill.star_count : null;

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
          {skill.author ? (
            <Badge
              variant="outline"
              className="text-[10px] border-zinc-800 text-zinc-500"
            >
              by @{skill.author}
            </Badge>
          ) : null}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          {title}
        </h1>
        {description ? (
          <p className="text-lg text-zinc-400 max-w-2xl mb-8">{description}</p>
        ) : null}

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
            href={sourceUrl}
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
              <div className="text-2xl font-semibold text-white">
                {installs !== null ? installs.toLocaleString() : "--"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <Star className="size-3" aria-hidden="true" /> stars
              </div>
              <div className="text-2xl font-semibold text-white">
                {stars !== null ? stars.toLocaleString() : "--"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <GitFork className="size-3" aria-hidden="true" /> karma
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-zinc-900 mb-10" />

        {content && content.length > 100 ? (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-lg font-semibold text-white mb-3">SKILL.md</h2>
            <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-xs text-zinc-300 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="text-base font-semibold text-white mb-2">
              full SKILL.md lives at the source
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              we&apos;ve indexed the metadata for this skill but the body is
              fetched on demand. click &quot;view source&quot; above to read
              the canonical SKILL.md on {source}, or &quot;run inline in
              claude&quot; to apply it without leaving your session.
            </p>
            <Link
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:underline inline-flex items-center gap-1"
            >
              read on {source}
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="mt-10 text-sm text-zinc-500">
          <p>
            don&apos;t have the plugin yet?{" "}
            <Link href="/install" className="text-white hover:underline">
              install it
            </Link>{" "}
            then click &quot;run inline in claude&quot; again.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
