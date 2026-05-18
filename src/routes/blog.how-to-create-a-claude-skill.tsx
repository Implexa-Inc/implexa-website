import { createFileRoute } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/ArticleLayout";
import source from "@/content/how-to-create-a-claude-skill.md?raw";

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Create a Claude Skill",
  description: "A step-by-step walkthrough for creating your first Claude Skill — from install through recording, interview, activation, and sharing with your team.",
  step: [
    { "@type": "HowToStep", name: "Install the Implexa plugin", text: "Run the curl install script and restart Claude Code." },
    { "@type": "HowToStep", name: "Pick a workflow to demonstrate", text: "Choose a concrete, repeatable, bounded workflow you do 3+ times per week." },
    { "@type": "HowToStep", name: "Start the demonstration", text: "Run /implexa:record and answer the setup questions." },
    { "@type": "HowToStep", name: "Do the workflow", text: "Run the workflow normally; make decisions out loud where they matter." },
    { "@type": "HowToStep", name: "End the demonstration and answer the interview", text: "Run /implexa:record stop and answer 2–4 targeted questions." },
    { "@type": "HowToStep", name: "Activate and review", text: "Run /implexa:activate and test the skill in a fresh conversation." },
    { "@type": "HowToStep", name: "Update the skill", text: "Edit SKILL.md manually or re-record into the existing skill." },
    { "@type": "HowToStep", name: "Share with your team", text: "Run /implexa:share to get an org or universal link." },
  ],
};

export const Route = createFileRoute("/blog/how-to-create-a-claude-skill")({
  component: () => <ArticleLayout source={source} faqJsonLd={howToJsonLd} />,
  head: () => ({
    meta: [
      { title: "How to Create a Claude Skill (Step-by-Step) — Implexa" },
      { name: "description", content: "A 7-step walkthrough for creating your first Claude Skill — from install through recording, interview, activation, and sharing with your team." },
      { property: "og:title", content: "How to Create a Claude Skill (Step-by-Step)" },
      { property: "og:description", content: "A 7-step walkthrough for creating your first Claude Skill — from install through recording, interview, activation, and sharing with your team." },
      { property: "og:url", content: "https://implexa.ai/blog/how-to-create-a-claude-skill" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://implexa.ai/blog/how-to-create-a-claude-skill" }],
  }),
});
