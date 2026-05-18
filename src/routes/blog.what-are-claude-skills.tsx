import { createFileRoute } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/ArticleLayout";
import source from "@/content/what-are-claude-skills.md?raw";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is a Claude Skill the same as a system prompt?",
      acceptedAnswer: { "@type": "Answer", text: "No. A system prompt applies to every message in a conversation. A skill is loaded only when its description matches a request — and unloaded after. You can have hundreds of skills installed without bloating every conversation." },
    },
    {
      "@type": "Question",
      name: "Do I need to write code to build a skill?",
      acceptedAnswer: { "@type": "Answer", text: "No. SKILL.md is plain Markdown. The procedure describes what tools to call, but Claude does the calling." },
    },
    {
      "@type": "Question",
      name: "Can a skill call other skills?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — a skill's procedure can reference another skill by name. Best practice is to keep skills focused on one workflow and compose them rather than building one mega-skill." },
    },
    {
      "@type": "Question",
      name: "Can I version-control skills?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Either commit the skill directory to a repo (project-level skills live in .claude/skills/), or use a skill-graph host that handles versioning for you." },
    },
    {
      "@type": "Question",
      name: "Do skills work in Claude Desktop or only in Claude Code?",
      acceptedAnswer: { "@type": "Answer", text: "The SKILL.md auto-loader is a Claude Code feature. Claude Desktop and the Anthropic API don't auto-discover skills the same way — you'd paste contents into a system prompt or wrap the skill in an agent." },
    },
    {
      "@type": "Question",
      name: "What's the relationship between Skills and MCP?",
      acceptedAnswer: { "@type": "Answer", text: "MCP (Model Context Protocol) is the protocol Claude uses to call external tools. Skills are the instructions for when and how to call them. A skill typically uses one or more MCP servers as its execution backend." },
    },
  ],
};

export const Route = createFileRoute("/blog/what-are-claude-skills")({
  component: () => <ArticleLayout source={source} faqJsonLd={faqJsonLd} />,
  head: () => ({
    meta: [
      { title: "What Are Claude Skills? (5-Minute Explainer) — Implexa" },
      { name: "description", content: "Claude Skills are reusable instruction packs Claude loads on demand. Here's what they are, what's inside a SKILL.md file, and how they compare to prompts." },
      { property: "og:title", content: "What Are Claude Skills? (5-Minute Explainer)" },
      { property: "og:description", content: "Claude Skills are reusable instruction packs Claude loads on demand. Here's what they are, what's inside a SKILL.md file, and how they compare to prompts." },
      { property: "og:url", content: "https://implexa.ai/blog/what-are-claude-skills" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://implexa.ai/blog/what-are-claude-skills" }],
  }),
});
