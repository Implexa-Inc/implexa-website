import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck, AlertTriangle, Download, Package } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkillCard } from "@/components/skill-card";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";
import {
  jsonLdGraph,
  breadcrumbSchema,
  softwareSourceCodeSchema,
} from "@/lib/jsonld";
import {
  fetchModuleVerification,
  fetchPairedSkills,
  trustTierStyle,
  ecosystemLanguage,
  ecosystemRegistryUrl,
} from "@/lib/module-verification";

// /m/[ecosystem]/[...package] — the module detail page.
//
// Catch-all on the package segment because npm scoped packages contain a
// slash (e.g. /m/npm/@stripe/stripe-node). pypi/crates/rubygems packages
// arrive as a single-element array. We join with "/" to reconstruct the
// canonical package name before any backend call.
//
// ISR: 24h. Verification data is rebuilt by the backend's scheduled job;
// per-request freshness isn't useful and crawler traffic on these pages
// would otherwise eat function CPU.

type RouteParams = { ecosystem: string; package: string[] };

function packageNameFrom(segments: string[]): string {
  // Catch-all gives us an array. npm scoped packages are 2 segments,
  // everything else is 1. Join with "/" to get the canonical name.
  // Decode each segment in case the URL was percent-encoded en route.
  return segments.map((s) => decodeURIComponent(s)).join("/");
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { ecosystem, package: pkgSegments } = await props.params;
  const pkg = packageNameFrom(pkgSegments);
  const verification = await fetchModuleVerification(ecosystem, pkg);

  const titleBase = `${pkg} (${ecosystem})`;
  const trustWord = verification?.trust_tier ?? "indexed";
  const description = verification
    ? `${pkg} on ${ecosystem}, ${trustWord} by implexa. ${verification.license_spdx ?? "license unknown"}${
        typeof verification.downloads_30d === "number"
          ? ` · ${verification.downloads_30d.toLocaleString()} downloads / 30d`
          : ""
      }${
        verification.osv_count
          ? ` · ${verification.osv_count} known vulnerabilit${verification.osv_count === 1 ? "y" : "ies"}`
          : ""
      }.`
    : `${pkg} on ${ecosystem}. verified module page on implexa.`;

  // Canonical = /m/<ecosystem>/<pkg>. Keep the literal pkg (slash included)
  // so npm scoped packages canonicalize to the URL the user actually visits.
  const canonicalPath = `/m/${ecosystem}/${pkg}`;

  return {
    title: titleBase,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: !!verification, follow: true },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonicalPath),
      title: `${titleBase} | implexa`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleBase} | implexa`,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

// Small reusable signal-row. Keeps the verification card scan-able: each
// piece of evidence on its own row with a label, value, and (optional)
// outbound link.
function SignalRow({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  href?: string | null;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-amber-300"
        : "text-white";
  const valueNode = href ? (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${toneClass} hover:underline inline-flex items-center gap-1`}
    >
      {value}
      <ExternalLink className="size-3 opacity-60" aria-hidden="true" />
    </Link>
  ) : (
    <span className={toneClass}>{value}</span>
  );
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-900 last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className="text-sm tabular-nums">{valueNode}</span>
    </div>
  );
}

export default async function ModuleDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { ecosystem, package: pkgSegments } = await props.params;
  const pkg = packageNameFrom(pkgSegments);

  // Verification + paired skills are independent; run in parallel so a slow
  // backend on one path doesn't compound onto the other.
  const [verification, paired] = await Promise.all([
    fetchModuleVerification(ecosystem, pkg),
    fetchPairedSkills(ecosystem, pkg),
  ]);

  if (!verification) {
    notFound();
  }

  const trust = trustTierStyle(verification.trust_tier);
  const registryUrl = ecosystemRegistryUrl(ecosystem, pkg);
  const language = ecosystemLanguage(ecosystem);

  // SoftwareSourceCode JSON-LD. Per schema.org, this is the right type for
  // a package/library detail page (vs SoftwareApplication, which we use
  // for skills and is for end-user-runnable apps). Built via the shared
  // jsonld helper so every package surface emits the same node shape, then
  // composed with a BreadcrumbList so crawlers see the route hierarchy.
  // license_spdx (an SPDX id) resolves to a canonical spdx.org URL inside
  // the helper; we fall back to license_url when no SPDX id is known.
  const sourceCodeSchema = softwareSourceCodeSchema({
    name: pkg,
    url: absoluteUrl(`/m/${ecosystem}/${pkg}`),
    programmingLanguage: language,
    version: verification.latest_version ?? verification.version_range ?? undefined,
    license: verification.license_spdx ?? verification.license_url ?? undefined,
    codeRepository: verification.source_url ?? undefined,
    author: verification.author ? { name: verification.author } : undefined,
    registryUrl: registryUrl ?? undefined,
  });

  const ldJson = jsonLdGraph(
    sourceCodeSchema,
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "modules", url: absoluteUrl("/search?type=module") },
      { name: ecosystem, url: absoluteUrl(`/m/${ecosystem}`) },
      { name: pkg, url: absoluteUrl(`/m/${ecosystem}/${pkg}`) },
    ]),
  );

  const editorial = verification.editorial;
  const hasEditorial =
    editorial &&
    (editorial.pick_summary || editorial.why || editorial.caveats);

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

        {/* header — ecosystem chip + trust tier + version range */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
          >
            <Package className="size-3 mr-1" aria-hidden="true" />
            {ecosystem}
          </Badge>
          <span
            title={`trust tier: ${trust.label}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${trust.className}`}
          >
            <ShieldCheck className="size-3" aria-hidden="true" />
            {trust.label}
          </span>
          {verification.version_range ? (
            <span className="text-[10px] uppercase tracking-wider border border-zinc-800 text-zinc-400 rounded-full px-2.5 py-0.5 font-mono">
              {verification.version_range}
            </span>
          ) : null}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3 break-all">
          {pkg}
        </h1>
        {verification.trust_detail ? (
          <p className="text-base text-zinc-400 max-w-2xl mb-8">
            {verification.trust_detail}
          </p>
        ) : null}

        <div className="flex flex-wrap items-start gap-3 mb-10">
          {registryUrl ? (
            <Link
              href={registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-md px-4 py-2 transition-colors"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              view on {ecosystem}
            </Link>
          ) : null}
          {verification.source_url ? (
            <Link
              href={verification.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-md px-4 py-2 transition-colors"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              source repo
            </Link>
          ) : null}
        </div>

        {/* verification card */}
        <Card className="bg-zinc-950 border-zinc-900 mb-10">
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                verification card
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                signals
              </span>
            </div>

            {verification.license_spdx ? (
              <SignalRow
                label="license"
                value={verification.license_spdx}
                href={verification.license_url}
              />
            ) : null}

            <SignalRow
              label="sigstore"
              value={
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] ${trust.className}`}
                  >
                    {trust.label}
                  </span>
                </span>
              }
              tone={
                verification.trust_tier === "signed"
                  ? "good"
                  : verification.trust_tier === "unverified"
                    ? "warn"
                    : "default"
              }
            />

            {typeof verification.downloads_30d === "number" ? (
              <SignalRow
                label="downloads / 30d"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="size-3 opacity-60" aria-hidden="true" />
                    {verification.downloads_30d.toLocaleString()}
                  </span>
                }
              />
            ) : null}

            {typeof verification.scorecard === "number" ? (
              <SignalRow
                label="openssf scorecard"
                value={`${verification.scorecard.toFixed(1)} / 10`}
                href={verification.scorecard_url}
                tone={
                  verification.scorecard >= 8
                    ? "good"
                    : verification.scorecard >= 5
                      ? "default"
                      : "warn"
                }
              />
            ) : null}

            <SignalRow
              label="known vulnerabilities (osv)"
              value={
                verification.osv_count && verification.osv_count > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle
                      className="size-3 opacity-60"
                      aria-hidden="true"
                    />
                    {verification.osv_count}
                  </span>
                ) : (
                  "none"
                )
              }
              tone={
                verification.osv_count && verification.osv_count > 0
                  ? "warn"
                  : "good"
              }
            />

            {verification.osv_top && verification.osv_top.length > 0 ? (
              <div className="pt-3 mt-1 border-t border-zinc-900">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                  top advisories
                </div>
                <ul className="space-y-1.5">
                  {verification.osv_top.slice(0, 3).map((v) => (
                    <li
                      key={v.id}
                      className="text-xs text-zinc-400 flex items-start gap-2"
                    >
                      <span className="font-mono text-zinc-500 shrink-0">
                        {v.id}
                      </span>
                      {v.severity ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider border-amber-900 text-amber-300"
                        >
                          {v.severity}
                        </Badge>
                      ) : null}
                      {v.summary ? <span>{v.summary}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* editorial section. Hidden when the backend has no curated text
            for this module. Wirecutter-shape: pick → why → caveats. */}
        {hasEditorial && editorial ? (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                implexa pick
              </h2>
              {editorial.curated_by ? (
                <span className="text-xs text-zinc-500">
                  curated by {editorial.curated_by}
                </span>
              ) : null}
            </div>
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 space-y-4">
              {editorial.pick_summary ? (
                <p className="text-base text-zinc-200 leading-relaxed">
                  {editorial.pick_summary}
                </p>
              ) : null}
              {editorial.why ? (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                    why
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {editorial.why}
                  </p>
                </div>
              ) : null}
              {editorial.caveats ? (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                    caveats
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {editorial.caveats}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* paired skills rail. The point of the module page: from a verified
            module, you can jump straight to the skills that wrap it. */}
        {paired.length > 0 ? (
          <section className="mt-12">
            <Separator className="bg-zinc-900 mb-10" />
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                paired skills
              </h2>
              <span className="text-xs text-zinc-500">
                implexa skills that declare this module
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paired.map((p) => (
                <SkillCard
                  key={`${p.source}/${p.slug}`}
                  skill={{
                    slug: p.slug,
                    source: p.source,
                    title: p.name ?? p.slug.replace(/-/g, " "),
                    description: (p.description ?? "").slice(0, 200),
                    author: p.author ?? p.source,
                    tag: "module pair",
                    score: p.display_score ?? undefined,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* footer — verified_at + report-an-issue link */}
        <div className="mt-16 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            {verification.verified_at ? (
              <>
                verified{" "}
                <time dateTime={verification.verified_at}>
                  {new Date(verification.verified_at).toISOString().slice(0, 10)}
                </time>
              </>
            ) : (
              <>verified by implexa</>
            )}
          </div>
          <Link
            href={`https://github.com/Implexa-Inc/implexa-backend/issues/new?title=${encodeURIComponent(
              `[module] ${ecosystem}/${pkg}`,
            )}&labels=module-verification`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
          >
            report an issue
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}

// Pin the ISR window to 24h. Mirrors the per-fetch revalidate inside the MCP
// wrappers; declaring it at the route level documents intent at a glance.
// Must be a literal: Next's segment-config analyzer rejects a referenced const.
export const revalidate = 86400;
