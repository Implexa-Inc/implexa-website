import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Star, GitFork, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type RouteParams = { handle: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { handle } = await props.params;
  return {
    title: `@${handle}`,
    description: `contributor profile for @${handle} on implexa. karma, authored skills, accepted contributions.`,
    alternates: { canonical: `/u/${handle}` },
    // Until the wiki layer ships real data (P3.2), keep contributor stubs
    // out of Google. They're empty placeholders and would dilute the
    // index. Flip robots back to index:true once the data lands.
    robots: { index: false, follow: true },
  };
}

export default async function ContributorPage(props: {
  params: Promise<RouteParams>;
}) {
  const { handle } = await props.params;
  // P3+ stub. wires to contributor_karma + skill authorship tables once
  // the wiki layer ships.
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

        <div className="flex items-center gap-4 mb-8">
          <div className="size-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-300">
            {handle.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              @{handle}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              contributor on implexa
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <Badge variant="outline" className="border-zinc-800 text-zinc-400">
            founding contributor
          </Badge>
          <Badge variant="outline" className="border-zinc-800 text-zinc-500">
            placeholder, P3 wiki not live yet
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
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
                <BookOpen className="size-3" aria-hidden="true" /> authored
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <GitFork className="size-3" aria-hidden="true" /> contributions
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-zinc-900 mb-10" />

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            authored skills
          </h2>
          <p className="text-sm text-zinc-500">
            wires up once P3.2 ships (skill_contributions + contributor_karma
            tables). see VISION.md website evolution map.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
