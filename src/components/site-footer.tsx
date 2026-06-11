import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-zinc-900 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-500">
          implexa · Agents that run your business, free on the Claude or Codex
          plan you already pay for
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
          <Link href="/workflows" className="hover:text-white transition-colors">
            Agents
          </Link>
          <Link
            href="/built-with-ai"
            className="hover:text-white transition-colors"
          >
            What next
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/resources" className="hover:text-white transition-colors">
            Resources
          </Link>
          {/* Kept in the footer (not the primary nav) so /scores and the skill
              pages it links to retain a site-wide internal link for SEO. */}
          <Link href="/scores" className="hover:text-white transition-colors">
            Skill rankings
          </Link>
          <Link href="/install" className="hover:text-white transition-colors">
            Install
          </Link>
          <Link
            href="/developers"
            className="hover:text-white transition-colors"
          >
            Developers
          </Link>
          <Link
            href="https://github.com/Implexa-Inc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/llms.txt"
            className="hover:text-white transition-colors"
          >
            llms.txt
          </Link>
          <Link
            href="https://x.com/ImplexaAI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            X / Twitter
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
