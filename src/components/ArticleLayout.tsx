import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleLayoutProps {
  source: string;
  faqJsonLd?: object;
}

function stripFrontmatter(src: string): string {
  if (src.startsWith("---")) {
    const end = src.indexOf("\n---", 3);
    if (end !== -1) return src.slice(end + 4).replace(/^\s*\n/, "");
  }
  return src;
}

export function ArticleLayout({ source, faqJsonLd }: ArticleLayoutProps) {
  const content = stripFrontmatter(source);

  return (
    <main className="min-h-screen bg-background text-ink-200">
      <header className="border-b border-ink-800/60">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-tight text-[var(--heading)]">
            Implexa
          </Link>
          <nav className="flex items-center gap-6 text-sm text-ink-300">
            <Link to="/claude-skills" className="hover:text-[var(--heading)]">Claude Skills</Link>
            <Link to="/contact" className="hover:text-[var(--heading)]">Contact</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="prose prose-invert max-w-none
          prose-headings:text-[var(--heading)] prose-headings:tracking-tight prose-headings:font-semibold
          prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-6 prose-h1:leading-tight
          prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-3
          prose-p:text-ink-200 prose-p:leading-relaxed
          prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[var(--heading)]
          prose-code:text-brand-400 prose-code:bg-ink-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
          prose-pre:bg-ink-900 prose-pre:border prose-pre:border-ink-800 prose-pre:rounded-lg prose-pre:text-ink-100
          prose-blockquote:border-l-brand-500 prose-blockquote:text-ink-300 prose-blockquote:not-italic
          prose-li:text-ink-200 prose-li:marker:text-ink-400
          prose-table:text-sm prose-th:text-[var(--heading)] prose-th:border-ink-700 prose-td:border-ink-800
          prose-hr:border-ink-800
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        <div className="mt-20 pt-8 border-t border-ink-800/60 text-sm">
          <Link to="/" className="text-ink-400 hover:text-[var(--heading)]">← Back home</Link>
        </div>
      </article>

      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </main>
  );
}
