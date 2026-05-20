import { createFileRoute } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/ArticleLayout";
import source from "@/content/what-is-a-skill-graph.md?raw";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "What Is a Skill Graph?",
      description:
        "A skill graph is a structured map of reusable workflows or capabilities, plus the relationships between them, that can be composed, shared, attributed, and improved over time.",
      author: { "@type": "Organization", name: "Implexa Team", url: "https://implexa.ai" },
      datePublished: "2026-05-20",
      publisher: {
        "@type": "Organization",
        name: "Implexa",
        url: "https://implexa.ai",
        logo: { "@type": "ImageObject", url: "https://implexa.ai/logo.png" },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://implexa.ai/resources/what-is-a-skill-graph",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What's the difference between a skill graph and an agent skill?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An agent skill is a single workflow (one SKILL.md file). A skill graph is the structure that connects many skills together, including who authored them, who installed them, and which ones get chained.",
          },
        },
        {
          "@type": "Question",
          name: "Is a skill graph the same as a knowledge graph?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. A knowledge graph models facts and entities. A skill graph models executable workflows and the relationships between them.",
          },
        },
        {
          "@type": "Question",
          name: "Can I share skills across teams in a skill graph?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, modern skill graphs include sharing permissions (org-scoped, public, or share-link gated) so teams can fork and customize skills from each other.",
          },
        },
        {
          "@type": "Question",
          name: "Which AI agents support skill graphs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Claude Code, Cursor, Gemini CLI, Hermes, and 30+ others support the agentskills.io open standard. Skill graph platforms layer team semantics and attribution on top.",
          },
        },
        {
          "@type": "Question",
          name: 'How is "skill graph" different in HR tech vs AI?',
          acceptedAnswer: {
            "@type": "Answer",
            text: "In HR tech, nodes are employee capabilities. In AI, nodes are agent workflows. The graph topology and use cases (gap analysis, composition, recommendation) are nearly identical.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to build or adopt a skill graph",
      description: "A practical 5-step sequence for starting a skill graph from one workflow.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Capture one workflow", text: "Capture one workflow as a SKILL.md (follow the Agent Skills standard, it is the most portable format)." },
        { "@type": "HowToStep", position: 2, name: "Run it", text: "Run it and observe what skills it gets chained with." },
        { "@type": "HowToStep", position: 3, name: "Add edges", text: "Add edges as patterns emerge: composition edges when one skill calls another, lineage edges when someone forks." },
        { "@type": "HowToStep", position: 4, name: "Attribute outcomes", text: "Attribute outcomes so when a skill run produces a tracked result, log the edge." },
        { "@type": "HowToStep", position: 5, name: "Query the graph", text: "Query the graph to find central skills, identify duplicates, surface forgotten capabilities." },
      ],
    },
  ],
};

export const Route = createFileRoute("/resources/what-is-a-skill-graph")({
  component: () => <ArticleLayout source={source} faqJsonLd={jsonLd} />,
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
