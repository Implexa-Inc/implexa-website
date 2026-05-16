import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Implexa" },
      {
        name: "description",
        content: "Get in touch with the Implexa team via email.",
      },
      { property: "og:title", content: "Contact — Implexa" },
      {
        property: "og:description",
        content: "Get in touch with the Implexa team via email.",
      },
    ],
  }),
});

function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--heading)] tracking-tight">
          Hey, glad you want to connect.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Feel free to reach out to us via email at{" "}
          <a
            href="mailto:founder@implexa.ai"
            className="text-[var(--heading)] underline underline-offset-4 hover:opacity-80"
          >
            founder@implexa.ai
          </a>
          .
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-[var(--heading)] transition-colors"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
