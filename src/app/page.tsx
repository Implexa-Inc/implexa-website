import Link from "next/link";
import { TrendingUp, Sparkles, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import { TRENDING, FRESH, CATEGORIES } from "@/lib/placeholder-data";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* hero */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
              implexa
            </span>
          </div>
          <div className="mb-6">
            <SearchBar />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              href="#trending"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className:
                  "text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 px-3",
              })}
            >
              <TrendingUp className="size-3.5 mr-1.5" aria-hidden="true" />
              browse trending
            </Link>
            <Link
              href="/install"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className:
                  "text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 px-3",
              })}
            >
              <Download className="size-3.5 mr-1.5" aria-hidden="true" />
              install plugin
            </Link>
          </div>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            implexa watches you work and hands you{" "}
            <span className="text-white">the right skill at the right time</span>
            .
          </p>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* trending */}
        <section
          id="trending"
          className="mx-auto max-w-6xl px-4 sm:px-6 py-16"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              trending this week
            </h2>
            <span className="text-xs text-zinc-500">
              ranked by installs, last 7d
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRENDING.map((skill) => (
              <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
            ))}
          </div>
        </section>

        {/* categories */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">by category</h2>
            <span className="text-xs text-zinc-500">7 verticals, growing</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/c/${cat.slug}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-950 transition-colors"
              >
                <span className="text-sm text-white">{cat.label}</span>
                <Badge
                  variant="secondary"
                  className="bg-zinc-900 text-zinc-500 text-[10px] group-hover:bg-zinc-900"
                >
                  {cat.count}
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* freshly improved */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white inline-flex items-center gap-2">
              <Sparkles className="size-4 text-zinc-500" aria-hidden="true" />
              freshly improved
            </h2>
            <span className="text-xs text-zinc-500">
              merged contributions, last 14d
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FRESH.map((skill) => (
              <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
            ))}
          </div>
        </section>

        {/* closing pitch */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            stop downloading skills you'll never use
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            implexa runs alongside your claude code, codex, or cursor session.
            mid-task, the right skill surfaces. one tap to install and run.
          </p>
          <Link
            href="/install"
            className={buttonVariants({
              size: "lg",
              className:
                "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base",
            })}
          >
            install the plugin
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
