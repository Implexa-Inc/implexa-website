// comparisons.ts — the "judo" / incumbent-alternative AEO layer.
//
// Same curated-data pattern as hub-catalog.ts: one entry per comparison page,
// one route template (/compare/[slug]). These pages capture high-intent
// "<incumbent> alternative" and "run <registry> skills safely" searches and
// route the visitor into the category hubs (/agents/<slug>) and /workflows.
//
// TRUST DISCIPLINE (this is the trust surface — read before editing):
//   1. Never fabricate stats. Every claim here is ARCHITECTURAL — true by the
//      shape of the two systems, defensible without citing a star count, a CVE
//      id, or an advisory tally that could be stale. We describe how the
//      incumbent works (self-hosted process, held credentials, metered
//      inference) and how Implexa works (runs inside your own Claude/Codex,
//      never holds credentials, no separate bill). Both descriptions are
//      accurate and checkable.
//   2. Claim OUTCOME parity on the work that matters — never "as powerful as."
//      Each page carries an honest `caveat`: where the incumbent is genuinely
//      the better tool. Giving up the blast radius IS a trade; we say so.
//   3. Skills are graded for DISPLAY/inspection (you can check a skill's track
//      record before running it), NOT auto-re-bound. Do not imply the agent
//      silently swaps in higher-graded skills — that isn't shipped. Improvement
//      is "from your feedback + a private per-agent memory," which is true.
//
// Incumbents (accurate as of this file's authoring):
//   OpenClaw — OSS self-hosted autonomous agent. You install it as an
//     always-on process and connect messaging/email accounts; it acts with
//     those credentials. ClawHub is its community skill registry.
//   Hermes  — OSS model-agnostic long-running agent. You supply and meter its
//     model inference; it self-improves via reflection and persistent memory.

export type ContrastPoint = {
  dimension: string; // short label ("Where it runs", "Credentials")
  them: string; // honest description of the incumbent's approach
  us: string; // Implexa's approach
};

export type Comparison = {
  slug: string; // /compare/<slug>
  h1: string; // page H1 — the query as a person types it
  metaTitle: string; // <title> (H1 is often terse; title carries the hook)
  // 2-sentence direct answer, written to be lifted verbatim by answer engines.
  answer: string;
  intro: string; // supporting line under the answer
  themLabel: string; // comparison-table column header for the incumbent
  usLabel: string; // always "Implexa"
  contrast: ContrastPoint[];
  // Where the incumbent is genuinely the better choice. The honesty IS the
  // trust move — required on every page, never omitted.
  caveat: { heading: string; body: string };
  faq: Array<{ question: string; answer: string }>;
  ctaHubs: string[]; // hub slugs (from HUBS) to route into
};

// The always-true, no-stats trust line reused in FAQs and intros.
const CREDENTIAL_LINE =
  "Implexa runs inside the Claude or Codex you already use, signed in as you, and never receives a password or account token — you stay signed in to each tool yourself, and anything that writes or posts waits for your approval.";

export const COMPARISONS: Comparison[] = [
  // ── Named-incumbent alternatives ──────────────────────────────────────────
  {
    slug: "openclaw-alternative",
    h1: "OpenClaw alternative",
    metaTitle: "OpenClaw alternative — agents inside your own Claude, no credentials handed over",
    answer:
      "The safest OpenClaw alternative is to run agents inside the Claude or Codex subscription you already pay for, instead of self-hosting a new always-on process and connecting your messaging and email accounts to it. Implexa builds and schedules those agents from a sentence, runs them as you in a sandbox you already trust, and never receives a credential — so you get the recurring-work automation without standing up a privileged daemon of your own.",
    intro:
      "OpenClaw is a self-hosted autonomous agent you install and hand account access. Implexa is a control plane over the Claude or Codex you already run — no new process, no credentials to surrender.",
    themLabel: "OpenClaw (self-hosted)",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Where it runs",
        them: "A new always-on process you install and host yourself, and have to keep patched and secured.",
        us: "Inside your existing Claude or Codex. There is no new long-running service to run, expose, or secure.",
      },
      {
        dimension: "Credentials & account access",
        them: "You connect messaging, email, and other accounts, and the agent acts with them.",
        us: "Never receives credentials. You stay signed in to each tool yourself; writes wait for your approval.",
      },
      {
        dimension: "Cost model",
        them: "The software is free, but you pay for and meter every token of model inference it consumes.",
        us: "Runs on the Claude or Codex plan you already pay for. No separate API bill from us.",
      },
      {
        dimension: "Skills",
        them: "Install community skills from ClawHub; you vet each one yourself before trusting it.",
        us: "Indexes and ranks skills across registries (ClawHub included) by track record, so you can skip the untested ones.",
      },
      {
        dimension: "Who can set it up",
        them: "Install, configure, and host it yourself — developer-shaped.",
        us: "Describe the job in a sentence; Implexa builds, binds, and schedules the agent.",
      },
    ],
    caveat: {
      heading: "Where OpenClaw is the better choice",
      body: "If you want a fully autonomous agent that drives your own accounts and runs unattended with broad system access — and you are equipped to own the security of that — self-hosted OpenClaw is built for it and is the more powerful tool. Implexa deliberately gives up that blast radius: it automates recurring work inside a sandbox and asks before it writes or posts. The trade is power for a surface with nothing to steal.",
    },
    faq: [
      {
        question: "Is there an OpenClaw alternative that doesn't need my passwords?",
        answer: CREDENTIAL_LINE,
      },
      {
        question: "Why not just self-host OpenClaw?",
        answer:
          "You can — it is capable software. The cost is that you now run an always-on process holding your account credentials, you meter its inference, and you own its security. Implexa avoids all three by running agents inside the Claude or Codex you already trust, as you, with no credentials held.",
      },
      {
        question: "What is the 'lethal trifecta' and does Implexa avoid it?",
        answer:
          "The lethal trifecta is a well-known agent-security shape: an agent that holds your credentials, reads untrusted input, and can act on the open internet — any two are fine, all three together are dangerous. Implexa breaks it by never holding credentials and gating outbound actions behind your approval, so a poisoned input can't silently act as you.",
      },
      {
        question: "Can Implexa run the same jobs OpenClaw does?",
        answer:
          "For scheduled, recurring work — monitoring, research, drafting, reporting — yes, and it runs free on your existing plan. For fully unattended agents with broad system access, OpenClaw is the more powerful option; Implexa trades that for a safer surface.",
      },
    ],
    ctaHubs: ["growth", "sales-outreach", "seo-aeo"],
  },
  {
    slug: "hermes-alternative",
    h1: "Hermes alternative",
    metaTitle: "Hermes alternative — recurring-work agents on the plan you already pay for",
    answer:
      "The practical Hermes alternative for most people is to run recurring-work agents inside your own Claude or Codex, rather than operating a self-improving, model-agnostic agent whose inference you supply and meter yourself. Implexa builds those agents from a sentence, runs them on the plan you already pay for, and sharpens each run from your feedback and a private per-agent memory — without you standing up and paying for a separate long-running model.",
    intro:
      "Hermes is a persistent, model-agnostic agent you operate and feed inference. Implexa is a control plane over the Claude or Codex you already own — nothing new to host, no second inference bill.",
    themLabel: "Hermes",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Model & cost",
        them: "Model-agnostic: you choose, supply, and pay for the inference on every run.",
        us: "Runs on your existing Claude or Codex plan. No separate inference bill from us.",
      },
      {
        dimension: "Where it runs",
        them: "A persistent long-running agent process you operate and keep alive.",
        us: "Inside the Claude or Codex you already use. Nothing new to host or keep running.",
      },
      {
        dimension: "How it improves",
        them: "Self-improves by reflection and rewrites its own skills — a self-scored loop.",
        us: "Improves from your approved feedback and a private per-agent memory; the skills it draws on are independently graded across a cross-vendor index you can inspect.",
      },
      {
        dimension: "Credentials",
        them: "Operated as a standing agent that holds the access you give it.",
        us: "Never receives credentials; you stay signed in yourself and approve writes.",
      },
      {
        dimension: "Who can set it up",
        them: "Configured and operated by a developer.",
        us: "Described in a sentence; Implexa builds and schedules it.",
      },
    ],
    caveat: {
      heading: "Where Hermes is the better choice",
      body: "If you want a fully autonomous, always-on agent that self-directs across many tools with a model of your choosing — and you are equipped to run and pay for that — Hermes is the more open-ended, more powerful tool. Implexa trades that open autonomy for something a non-developer can run free on an existing plan, with approval gates and no credentials held.",
    },
    faq: [
      {
        question: "Is there a Hermes alternative that runs on my existing AI plan?",
        answer:
          "Yes. Implexa runs agents inside the Claude or Codex subscription you already pay for, so there is no separate model to supply, meter, or bill — the recurring work runs on capacity you already have.",
      },
      {
        question: "Does Implexa self-improve like Hermes?",
        answer:
          "It improves, but honestly and differently. Rather than a self-scored loop, Implexa sharpens each run from your approved feedback and a private per-agent memory, and the skills it draws on are graded across a cross-vendor index you can inspect — so you can check a skill's track record instead of trusting a self-report.",
      },
      {
        question: "Do I need to be a developer?",
        answer:
          "No. You describe the recurring job in a sentence and Implexa builds, binds, and schedules the agent. Operating Hermes is a developer task; building an Implexa agent is not.",
      },
    ],
    ctaHubs: ["growth", "content-marketing", "seo-aeo"],
  },

  // ── The anchor comparison article ─────────────────────────────────────────
  {
    slug: "openclaw-vs-implexa",
    h1: "OpenClaw vs Implexa",
    metaTitle: "OpenClaw vs Implexa — self-hosted autonomy vs agents in your own Claude",
    answer:
      "OpenClaw is a self-hosted autonomous agent you install and hand account access; Implexa is a control plane that builds agents and runs them inside the Claude or Codex you already pay for, without ever holding a credential. Choose OpenClaw when you want an unattended daemon with broad system access and can own its security; choose Implexa when you want recurring work done free on your existing plan, with nothing to hand over and approval before anything is sent.",
    intro:
      "The honest split: OpenClaw optimizes for raw autonomy; Implexa optimizes for a surface with nothing to steal. Here is how they differ line by line.",
    themLabel: "OpenClaw (self-hosted)",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Architecture",
        them: "A new privileged process you install and host — an execution surface you now own.",
        us: "No new process. Agents run inside the Claude or Codex sandbox you already trust.",
      },
      {
        dimension: "Credentials & account access",
        them: "You connect accounts; the agent reads and acts with them.",
        us: "Never receives credentials. You sign in to each tool; writes wait for approval.",
      },
      {
        dimension: "Cost model",
        them: "Free software, but you pay for and meter all model inference.",
        us: "Runs on the plan you already pay for. No resold tokens, no second AI bill from us.",
      },
      {
        dimension: "Skill safety",
        them: "Community skills from ClawHub, vetted by you.",
        us: "Skills indexed and ranked by track record across registries, so untested ones are visible before you run them.",
      },
      {
        dimension: "Autonomy",
        them: "Fully unattended, broad system access — maximum power, maximum blast radius.",
        us: "Scheduled recurring work in a sandbox, approval-gated writes — bounded on purpose.",
      },
      {
        dimension: "Setup",
        them: "Self-install and host (developer-shaped).",
        us: "One sentence to a built, scheduled agent.",
      },
    ],
    caveat: {
      heading: "When to pick OpenClaw over Implexa",
      body: "If your job genuinely needs a fully autonomous agent with broad, unattended system access — and you can run and secure a privileged process holding your credentials — OpenClaw is the more powerful choice and we won't pretend otherwise. Implexa is the right choice when the work is recurring, you want it free on your existing plan, and you are not willing to stand up a new attack surface to get it.",
    },
    faq: [
      {
        question: "Is Implexa as powerful as OpenClaw?",
        answer:
          "Not on raw autonomy — OpenClaw runs fully unattended with broad system access, and for jobs that truly need that it is the stronger tool. On the recurring work most people actually want automated, Implexa delivers the outcome free on your existing plan, without holding a credential.",
      },
      {
        question: "What is the main safety difference?",
        answer:
          "OpenClaw is a new process that holds your account access; Implexa never holds credentials and runs inside the Claude or Codex you already trust, with outbound actions gated behind your approval. There is no new execution surface and nothing to exfiltrate.",
      },
      {
        question: "Which is cheaper to run?",
        answer:
          "Implexa runs on the Claude or Codex plan you already pay for, with no separate inference bill from us. OpenClaw's software is free, but you meter and pay for every token of model inference it consumes.",
      },
    ],
    ctaHubs: ["growth", "content-marketing", "sales-outreach", "seo-aeo"],
  },
  {
    slug: "hermes-vs-implexa",
    h1: "Hermes vs Implexa",
    metaTitle: "Hermes vs Implexa — self-hosted self-improving agent vs your own Claude",
    answer:
      "Hermes is a model-agnostic, self-improving agent you operate and supply inference for; Implexa builds agents from a sentence and runs them inside the Claude or Codex you already pay for, improving from your feedback rather than a self-scored loop. Pick Hermes for open-ended autonomy with a model of your choosing; pick Implexa to get recurring work done free on your existing plan, with no second inference bill and no credentials held.",
    intro:
      "Both improve over time. The difference is who pays for the model, who holds the access, and whether the improvement is self-scored or checkable.",
    themLabel: "Hermes",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Model & cost",
        them: "You supply and meter the inference on every run.",
        us: "Runs on your existing Claude or Codex plan; no separate inference bill from us.",
      },
      {
        dimension: "Improvement",
        them: "Self-improves and rewrites its own skills — self-scored.",
        us: "Improves from your approved feedback and a private per-agent memory; draws on skills graded across an index you can inspect.",
      },
      {
        dimension: "Hosting",
        them: "A persistent process you operate.",
        us: "Nothing to host — it runs inside the AI you already use.",
      },
      {
        dimension: "Credentials",
        them: "Holds the access you grant the standing agent.",
        us: "Never receives credentials; approval-gated writes.",
      },
      {
        dimension: "Setup",
        them: "Developer-operated.",
        us: "One sentence to a scheduled agent.",
      },
    ],
    caveat: {
      heading: "When to pick Hermes over Implexa",
      body: "If you want a fully autonomous, always-on agent that self-directs across many tools with a model you choose — and you can run and pay for that — Hermes is the more open-ended tool. Implexa trades that autonomy for something a non-developer can run free on an existing plan, with approval gates and no credentials held.",
    },
    faq: [
      {
        question: "Which is cheaper, Hermes or Implexa?",
        answer:
          "Implexa runs on the Claude or Codex plan you already pay for, with no separate inference bill from us. With Hermes you supply and meter the model yourself, so cost scales with every run.",
      },
      {
        question: "Is Implexa's self-improvement real or marketing?",
        answer:
          "It is the honest version: Implexa improves each run from your approved feedback and a private per-agent memory, and the skills it uses are graded across a cross-vendor index you can inspect. It does not claim to silently re-score itself; you can check what changed and why.",
      },
    ],
    ctaHubs: ["growth", "content-marketing", "seo-aeo"],
  },

  // ── Safety / category judo ────────────────────────────────────────────────
  {
    slug: "run-clawhub-skills-safely",
    h1: "How to run ClawHub skills safely",
    metaTitle: "Run ClawHub skills safely — inside your own Claude, no accounts handed over",
    answer:
      "To run ClawHub skills safely, don't hand them your accounts or run them inside a privileged always-on process — run them inside the Claude or Codex sandbox you already use, signed in as yourself, with writes gated behind your approval. Implexa indexes skills from ClawHub and other registries, ranks them by track record so you can avoid the untested ones, and runs them as you without ever taking a credential.",
    intro:
      "A community skill is untrusted code until you've checked it. The two questions that matter: can you see its track record before you run it, and what does it get access to when you do?",
    themLabel: "ClawHub skill in a self-hosted agent",
    usLabel: "ClawHub skill via Implexa",
    contrast: [
      {
        dimension: "Vetting",
        them: "You read and judge each skill yourself before trusting it.",
        us: "Indexed and ranked by track record across registries, so untested skills are visible up front.",
      },
      {
        dimension: "Execution surface",
        them: "Runs in a privileged process that holds your account access.",
        us: "Runs inside the Claude or Codex sandbox you already trust, as you.",
      },
      {
        dimension: "Credentials",
        them: "The skill can act with the accounts you connected to the agent.",
        us: "No credentials handed over; you stay signed in yourself.",
      },
      {
        dimension: "Guardrail",
        them: "A poisoned or malicious skill can act autonomously.",
        us: "Outbound actions wait for your approval, so a bad skill can't silently act as you.",
      },
    ],
    caveat: {
      heading: "The honest limit",
      body: "Some skills genuinely need to drive your logged-in browser or reach into your system. Implexa runs those attended — with you present and approving — rather than headless with stored credentials. If a skill's whole point is fully unattended system access, a self-hosted autonomous agent is what it's built for; that's the surface Implexa intentionally won't create.",
    },
    faq: [
      {
        question: "Are ClawHub skills safe to run?",
        answer:
          "A community skill is untrusted code until vetted — the registry itself doesn't vouch for safety. Running it inside your own Claude or Codex as yourself, with approval-gated writes and no credentials handed over, contains the risk; Implexa also ranks skills by track record so you can avoid the untested ones.",
      },
      {
        question: "How does Implexa reduce the risk of a malicious skill?",
        answer:
          "Two ways: it never hands the skill your credentials (you stay signed in yourself), and it gates any write or post behind your approval. So even a poisoned skill can't silently act as you or exfiltrate account access it was never given.",
      },
      {
        question: "Can I run any ClawHub skill through Implexa?",
        answer:
          "Most recurring, tool-scoped skills, yes. Skills whose whole purpose is fully unattended system access are the exception — Implexa runs those attended with your approval rather than headless, because that is the surface it won't create.",
      },
    ],
    ctaHubs: ["content-marketing", "growth", "seo-aeo"],
  },
  {
    slug: "ai-agent-without-credentials",
    h1: "An AI agent that never needs your passwords",
    metaTitle: "AI agent without credentials — runs as you in your own Claude, nothing to hand over",
    answer:
      "An AI agent that never needs your passwords runs inside the Claude or Codex you already use, as you, so there is nothing to hand over — instead of a separate service that stores your OAuth tokens or asks you to connect your accounts. Implexa works this way by design: it never receives a credential, you stay signed in to each tool yourself, and anything that writes or posts waits for your approval.",
    intro:
      "Most 'agents that do your work' want to read and write all your email, texts, and calendars first. That's an immediate no for anyone with something to lose — and it isn't necessary.",
    themLabel: "Typical autonomous agent",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Credentials",
        them: "Stores your OAuth tokens or asks you to connect your accounts up front.",
        us: "Never receives a credential. You stay signed in to each tool yourself.",
      },
      {
        dimension: "Where it acts",
        them: "A separate service acting on your behalf with the access it stored.",
        us: "Inside the Claude or Codex you already use, acting as you, in a sandbox you trust.",
      },
      {
        dimension: "Control",
        them: "Often acts autonomously once granted access.",
        us: "Writes and posts wait for your approval.",
      },
      {
        dimension: "Blast radius if breached",
        them: "A breach exposes every account whose token it stored.",
        us: "Nothing to steal — there are no stored credentials to exfiltrate.",
      },
    ],
    caveat: {
      heading: "The honest trade",
      body: "Because Implexa never holds your credentials, it can't act unattended in accounts on your behalf the way a token-storing service can. When a job needs your real browser or a logged-in session, Implexa runs it attended, with you present. That's the deliberate cost of a surface with nothing to steal.",
    },
    faq: [
      {
        question: "How can an agent do my work without my passwords?",
        answer:
          "By running inside the AI you already sign into, as you, instead of as a separate service. Implexa runs agents in your own Claude or Codex, so it acts with the access you already have in that session — and asks before it writes or posts — without ever storing a credential of yours.",
      },
      {
        question: "What happens if Implexa is breached?",
        answer:
          "There are no stored account tokens to steal, because Implexa never takes them. That's the point of the design: the surface holds nothing worth exfiltrating.",
      },
    ],
    ctaHubs: ["sales-outreach", "growth", "seo-aeo"],
  },
  {
    slug: "self-hosted-ai-agent-alternative",
    h1: "A self-hosted AI agent alternative — without the hosting",
    metaTitle: "Self-hosted AI agent alternative — no server, no daemon, runs in your own Claude",
    answer:
      "The alternative to a self-hosted AI agent is to run agents inside the Claude or Codex you already pay for, so there is no server to stand up, patch, or secure and no always-on process holding your credentials. Implexa builds and schedules those agents from a sentence and runs them as you, giving you the recurring-work automation of a self-hosted agent without owning a new execution surface.",
    intro:
      "Self-hosting gives you control, but it also hands you a standing process to run, secure, and pay inference for. For recurring work, most of that cost buys you nothing you can't get inside the AI you already run.",
    themLabel: "Self-hosted agent",
    usLabel: "Implexa",
    contrast: [
      {
        dimension: "Infrastructure",
        them: "A server or machine running an always-on process you patch and secure.",
        us: "No server, no daemon — it runs inside the Claude or Codex you already use.",
      },
      {
        dimension: "Credentials",
        them: "The hosted process holds the account access you granted it.",
        us: "Never holds credentials; you stay signed in yourself, writes are approval-gated.",
      },
      {
        dimension: "Inference cost",
        them: "You supply and meter the model on every run.",
        us: "Runs on the plan you already pay for; no separate bill from us.",
      },
      {
        dimension: "Maintenance",
        them: "Updates, security patches, and uptime are your job.",
        us: "Nothing to maintain — there's no standing service of yours to keep alive.",
      },
    ],
    caveat: {
      heading: "When self-hosting is worth it",
      body: "If you need full control of the runtime, air-gapped operation, or a fully autonomous process with broad system access, self-hosting is the right call and Implexa isn't a substitute for it. Implexa is the better choice when the goal is recurring work done reliably, free on an existing plan, with no infrastructure and no credentials held.",
    },
    faq: [
      {
        question: "Do I need to host anything to use Implexa?",
        answer:
          "No. Implexa runs agents inside the Claude or Codex you already use — there is no server to stand up, no daemon to keep alive, and no process of yours holding credentials.",
      },
      {
        question: "Is a hosted agent more capable than Implexa?",
        answer:
          "For fully autonomous, always-on operation with broad system access, a self-hosted agent can do more. For the recurring, scheduled work most people want automated, Implexa delivers the outcome free on your existing plan, without the infrastructure or the security burden.",
      },
    ],
    ctaHubs: ["growth", "seo-aeo", "content-marketing"],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
