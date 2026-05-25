import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  TWITTER_HANDLE,
} from "@/lib/site";
import { jsonLdGraph, organizationSchema, websiteSchema } from "@/lib/jsonld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "SKILL.md",
    "agentskills.io",
    "claude code skills",
    "codex skills",
    "cursor skills",
    "AI agent skills",
    "skill graph",
  ],
  // Default canonical → homepage. Individual pages override with their own
  // alternates.canonical so deep pages don't all canonicalize to /.
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/resources/feed.xml", title: "implexa resources" },
      ],
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  // Site-level verification meta tags for search engines. Founder sets the
  // codes in Vercel env once after running GSC + Bing onboarding. Empty
  // values are omitted from the rendered HTML by Next.js.
  verification: {
    google: process.env.GSC_VERIFICATION_CODE || undefined,
    other: process.env.BING_VERIFICATION_CODE
      ? { "msvalidate.01": process.env.BING_VERIFICATION_CODE }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

// Site-wide JSON-LD: Organization + WebSite + SearchAction. Stays in <body>
// at the bottom of the page so it doesn't block first paint. Crawlers parse
// JSON-LD wherever it lives in the document.
const SITE_LD_JSON = jsonLdGraph(organizationSchema(), websiteSchema());

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
        <script
          type="application/ld+json"
          // The JSON is built at module-eval time from constants. No user
          // input flows in, so dangerouslySetInnerHTML is safe here.
          dangerouslySetInnerHTML={{ __html: SITE_LD_JSON }}
        />
      </body>
    </html>
  );
}
