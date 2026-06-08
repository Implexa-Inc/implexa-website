// The example "thoughts" a person describes to Implexa once, after which the
// agent runs them every morning. These are deliberately phrased the way a real
// person types them, so each one doubles as a target query string for the
// answer-engine landing pages (the "how it works" examples and the SEO pages
// are the same content). Keep this a growing list: add new jobs here and they
// show up in the rotating homepage strip and stay available for query pages.
//
// Vocabulary rule for this file: these are jobs an AGENT does, never
// "workflows". Sentence case, no trailing punctuation, no em-dashes.

export type ExampleThought = {
  // The sentence a person would describe / search.
  text: string;
  // Coarse grouping, used only for the colored category chip in the UI.
  kind: "business" | "chores" | "builder";
};

export const EXAMPLE_THOUGHTS: ExampleThought[] = [
  { text: "Find new customers for my business every morning", kind: "business" },
  { text: "Draft replies to my overnight support emails", kind: "chores" },
  { text: "Turn this week's sales calls into follow-ups", kind: "business" },
  { text: "Write and schedule my posts for the week", kind: "chores" },
  { text: "Track competitor pricing and flag what changed", kind: "business" },
  { text: "Reconcile yesterday's invoices and payments", kind: "chores" },
  { text: "Qualify the leads that came in overnight", kind: "business" },
  { text: "Keep my CRM updated from my inbox", kind: "chores" },
  { text: "Chase my overdue invoices for me", kind: "chores" },
  { text: "Research each account before my sales calls", kind: "business" },
  { text: "Summarize the news that matters to my industry", kind: "chores" },
  { text: "Turn my meeting notes into action items", kind: "chores" },
  { text: "How do I grow my Instagram", kind: "builder" },
  { text: "Now that I built the app, how do I find users", kind: "builder" },
  { text: "Run the marketing for the app I just shipped", kind: "builder" },
  { text: "Onboard every new signup with a personal email", kind: "builder" },
];

// A tighter subset aimed at the app-builder-graduate ICP, used on the
// /built-with-ai landing page. Same shape, same growing-list discipline.
export const BUILDER_THOUGHTS: ExampleThought[] = [
  { text: "Run the marketing for the app I just shipped", kind: "builder" },
  { text: "Find my first hundred users", kind: "builder" },
  { text: "Reply to every support message overnight", kind: "builder" },
  { text: "Onboard each new signup with a personal email", kind: "builder" },
  { text: "Turn my changelog into social posts", kind: "builder" },
  { text: "Watch for mentions of my product and reply", kind: "builder" },
  { text: "Send me a daily report of signups and revenue", kind: "builder" },
  { text: "Chase the trials that did not convert", kind: "builder" },
];
