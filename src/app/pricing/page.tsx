import Link from "next/link";
import type { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";

const DASHBOARD_URL = "https://app.implexa.ai";

// Free / Team / Enterprise. Single source of truth here; the dashboard's
// /pricing page mirrors these. The model follows the locked vision: the whole
// single-person product is FREE (your agents run on the Claude or Codex plan you
// already pay for, so there is no inference for us to resell or meter). We make
// money on teams and, later, enterprise, never on a solo user's agents.
const FREE_FEATURES = [
  "Build unlimited agents in plain language",
  "They run in your own Claude or Codex, as you, on your real data",
  "Put any agent on a schedule: hourly, daily, weekly",
  "One dashboard for every agent, every run, every result",
  "We never touch your accounts, passwords, or the contents of your work",
  "No second AI bill and no per-run metering, ever",
];

// Team price is a working number - confirm before a public push.
const TEAM_FEATURES = [
  "Everything in Free, plus:",
  "Shared agent library: build once, the whole team can run it",
  "Every teammate's runs and results in one place",
  "Shared connections and a team-wide \"needs you\"",
  "Roles: who can build, who can run",
  "Priority support",
];

const ENTERPRISE_FEATURES = [
  "Everything in Team, plus:",
  "SSO / SAML + SCIM provisioning",
  "Audit log and data-retention controls",
  "Self-host / on-prem option",
  "Security review and compliance documentation",
  "Dedicated support with an SLA",
];

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Implexa is free for one person, forever: build, run, and manage unlimited agents on the Claude or Codex plan you already pay for. Team for shared agents across a workspace. Enterprise for SSO, audit, and on-prem.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/pricing"),
    title: "Pricing | Implexa",
    description:
      "Free forever for one person: unlimited agents on your own Claude or Codex plan. Team for shared agents. Enterprise for SSO + on-prem.",
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
          "description":
            "Build, run, schedule, and manage unlimited agents inside your own Claude Code or Codex. Free forever for one person.",
        },
      },
      {
        "@type": "Offer",
        "@id": absoluteUrl("/pricing#team"),
        "name": "Implexa Team",
        "price": "20",
        "priceCurrency": "USD",
        "category": "subscription",
        "url": `${DASHBOARD_URL}/signup?plan=team`,
        "itemOffered": {
          "@type": "Service",
          "name": "Implexa Team",
          "description":
            "A shared agent library, shared runs and results, and roles for a small team running agents together.",
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
          "description":
            "SSO/SAML, audit log, self-host, security review, and dedicated support for companies.",
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
            Free for you. Priced for your team.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The whole single-person product is free, forever. Your agents run on
            the Claude or Codex plan you already pay for, so there is no AI bill
            for us to resell and nothing to meter. You only pay when a team needs
            to run agents together.
          </p>
        </section>

        {/* tier cards */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* free - the headline tier */}
          <div
            id="free"
            className="rounded-lg border border-zinc-700 bg-zinc-950 p-6 flex flex-col relative shadow-2xl"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="size-3" aria-hidden="true" />
              For one person
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Free</h2>
              <p className="text-sm text-zinc-500">Forever</p>
              <div className="mt-3 text-3xl font-semibold text-white">$0</div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-zinc-200 leading-relaxed"
                >
                  <Check
                    className="size-4 text-emerald-400 mt-0.5 shrink-0"
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
                className:
                  "bg-white text-black hover:bg-zinc-200 h-11 w-full font-medium",
              })}
            >
              Start free
            </Link>
          </div>

          {/* team */}
          <div
            id="team"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Team</h2>
              <p className="text-sm text-zinc-500">per seat / month</p>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-3xl font-semibold text-white">$20</div>
                <div className="text-sm text-zinc-500">/ seat / month</div>
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {TEAM_FEATURES.map((f, i) => (
                <li
                  key={f}
                  className={`flex items-start gap-2 text-sm leading-relaxed ${
                    i === 0 ? "text-zinc-500 italic" : "text-zinc-200"
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
              href={`${DASHBOARD_URL}/signup?plan=team`}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-zinc-700 text-white hover:bg-zinc-900 hover:text-white h-11 w-full",
              })}
            >
              Start a team
            </Link>
          </div>

          {/* enterprise */}
          <div
            id="enterprise"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">
                Enterprise
              </h2>
              <p className="text-sm text-zinc-500">Custom</p>
              <div className="mt-3 text-3xl font-semibold text-white">
                Let&apos;s talk
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
              Contact sales
            </Link>
          </div>
        </section>

        {/* the why-free reassurance (replaces the old skill-publishing callout) */}
        <section className="mt-16 rounded-lg border border-emerald-900/50 bg-zinc-950 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Why free is not a trial
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Your Claude or Codex plan can run agents all day, but you only touch
            it when you sit down to chat. Implexa puts the rest of it to work.
            Everyone else resells you lab APIs at a markup and meters every run.
            We never run the AI ourselves, so a single person&apos;s agents cost
            us almost nothing, and they stay free.
          </p>
          <Link
            href={`${DASHBOARD_URL}/signup?plan=free`}
            className="text-sm text-white hover:underline"
          >
            Start building, free &rarr;
          </Link>
        </section>

        {/* faq */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">
            Common questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                Is it really free?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Yes. Your agents run on the Claude or Codex subscription you
                already pay for, so there is no inference for us to resell or
                meter. The single-person product is free forever, no card to
                start.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                How does it run on my own Claude or Codex?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Implexa installs a small plugin into your Claude Code or Codex.
                Your agents run there, as you, on your data. We are the control
                plane: we build, schedule, and show results. We never run the AI
                ourselves.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                Do you see my data or credentials?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                No. Implexa never touches your accounts, passwords, or the
                contents of your work. Agents act with the access you already
                have, on your own machine.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-white mb-2">
                When would I need Team?
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When more than one person needs to build, run, or see the same
                agents. Free is per person. Team shares the agent library, the
                runs, and the connections across a workspace.
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-500 text-center mt-10">
            <Link
              href="/install"
              className="text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-white"
            >
              See how to connect Claude or Codex in two minutes &rarr;
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
