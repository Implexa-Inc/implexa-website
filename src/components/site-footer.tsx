import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-zinc-900 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-500">
          implexa · whole-job workflows, built from skills ranked by{" "}
          <Link
            href="/resources/skill-rank"
            className="text-zinc-300 hover:text-amber-300 transition-colors underline decoration-amber-400/40 decoration-1 underline-offset-2"
          >
            SkillRank
          </Link>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
          <Link href="/workflows" className="hover:text-white transition-colors">
            workflows
          </Link>
          <Link href="/scores" className="hover:text-white transition-colors">
            top skills
          </Link>
          <Link href="/resources" className="hover:text-white transition-colors">
            resources
          </Link>
          <Link href="/install" className="hover:text-white transition-colors">
            install
          </Link>
          <Link
            href="/developers"
            className="hover:text-white transition-colors"
          >
            developers
          </Link>
          <Link
            href="https://github.com/Implexa-Inc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            github
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
            x / twitter
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
