import { createFileRoute } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/ArticleLayout";
import source from "@/content/what-is-a-skill-graph.md?raw";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's the difference between a skill graph and an agent skill?",
      acceptedAnswer: { "@type": "Answer", text: "An agent skill is a single workflow (one SKILL.md file). A skill graph is the structure that connects many skills together, including who authored them, who installed them, and which ones get chained." },
    },
    {
      "@type": "Question",
      name: "Is a skill graph the same as a knowledge graph?",
      acceptedAnswer: { "@type": "Answer", text: "No. A knowledge graph models facts and entities. A skill graph models executable workflows and the relationships between them." },
    },
    {
      "@type": "Question",
      name: "Can I share skills across teams in a skill graph?",
      acceptedAnswer: { "@type": "Answer", text: "Yes, modern skill graphs include sharing permissions (org-scoped, public, or share-link gated) so teams can fork and customize skills from each other." },
    },
    {
      "@type": "Question",
      name: "Which AI agents support skill graphs?",
      acceptedAnswer: { "@type": "Answer", text: "Claude Code, Cursor, Gemini CLI, Hermes, and 30+ others support the agentskills.io open standard. Skill graph platforms layer team semantics and attribution on top." },
    },
    {
      "@type": "Question",
      name: "How is skill graph different in HR tech vs AI?",
      acceptedAnswer: { "@type": "Answer", text: "In HR tech, nodes are employee capabilities. In AI, nodes are agent workflows. The graph topology and use cases (gap analysis, composition, recommendation) are nearly identical." },
    },
  ],
};

export const Route = createFileRoute("/resources/what-is-a-skill-graph")({
  component: () => <ArticleLayout source={source} faqJsonLd={faqJsonLd} />,
  head: () => ({
    meta: [
      { title: "What Is a Skill Graph? Definition, Examples, and How AI Teams Use Them — Implexa" },
      { name: "description", content: "A skill graph is a structured map of reusable workflows or capabilities that can be composed, shared, and measured. Used in AI agents and workforce planning." },
      { property: "og:title", content: "What Is a Skill Graph? Definition, Examples, and How AI Teams Use Them" },
      { property: "og:description", content: "A skill graph is a structured map of reusable workflows or capabilities that can be composed, shared, and measured. Used in AI agents and workforce planning." },
      { property: "og:url", content: "https://implexa.ai/resources/what-is-a-skill-graph" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://implexa.ai/resources/what-is-a-skill-graph" }],
  }),
});
