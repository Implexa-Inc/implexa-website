import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-zinc-900 bg-black/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center"
          aria-label="implexa home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/implexa-logo.svg"
            alt="implexa"
            className="h-7 w-auto"
            width={120}
            height={32}
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/workflows"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            Agents
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
          >
            Resources
          </Link>
          <Link
            href="/install"
            className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
          >
            Install
          </Link>
          <Link
            href="https://app.implexa.ai/login"
            className="ml-2 px-3 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="https://app.implexa.ai/signup"
            className="px-3 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 font-medium transition-colors"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
