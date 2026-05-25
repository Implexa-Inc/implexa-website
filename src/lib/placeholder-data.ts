// placeholder content. real data lands when /api/search is wired to the
// aggregated_skills index in the implexa backend.

export type SkillCard = {
  slug: string;
  source: string;
  title: string;
  description: string;
  author: string;
  tag: string;
};

export const TRENDING: SkillCard[] = [
  {
    slug: "hubspot-outbound-sync-via-mcp",
    source: "anthropic",
    title: "hubspot outbound sync via mcp",
    description:
      "wire hubspot api to your outbound sequences in 4 steps. handles auth, contact upsert, and sequence enrollment.",
    author: "rabgpt",
    tag: "sales",
  },
  {
    slug: "next-router-codemod",
    source: "anthropic",
    title: "next router codemod",
    description:
      "migrate a pages-router codebase to app-router with one command. covers data fetching, layouts, and dynamic routes.",
    author: "founder-implexa",
    tag: "dev",
  },
  {
    slug: "discord-channel-digest",
    source: "smithery",
    title: "discord channel digest",
    description:
      "daily summary of any discord channel. highlights threads worth your time, drops noise.",
    author: "smithery-community",
    tag: "ops",
  },
];

export const FRESH: SkillCard[] = [
  {
    slug: "salesforce-to-hubspot-sequence-import",
    source: "clawhub",
    title: "salesforce to hubspot sequence import",
    description:
      "cleanly port salesforce cadences to hubspot sequences without losing step timing or branching.",
    author: "rabgpt",
    tag: "sales",
  },
  {
    slug: "supabase-rls-audit",
    source: "skills-sh",
    title: "supabase rls audit",
    description:
      "scan every supabase policy in your project and flag tables exposed without row-level security.",
    author: "skills-sh-community",
    tag: "dev",
  },
  {
    slug: "loom-to-blog-post",
    source: "anthropic",
    title: "loom to blog post",
    description:
      "transcribe a loom, rewrite into a blog-ready draft, and ship to your CMS as a PR.",
    author: "anthropic",
    tag: "content",
  },
];

export const CATEGORIES = [
  { slug: "sales", label: "sales", count: "2.1k skills" },
  { slug: "dev", label: "dev", count: "18.4k skills" },
  { slug: "content", label: "content", count: "4.7k skills" },
  { slug: "recruiting", label: "recruiting", count: "890 skills" },
  { slug: "finance", label: "finance", count: "1.3k skills" },
  { slug: "ops", label: "ops", count: "3.2k skills" },
];
