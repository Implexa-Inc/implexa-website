import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";

// /contact. Deliberately simple: no form, no backend handler. v1 is just
// an email address + a few alternate channels. We restored this route
// because it had google indexing pre-Lovable-archive; the path is the
// commitment, the content is intentionally light.

const FOUNDER_EMAIL = "founder@implexa.ai";
const HELLO_EMAIL = "hello@implexa.ai";

export const metadata: Metadata = {
  title: "contact",
  description:
    "get in touch with the implexa team. founder@implexa.ai for direct, hello@implexa.ai for general, or open an issue on github.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact"),
    title: "contact | implexa",
    description:
      "get in touch with the implexa team via email or github.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-10"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
          contact
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed mb-12 max-w-xl">
          hey, glad you want to connect. pick whichever channel fits, we
          answer all three.
        </p>

        <div className="space-y-4">
          {/* founder line */}
          <a
            href={`mailto:${FOUNDER_EMAIL}`}
            className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center">
                <Mail className="size-3.5 text-amber-400" aria-hidden="true" />
              </div>
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                founder
              </span>
            </div>
            <div className="text-base font-medium text-white mb-1 group-hover:underline decoration-zinc-600">
              {FOUNDER_EMAIL}
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              fastest path for product feedback, partnerships, or enterprise
              questions. lands directly with the founder.
            </p>
          </a>

          {/* general inbox */}
          <a
            href={`mailto:${HELLO_EMAIL}`}
            className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="size-7 rounded-md bg-emerald-500/10 border border-emerald-900/40 inline-flex items-center justify-center">
                <Mail
                  className="size-3.5 text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                general
              </span>
            </div>
            <div className="text-base font-medium text-white mb-1 group-hover:underline decoration-zinc-600">
              {HELLO_EMAIL}
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              press, hiring, anything else. answered same week.
            </p>
          </a>

          {/* github */}
          <a
            href="https://github.com/Implexa-Inc"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="size-7 rounded-md bg-zinc-900 border border-zinc-800 inline-flex items-center justify-center">
                <MessageCircle
                  className="size-3.5 text-zinc-400"
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                bugs + open source
              </span>
            </div>
            <div className="text-base font-medium text-white mb-1 group-hover:underline decoration-zinc-600">
              github.com/Implexa-Inc
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              file an issue on the plugin repo. fastest path for reproducible
              bugs.
            </p>
          </a>
        </div>

        <p className="text-sm text-zinc-500 mt-12 leading-relaxed">
          curious before you reach out?{" "}
          <Link href="/" className="text-white hover:underline">
            search the index
          </Link>{" "}
          or{" "}
          <Link href="/install" className="text-white hover:underline">
            install the plugin
          </Link>
          . both are free and don&apos;t require an account.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
