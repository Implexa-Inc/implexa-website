import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/site";

// /privacy. Required for marketplace listings (Anthropic plugin store,
// future App Store, Chrome Web Store, etc.) and just generally good
// practice. v1 is the honest version: what we actually collect today,
// who we share with, how to reach us. Founder should run this past a
// real lawyer before any enterprise sale; for marketplace review it's
// substantively complete.
//
// Voice: lowercase headers, sentence-case body, no em-dashes (founder
// voice rule). Reads more like linear.app/privacy than a wall of legal
// boilerplate. Modern dev-friendly privacy policies use plain language;
// reviewers + users both benefit.
//
// LAST_UPDATED drives the metadata + the visible date stamp at the top
// of the page. Bump it any time the policy changes materially.

const LAST_UPDATED = "May 27, 2026";

export const metadata: Metadata = {
  title: "privacy policy",
  description:
    "what implexa collects, how we use it, who we share with, and how to get your data back. plain-english privacy policy, last updated " +
    LAST_UPDATED.toLowerCase() +
    ".",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    title: "privacy policy | implexa",
    description:
      "what implexa collects, how we use it, who we share with, and how to get your data back.",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-10"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          privacy policy
        </h1>
        <p className="text-sm text-zinc-500 mb-12">
          last updated {LAST_UPDATED.toLowerCase()}
        </p>

        {/* TL;DR — the 5-line version. Every modern privacy policy worth
            reading leads with the short version; reviewers + users both
            stop reading after this section, so it has to be honest. */}
        <Section title="the short version">
          <ul className="list-disc pl-6 space-y-2 text-zinc-300 leading-relaxed">
            <li>
              we collect what we need to run implexa: your email and name on
              signup, plus telemetry about how you use the plugin (tool
              calls, applied skills, outcomes).
            </li>
            <li>
              we do <strong className="text-white">not</strong> sell your
              data. ever.
            </li>
            <li>
              we do <strong className="text-white">not</strong> train AI
              models on your prompts.
            </li>
            <li>
              you can export or delete your data anytime. email{" "}
              <a
                href="mailto:founder@implexa.ai"
                className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300"
              >
                founder@implexa.ai
              </a>{" "}
              and we will respond within 30 days.
            </li>
            <li>
              questions? same email. we read everything.
            </li>
          </ul>
        </Section>

        <Section title="what we collect">
          <Subsection title="account information">
            <p>
              When you sign up at app.implexa.ai we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>email address (required for sign-in and transactional email)</li>
              <li>display name (optional, used in dashboard UI)</li>
              <li>
                authentication token (when you sign in via OAuth: google,
                github, or claude.ai)
              </li>
            </ul>
          </Subsection>

          <Subsection title="telemetry from the plugin">
            <p>When the implexa plugin runs in your Claude Code or Codex session, we record:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>which slash commands you invoke (e.g. /implexa:run)</li>
              <li>which skills you apply, and whether they succeed or fail</li>
              <li>
                an aggregated inventory of MCP servers you have installed
                (we use this to score skill compatibility)
              </li>
              <li>counts and timestamps of plugin activity</li>
            </ul>
            <p className="mt-3">
              We use this to rank skills via{" "}
              <Link
                href="/resources/skill-rank"
                className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300"
              >
                SkillRank
              </Link>
              , bill correctly (free vs paid), and debug issues you report.
            </p>
          </Subsection>

          <Subsection title="prompt context for skill recommendations">
            <p>
              When you submit a prompt in Claude Code with implexa active, the
              plugin sends the prompt text to our backend so we can recommend
              a matching skill. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                if we find a recommendation above our confidence threshold,
                the prompt is logged alongside the recommendation, keyed by
                an anonymized user identifier (a salted hash of your user
                id, not the email).
              </li>
              <li>
                if no recommendation matches, the prompt is discarded
                immediately and not persisted.
              </li>
              <li>
                we never use your prompts to train AI models. we never sell
                or share prompt content with third parties.
              </li>
            </ul>
          </Subsection>

          <Subsection title="work signatures (opt-in, off by default)">
            <p>
              You can optionally allow implexa to build a "work signature":
              an embedded representation of your work patterns across tools
              and skills over time. This signature improves recommendation
              quality, especially for ambiguous queries.
            </p>
            <p className="mt-3">
              Work signatures are <strong className="text-white">off by default</strong>.
              Email{" "}
              <a
                href="mailto:founder@implexa.ai"
                className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300"
              >
                founder@implexa.ai
              </a>{" "}
              to enable or disable.
            </p>
          </Subsection>
        </Section>

        <Section title="how we use your data">
          <p>We use the data we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>deliver the product (recommend skills, store your library, bill you)</li>
            <li>
              improve SkillRank, our cross-vendor skill ranking algorithm.
              Aggregate telemetry, never individual user lookup.
            </li>
            <li>debug issues you report to support</li>
            <li>
              send transactional emails (welcome, billing receipts, security
              alerts)
            </li>
          </ul>
          <p className="mt-4">
            We do <strong className="text-white">not</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>sell your data to anyone, ever</li>
            <li>train AI models on your prompts or skills</li>
            <li>send marketing emails without explicit opt-in</li>
            <li>
              share user-level data with Anthropic, OpenAI, or any other
              vendor unless required by law
            </li>
          </ul>
        </Section>

        <Section title="who we share data with (sub-processors)">
          <p>
            Implexa runs on a small number of trusted infrastructure vendors.
            Each receives the minimum data needed to deliver their service:
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border border-zinc-900 rounded">
              <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">vendor</th>
                  <th className="text-left px-4 py-3 font-medium">purpose</th>
                  <th className="text-left px-4 py-3 font-medium">what we share</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {SUBPROCESSORS.map((row) => (
                  <tr
                    key={row.vendor}
                    className="border-t border-zinc-900 hover:bg-zinc-950/50"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {row.vendor}
                    </td>
                    <td className="px-4 py-3">{row.purpose}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            We have data processing agreements with each. If we add a new
            sub-processor we will update this table and bump the last-updated
            date at the top of the page.
          </p>
        </Section>

        <Section title="data retention">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white">Account data</strong> (email,
              name): as long as your account is active. We delete within 30
              days of you closing your account.
            </li>
            <li>
              <strong className="text-white">Plugin telemetry</strong>{" "}
              (tool calls, applied skills, outcomes): retained for up to 12
              months to power SkillRank.
            </li>
            <li>
              <strong className="text-white">Prompts that triggered a recommendation</strong>:
              retained for up to 90 days, keyed by anonymized user id only.
            </li>
            <li>
              <strong className="text-white">Prompts that did not trigger a recommendation</strong>:
              not persisted to durable storage.
            </li>
            <li>
              <strong className="text-white">Backups</strong>: rolling 7-day
              window, then purged.
            </li>
          </ul>
        </Section>

        <Section title="your rights">
          <p>At any time you can ask us to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>show you all the data we have about you</li>
            <li>correct anything inaccurate</li>
            <li>delete your account and all associated data</li>
            <li>export your data in a portable format</li>
            <li>stop processing your data for product improvement</li>
            <li>opt out of telemetry or work-signature collection</li>
          </ul>
          <p className="mt-4">
            Email{" "}
            <a
              href="mailto:founder@implexa.ai"
              className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300"
            >
              founder@implexa.ai
            </a>{" "}
            to exercise any of these. We respond within 30 days.
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            If you are in the EU, UK, or California you have additional
            statutory rights under GDPR, UK GDPR, and CCPA respectively.
            The list above covers all of them.
          </p>
        </Section>

        <Section title="cookies and tracking">
          <p>We use cookies sparingly:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong className="text-white">essential cookies</strong> for
              authentication (sign-in state, session token)
            </li>
            <li>
              <strong className="text-white">Vercel Analytics</strong>:
              aggregate page views, no personal data, no third-party sharing
            </li>
            <li>
              <strong className="text-white">Vercel Speed Insights</strong>:
              aggregate Core Web Vitals from real visits, no personal data
            </li>
          </ul>
          <p className="mt-4">
            We do <strong className="text-white">not</strong> use third-party
            advertising cookies, social-media trackers, or session-replay
            tooling.
          </p>
        </Section>

        <Section title="children">
          <p>
            Implexa is not directed at children under 16. We do not knowingly
            collect data from minors. If you are a parent or guardian and
            think we have data on your child, email{" "}
            <a
              href="mailto:founder@implexa.ai"
              className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300"
            >
              founder@implexa.ai
            </a>{" "}
            and we will delete it within 7 days.
          </p>
        </Section>

        <Section title="international transfers">
          <p>
            Implexa is based in the United States. If you use the product from
            outside the US, your data is transferred to and processed in the
            US. For EU and UK users, this transfer relies on Standard
            Contractual Clauses (SCCs) approved by the European Commission.
          </p>
        </Section>

        <Section title="changes to this policy">
          <p>
            We update this page when something material changes. The
            last-updated date at the top reflects the most recent revision.
            If a change is significant (new sub-processor, expanded data
            collection, change in how we use your data) we will email you
            at least 14 days before it takes effect.
          </p>
        </Section>

        <Section title="contact">
          <p>
            One inbox for everything for now (privacy, security, general,
            press):
          </p>
          <p className="mt-3">
            <a
              href="mailto:founder@implexa.ai"
              className="text-white underline decoration-amber-400 decoration-2 underline-offset-2 hover:decoration-amber-300 text-lg"
            >
              founder@implexa.ai
            </a>
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            For security vulnerabilities please email the address above
            with the subject line starting <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-xs">[security]</code> so we route
            it before any other queue. Please do not file public GitHub
            issues for vulnerabilities.
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            Postal mail: Implexa Inc., contact via email above for current
            mailing address.
          </p>
        </Section>

        <div className="mt-16 pt-8 border-t border-zinc-900 text-xs text-zinc-500 leading-relaxed">
          <p>
            This privacy policy reflects how Implexa Inc. handles data as of{" "}
            {LAST_UPDATED.toLowerCase()}. It is not legal advice. If you have
            specific questions about how privacy law applies to you, please
            consult a qualified attorney.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

// Sub-processor table data. Keep alphabetized within tier (infrastructure
// first, then AI/data vendors, then ops). Update when we add or drop any
// vendor that touches user data, and bump the last-updated date above.
const SUBPROCESSORS: Array<{ vendor: string; purpose: string; shares: string }> = [
  {
    vendor: "Supabase",
    purpose: "database hosting (US)",
    shares: "account data, telemetry, skill content",
  },
  {
    vendor: "Vercel",
    purpose: "frontend hosting (US)",
    shares: "anonymized page views, request logs",
  },
  {
    vendor: "Fly.io",
    purpose: "backend hosting (US)",
    shares: "request logs, application data",
  },
  {
    vendor: "Anthropic",
    purpose: "LLM API for skill scoring and recommendations",
    shares: "skill content + prompt context only when needed for a single API call",
  },
  {
    vendor: "OpenAI",
    purpose: "embedding API for semantic search",
    shares: "skill content for embedding generation, not your prompts",
  },
  {
    vendor: "Stripe",
    purpose: "billing and payments",
    shares: "email, payment-method metadata (not card numbers)",
  },
  {
    vendor: "Resend",
    purpose: "transactional email delivery",
    shares: "email address, message body",
  },
  {
    vendor: "Cloudflare",
    purpose: "CDN, DNS, and DDoS protection",
    shares: "request metadata, IP address",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="text-zinc-300 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      <div className="text-zinc-300 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
