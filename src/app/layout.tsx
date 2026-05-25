import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://implexa.ai"),
  title: {
    default: "implexa, google + wikipedia for SKILL.md",
    template: "%s | implexa",
  },
  description:
    "cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time.",
  keywords: [
    "SKILL.md",
    "agentskills.io",
    "claude code skills",
    "codex skills",
    "cursor skills",
    "AI agent skills",
    "skill graph",
  ],
  openGraph: {
    type: "website",
    url: "https://implexa.ai",
    siteName: "implexa",
    title: "implexa, google + wikipedia for SKILL.md",
    description:
      "cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ImplexaAI",
    title: "implexa, google + wikipedia for SKILL.md",
    description:
      "cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
