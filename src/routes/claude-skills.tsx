import { createFileRoute } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/ArticleLayout";
import source from "@/content/claude-skills.md?raw";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's the difference between Claude Skills and Claude Code Skills?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They're the same thing. 'Claude Skills' is the general term; 'Claude Code Skills' refers to using them inside the Claude Code CLI specifically. The SKILL.md format is identical in both.",
      },
    },
    {
      "@type": "Question",
      name: "Where do Claude Skills live on disk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "User-level skills live in ~/.claude/skills/. Project-level skills live in .claude/skills/ inside the repo. Both are auto-discovered.",
      },
    },
    {
      "@type": "Question",
      name: "Can I share a skill without giving someone access to my whole codebase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Either commit the skill to a public repo and share the path, or use a skill-graph host (like Implexa) that gives each skill its own shareable link.",
      },
    },
    {
      "@type": "Question",
      name: "Do Claude Skills work outside Claude Code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SKILL.md format is specific to Claude Code's loader. Claude Desktop and the Anthropic API don't auto-load skills the same way — you'd paste the contents into a system prompt or wrap them in an agent.",
      },
    },
    {
      "@type": "Question",
      name: "How is this different from MCP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCP (Model Context Protocol) is the protocol Claude uses to call external tools. Skills are the instructions for when and how to call them. A skill can use one or more MCP servers; an MCP server is useful even without skills.",
      },
    },
    {
      "@type": "Question",
      name: "What does Anthropic's Skill Creator plugin do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Skill Creator is Anthropic's official skill-authoring tool. It interviews you about a workflow, then generates a SKILL.md. It's a description-first approach. Implexa is a demonstration-first approach — you do the workflow once and the capture layer plus interview produce the skill.",
      },
    },
  ],
};

export const Route = createFileRoute("/claude-skills")({
  component: () => <ArticleLayout source={source} faqJsonLd={faqJsonLd} />,
  head: () => ({
    meta: [
      { title: "What Are Claude Skills? (And the Right Way to Build Them) — Implexa" },
      { name: "description", content: "Claude Skills are reusable instructions Claude loads on demand. Learn what they are, how they work, and why demonstrating a workflow beats describing it." },
      { property: "og:title", content: "What Are Claude Skills? (And the Right Way to Build Them)" },
      { property: "og:description", content: "Claude Skills are reusable instructions Claude loads on demand. Learn what they are, how they work, and why demonstrating a workflow beats describing it." },
      { property: "og:url", content: "https://implexa.ai/claude-skills" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://implexa.ai/claude-skills" }],
  }),
});
