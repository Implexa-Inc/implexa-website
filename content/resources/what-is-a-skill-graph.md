---
title: "what is a skill graph? definition, examples, and how AI teams use them"
slug: "what-is-a-skill-graph"
description: "a skill graph is a structured map of reusable workflows or capabilities that can be composed, shared, and measured. used in AI agents and workforce planning."
publishedAt: "2026-05-20"
tags: ["skill-graph", "agent-skills", "skill-discovery", "SKILL.md"]
---

# what is a skill graph?

**A skill graph is a structured map of reusable workflows or capabilities, plus the relationships between them, that can be composed, shared, attributed, and improved over time.** Skill graphs show up in two adjacent fields. AI agent platforms use them to model which workflows their agents can perform. Workforce planning software uses them to model which capabilities employees have. Both treat skills as nodes in a graph, and both find that the topology matters more than any single node.

The concept is gaining traction in 2026 because flat lists stop scaling around 10 to 20 skills. Once you have hundreds of reusable workflows, you need structure to find them, compose them, and govern them. A skill graph adds that structure.

## how a skill graph works

**A skill graph stores each skill as a node with metadata (inputs, outputs, owners), and edges representing dependencies, composition, or fork lineage.** Nodes are individual skills, a SKILL.md file in the AI agent context, or a documented capability in the workforce context. Edges encode relationships:

- **composition edges** when skill A calls skill B as a sub-step
- **dependency edges** when skill A requires skill B's output as input
- **lineage edges** when skill A is a fork of skill B (someone customized B for their team)
- **co-occurrence edges** when skill A and skill B are frequently run together by the same user

These edges turn a folder of skills into a navigable substrate. You traverse from one skill to related ones, recommend chains, detect duplicates, and surface which skills are central versus peripheral.

The [Graph of Skills research](https://arxiv.org/pdf/2604.05333) shows the practical impact: a dependency-aware skill graph improves agent reward by 43.6% over loading the full skill library, while reducing input tokens by 37.8%. Structure beats brute-force.

## skill graph vs skill library

**A skill library is a flat list of skills; a skill graph is a navigable structure where one skill can lead the agent (or human) to the next.** This distinction matters once you scale.

A library works fine when you have 5 to 10 skills. You search by name, you remember what each does. Past 10 to 20, search-by-name breaks. Skill names start to overlap in domain, and users (including the people who authored the skills) can't remember which one to invoke. Even small teams hit this limit fast.

A skill graph solves this by adding three primitives:

1. **composition** so skills chain to other skills, and one invocation can compose two or three workflows into a larger run
2. **recommendation** so the graph topology suggests skills based on usage patterns ("teammates who ran X also ran Y")
3. **attribution** so outcome edges track which skill chains actually produced shipped work, hires, or closed deals, so the graph learns which skills earn their place

Without these, a library is just a folder. With them, it is a substrate that compounds over time.

## skill graph vs work graph

**A skill graph maps what can be done; a work graph maps what is being done and by whom.** The two are easy to confuse because both connect people to outcomes, but they model different things and they are most useful together.

A work graph, a term project-management platforms like Asana popularized, connects the units of work in an organization: tasks, projects, goals, the people assigned to them, and the documents attached to them. Its nodes are work items. Ask it a question and it answers "who is doing this, what does it depend on, and what is the status." Talent platforms use a close cousin, the workforce graph (Gloat is one example), which links people, roles, and the skills each person holds.

A skill graph's nodes are capabilities, not work items. Where a work graph records that the Q3 launch is 60% done, a skill graph records the reusable "draft launch announcement" workflow behind it: what it composes with, who owns it, and that the last 12 runs of the chain all shipped. The work graph holds the status; the skill graph holds the repeatable machinery.

The two connect through attribution. When a skill run produces a tracked outcome that lands on a work-graph node (a task closed, a deal won, a ticket resolved), an attribution edge links the capability to the result, and two separate diagrams become one measurement system. The skill graph learns which capabilities move real work, and the work graph gains a record of how each outcome was produced.

## why skill graphs matter for AI agents

**AI agents that operate on a skill graph can chain workflows automatically, learn from past compositions, and attribute outcomes back to the specific skills that produced them.** That is what separates a useful agent from a novelty demo.

When a skill collection grows past a few dozen entries, an agent with no structure falls back to scanning markdown files, doing rough keyword matching, or re-planning from scratch on every task. A skill graph replaces that with semantic routing over a structured index: the agent narrows to the relevant region of the graph, follows composition and co-occurrence edges to assemble a chain, and updates its routing as outcomes come back. The library stops being a flat pile and becomes something the agent can reason over.

The [Agent Skills open standard](https://agentskills.io/home) released by Anthropic in late 2025 made SKILL.md the universal file format for AI agent capabilities. The format itself solved authoring and portability. The same SKILL.md runs in Claude Code, Cursor, Gemini CLI, Hermes, and 30+ other agents.

But the standard intentionally stops at the file format. It does not define how a skill graph emerges across teams. That layer (who authored what, who forked what, which chains produced which outcomes) is where the next generation of skill platforms competes. Anthropic's own [agent-skills engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) acknowledges it. Skills are the format, but the surrounding infrastructure (discovery, attribution, governance) is where teams need help.

## skill graphs in workforce planning (the other meaning)

**Workforce skill graphs map employee capabilities to roles and projects, helping HR teams identify gaps, plan hires, and route work.** Decades before AI agents adopted the term, talent intelligence platforms used "skill graph" to mean the same thing: capabilities as nodes, relationships as edges.

[Coursera's Skills Graph](https://medium.com/coursera-engineering/courseras-skills-graph-helps-learners-find-the-right-content-to-reach-their-goals-b10418a05214) connects learners, content, and careers through a common skills currency. Workforce platforms like Cornerstone OnDemand, Eightfold, and Beamery build similar graphs for enterprise HR. In each case, the graph supports queries that a flat list cannot:

- what is the shortest path from $current_role to $target_role?
- which employees can fill this gap?
- what skills are emerging in our workforce that no one has formally documented?

The structural similarity to AI agent skill graphs is not accidental. Both fields converged on the graph data structure because both face the same problem: a list of capabilities, however well-tagged, can't represent the relationships that make capabilities useful.

## the convergence: when AI skill graphs meet team skill graphs

**The next generation of skill graphs treats AI workflows and human capabilities as nodes in the same graph, measuring which agents and which people produced which outcomes.** That is the wedge most platforms miss today.

Right now, AI-agent skill graphs and workforce skill graphs live in separate stacks. A sales team runs AI agents that author proposals, and HR tracks which employees can author proposals, but no system records that Ashish ran the proposal-draft agent 47 times last quarter and closed 8 deals from it. The agent's skill graph and the employee's skill graph are disconnected.

Outcome attribution closes that loop. When a skill run produces a tracked outcome (a deal closed, a PR merged, a hire made), the attribution edge connects three nodes: the skill, the human runner, and the outcome. The graph becomes a measurement system, not just a directory.

This is the substrate that turns skills from a productivity feature into a real-time competency map. It works for AI agents, it works for human teams, and the same data structure handles both.

## how to build or adopt a skill graph today

**Start by recording one workflow as a structured skill, then track which other workflows reference it; the graph emerges organically from real usage.** The mistake teams make is trying to design the graph upfront. You can't. You don't know yet which compositions will matter.

The practical sequence:

1. **capture one workflow** as a SKILL.md (follow the [agent skills standard](https://agentskills.io/home), it's the most portable format)
2. **run it** and observe what skills it gets chained with
3. **add edges** as patterns emerge: composition edges when one skill calls another, lineage edges when someone forks
4. **attribute outcomes** so when a skill run produces a tracked result, log the edge
5. **query the graph** to find central skills, identify duplicates, surface forgotten capabilities

Anthropic's [skill-creator](https://github.com/anthropics/skills) is a good starting point for authoring the first node. Cross-vendor platforms add the team layer (sharing, forking, attribution) so the graph spans more than one user's local folder.

## FAQ

### what's the difference between a skill graph and an agent skill?

An agent skill is a single workflow (one SKILL.md file). A skill graph is the structure that connects many skills together, including who authored them, who installed them, and which ones get chained.

### what is a work graph, and how is it different from a skill graph?

A work graph maps the work itself: tasks, projects, goals, and the people assigned to them. A skill graph maps the reusable capabilities that get work done. The work graph tracks the state of a project; the skill graph tracks the machinery that produces it. Connect them with attribution edges and you can see which capability produced which result.

### is a skill graph the same as a knowledge graph?

No. A knowledge graph models facts and entities. A skill graph models executable workflows and the relationships between them.

### is "skills graph" (plural) the same thing as a skill graph?

Yes. "Skills graph" and "skill graph" are used interchangeably. HR and talent platforms tend to write "skills graph"; AI agent tooling tends to write "skill graph." Both describe capabilities as nodes and relationships as edges.

### can I share skills across teams in a skill graph?

Yes. Modern skill graphs include sharing permissions (org-scoped, public, or share-link gated) so teams can fork and customize skills from each other.

### which AI agents support skill graphs?

Claude Code, Cursor, Gemini CLI, Hermes, and 30+ others support the agentskills.io open standard. Skill graph platforms layer team semantics and attribution on top.

### how is "skill graph" different in HR tech vs AI?

In HR tech, nodes are employee capabilities. In AI, nodes are agent workflows. The graph topology and use cases (gap analysis, composition, recommendation) are nearly identical.

---

*if you want to capture your own workflows as skill graph nodes, [implexa](/) records one demonstration and emits a portable SKILL.md, which runs in Claude Code, Cursor, and 30+ other agents.*
