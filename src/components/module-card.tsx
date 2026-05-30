import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trustTierStyle, type TrustTier } from "@/lib/module-verification";

// ModuleCard — used in two places:
//   1. the modules rail on /s/[source]/[slug] (skills that declare modules)
//   2. the related-modules grid that could grow on /m later
//
// Mirrors SkillCard's structure: badge row up top, title + body below.
// Independent Link on the whole body so the card is a single click target.
export type ModuleCardData = {
  ecosystem: string;
  package: string;
  version_range?: string | null;
  license_spdx?: string | null;
  trust_tier?: TrustTier | null;
};

// Encodes the package segment for use in /m URLs. npm scoped packages
// contain "/" (e.g. "@stripe/stripe-node") which IS a valid URL path
// separator on this route — it maps to a catch-all `[...package]`
// segment, so we DON'T encodeURIComponent the slash itself. We only
// need to escape the "@" (which browsers tolerate raw but Next is
// stricter about) — and that's fine to leave as-is in practice.
function modulePath(ecosystem: string, pkg: string): string {
  return `/m/${ecosystem}/${pkg}`;
}

export function ModuleCard({ module: m }: { module: ModuleCardData }) {
  const trust = trustTierStyle(m.trust_tier);

  return (
    <Card className="h-full bg-zinc-950 border-zinc-900 hover:border-zinc-700 transition-colors">
      <Link
        href={modulePath(m.ecosystem, m.package)}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-xl"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
            >
              {m.ecosystem}
            </Badge>
            <span
              title={`trust tier: ${trust.label}`}
              className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] tabular-nums ${trust.className}`}
            >
              {trust.label}
            </span>
          </div>
          <CardTitle className="text-base font-medium text-white group-hover:text-zinc-100 break-all">
            {m.package}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            {m.version_range ? (
              <span className="font-mono">{m.version_range}</span>
            ) : null}
            {m.license_spdx ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-zinc-600">license</span>
                <span className="text-zinc-400">{m.license_spdx}</span>
              </span>
            ) : null}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
