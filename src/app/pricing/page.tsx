import Link from "next/link";
import type { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";

const DASHBOARD_URL = "https://app.implexa.ai";

// Free / Pro / Enterprise feature lists. Single source of truth here; the
// dashboard's /pricing page mirrors these for the authenticated checkout flow.
const FREE_FEATURES = [
  "unlimited search across 19,300+ skills",
  "unlimited inline-apply (no download, runs in your chat)",
  "ambient recommender (watches your work, surfaces skills mid-task)",
  "works in claude code, codex, cursor, gemini",
  "privacy-by-discard (prompts that don't match are never logged)",
  "5 personal skill captures / month + unlimited runs",
  "fork any base playbook into your library",
  "public sharing for founding creator status (free pro for life)",
];

const PRO_FEATURES = [
  "everything in free, plus:",
  "work-signature opt-in for 3x better recommendations (SkillRank)",
  "unlimited skill captures (free is 5/mo)",
  "org-wide skill library: every teammate sees what's been saved",
  "skill ROI dashboard: which skills drive real outcomes",
  "outcome attribution from CRM / ATS / calendar",
  "SSO (Google / Microsoft)",
  "unlimited team members on the same workspace",
  "priority email support",
];

const ENTERPRISE_FEATURES = [
  "everything in pro, plus:",
  "SAML SSO + custom identity providers",
  "full audit log",
  "compliance + security review documentation",
  "white-label share pages with your branding",
  "custom integrations + dedicated MCP server hosting",
  "dedicated success manager",
  "on-prem deployment option",
];

export const metadata: Metadata = {
  title: "pricing",
  description:
    "implexa pricing: free forever for unlimited cross-vendor search + inline-apply. pro $19/mo for SkillRank work-signature recommendations + org library. enterprise custom.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/pricing"),
    title: "pricing | implexa",
    description:
      "free forever for cross-vendor skill search + inline-apply. pro for SkillRank + org library.",
    images: [DEFAULT_OG_IMAGE],
  },
};

function jsonLdOffers(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Offer",
        "@id": absoluteUrl("/pricing#free"),
        "name": "Implexa Free",
        "price": "0",
        "priceCurrency": "USD",
        "category": "free",
        "url": `${DASHBOARD_URL}/signup?plan=free`,
        "itemOffered": {
          "@type": "Service",
          "name": "Implexa Free",
          "description": "Unlimited cross-vendor skill search + inline-apply across Claude Code, Codex, Cursor, Gemini CLI.",
        },
      },
      {
        "@type": "Offer",
        "@id": absoluteUrl("/pricing#pro"),
        "name": "Implexa Pro",
        "price": "19",
        "priceCurrency": "USD",
        "category": "subscription",
        "url": `${DASHBOARD_URL}/signup?plan=pro`,
        "itemOffered": {
          "@type": "Service",
          "name": "Implexa Pro",
          "description": "SkillRank work-signature recommendations + org library + outcome attribution.",
        },
      },
      {
        "@type": "Offer",
        "@id": absoluteUrl("/pricing#enterprise"),
        "name": "Implexa Enterprise",
        "url": absoluteUrl("/pricing#enterprise"),
        "category": "custom",
        "itemOffered": {
          "@type": "Service",
          "name": "Implexa Enterprise",
          "description": "SSO + audit log + custom integrations + on-prem option + dedicated CSM.",
        },
      },
    ],
  });
}

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-16">
        {/* hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            free forever for unlimited cross-vendor search + inline-apply. pro
            for the SkillRank cohort matching + org library. team and enterprise
            for org-tier needs.
          </p>
        </section>

        {/* tier cards */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* free */}
          <div
            id="free"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">free</h2>
              <p className="text-sm text-zinc-500">forever</p>
              <div className="mt-3 text-3xl font-semibold text-white">$0</div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed"
                >
                  <Check
                    className="size-4 text-zinc-500 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`${DASHBOARD_URL}/signup?plan=free`}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-zinc-700 text-white hover:bg-zinc-900 hover:text-white h-11 w-full",
              })}
            >
              start free
            </Link>
          </div>

          {/* pro — highlighted */}
          <div
            id="pro"
            className="rounded-lg border border-zinc-700 bg-zinc-950 p-6 flex flex-col relative shadow-2xl"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="size-3" aria-hidden="true" />
              most popular
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">pro</h2>
              <p className="text-sm text-zinc-500">per seat / month</p>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-3xl font-semibold text-white">$15.83</div>
                <div className="text-sm text-zinc-500">/mo billed annually</div>
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                or $19 / month billed monthly
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li
                  key={f}
                  className={`flex items-start gap-2 text-sm leading-relaxed ${
                    i === 0
                      ? "text-zinc-500 italic"
                      : "text-zinc-200"
                  }`}
                >
                  {i === 0 ? null : (
                    <Check
                      className="size-4 text-emerald-400 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`${DASHBOARD_URL}/signup?plan=pro`}
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-white text-black hover:bg-zinc-200 h-11 w-full font-medium",
              })}
            >
              start pro
            </Link>
          </div>

          {/* enterprise */}
          <div
            id="enterprise"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">
                enterprise
              </h2>
              <p className="text-sm text-zinc-500">custom</p>
              <div className="mt-3 text-3xl font-semibold text-white">
                let&apos;s talk
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {ENTERPRISE_FEATURES.map((f, i) => (
                <li
                  key={f}
                  className={`flex items-start gap-2 text-sm leading-relaxed ${
                    i === 0 ? "text-zinc-500 italic" : "text-zinc-300"
                  }`}
                >
                  {i === 0 ? null : (
                    <Check
                      className="size-4 text-zinc-500 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="mailto:founder@implexa.ai?subject=Implexa%20Enterprise%20inquiry"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-zinc-700 text-white hover:bg-zinc-900 hover:text-white h-11 w-full",
              })}
            >
              contact sales
            </Link>
          </div>
        </section>

        {/* founding creator callout */}
        <section className="mt-16 rounded-lg border border-emerald-900/50 bg-zinc-950 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2 inline-flex items-center gap-2">
            🏆 founding creator
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-4">
            publish a skill that earns 50+ runs on implexa and you get pro for
            life, free. the bootstrap incentive: power users who make implexa
            useful get rewarded with material value, not just karma.
          </p>
          <Link
            href={`${DASHBOARD_URL}/signup`}
            className="text-sm text-white hover:underline"
          >
            start publishing -&gt;
          </Link>
        </section>

        {/* faq */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">
            common questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                what counts as an inline-apply?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                when implexa surfaces a skill recommendation and you say
                &quot;yes apply,&quot; the SKILL.md gets injected into your
                claude session and runs inline. unlimited on every tier.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                what makes pro better than free?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                pro unlocks work-signature opt-in: implexa learns your
                personal patterns + cohort matches you against similar users.
                rec quality goes up ~3x over time. plus unlimited captures and
                org library.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                can i try pro before paying?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                yes. all pro features have a 14-day trial when you start. no
                card required to start free.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                what about the data you collect?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                privacy-by-discard is the default everywhere. prompts that
                don&apos;t match a skill are never logged. work-signature data
                is opt-in only on pro, with monthly salt rotation and 90-day
                auto-expiry.
              </p>
            </div>
          </div>

          {/* read-more link to the developer-flavored tutorial — closes the
              loop for engineers who land on pricing and want to see what
              authoring a skill actually looks like before buying in. */}
          <p className="text-sm text-zinc-500 text-center mt-10">
            <Link
              href="/blog/how-to-create-a-claude-skill"
              className="text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-white"
            >
              read more: how to create a claude skill (step-by-step)
            </Link>
          </p>
        </section>

        {/* json-ld */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdOffers() }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
