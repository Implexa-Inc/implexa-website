import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-zinc-900 bg-black/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
        >
          <span className="inline-block size-2 rounded-full bg-white" />
          implexa
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/install"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            install
          </Link>
          <Link
            href="https://github.com/Implexa-Inc"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </Link>
        </nav>
      </div>
    </header>
  );
}
