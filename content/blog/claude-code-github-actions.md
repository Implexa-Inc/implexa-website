---
title: "Claude Code GitHub Actions: automate PRs and CI"
slug: "claude-code-github-actions"
description: "Claude Code GitHub Actions runs Claude in your CI to review PRs, fix issues, and answer @claude mentions. Here is how to set it up and the YAML you need."
publishedAt: "2026-07-08"
tags: ["claude-code", "github-actions", "ci-cd", "automation", "code-review"]
---

# Claude Code GitHub Actions: automate PRs and CI

Claude Code GitHub Actions runs Claude inside your CI pipeline, so it can review pull requests, implement fixes from an issue, and answer questions when you mention @claude in a comment. It is the same agent you run in your terminal, moved onto GitHub's runners where it works while you are asleep. You tag it on a bug report, and a PR with the fix is waiting when you wake up.

The setup is short and the moving parts are few: a GitHub App, one repository secret, and a workflow file. This guide covers the fast path, the manual path for when you want to see every wire, the YAML for both mention based and fully automated runs, and the security and cost settings that keep an agent with write access from becoming a liability.

## What is Claude Code GitHub Actions?

It is an official GitHub Action, `anthropics/claude-code-action`, that runs Claude Code as a step in a workflow. GitHub triggers the workflow on the events you choose, a comment, a new pull request, an issue being assigned, and the action hands that context to Claude, which then reads the repo, makes changes, and pushes a branch or leaves review comments.

Two usage patterns cover almost everything. The first is interactive: someone writes `@claude fix the failing test in checkout.ts` in an issue or PR comment, and Claude responds in that thread with a commit or an answer. The second is automated: on every pull request, Claude runs a fixed prompt like a code review, with no human trigger at all. Both use the same action, wired to different events.

## How do you set up Claude Code GitHub Actions?

The fast way is to run `/install-github-app` from inside a Claude Code session in your terminal. It installs the Claude GitHub App on the repo you choose, adds a starter workflow file, and walks you through storing your API key as a repository secret. For most people that is the whole job, and you can skip the rest of this section.

If you would rather wire it by hand, or your org blocks the App installer, there are three manual steps:

1. Install the Claude GitHub App from `github.com/apps/claude` onto the repository, granting it read and write on Contents, Issues, and Pull Requests.
2. In the repository, open Settings, then Secrets and variables, then Actions, and add a secret named `ANTHROPIC_API_KEY` holding your Anthropic API key.
3. Commit a workflow file at `.github/workflows/claude.yml`. The next section is what goes in it.

Test it by tagging `@claude` in any issue or pull request comment. If the Actions tab shows a run kicking off, you are done.

## What does the workflow YAML look like?

A minimal mention based workflow has three parts: the events that trigger it, a least privilege permissions block, and a single step that calls the action with your API key. Here is one that responds whenever someone writes @claude in a comment:

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

The `if:` line is doing real work. Without it the job spins up on every comment and burns a runner minute deciding it has nothing to do. With it, the job only starts when a comment actually contains @claude.

## How do you run an automated PR review on every pull request?

Point the workflow at the `pull_request` event and give the action a fixed `prompt` instead of waiting for a mention. Claude runs that prompt against the diff the moment a PR opens or updates:

```yaml
name: Claude review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Review this PR for bugs and security issues. Leave inline comments on specific lines, and keep it short."
```

Notice the permissions here are tighter than the mention workflow: `contents: read`, because a reviewer does not need to push commits. Match the permissions to what the job actually does, and an over-eager prompt still cannot rewrite your history.

## How does Claude know your project's conventions?

Through the same `CLAUDE.md` file it reads in your terminal. Drop a `CLAUDE.md` at the repo root with your coding standards, your review criteria, and anything about the codebase Claude should assume, and the action loads it on every run. A PR review that knows you use tabs, ban a certain import, and require a changeset entry is worth far more than a generic one. This is [Claude Code memory](/blog/claude-code-memory), and it is the highest leverage file in the whole setup once the plumbing works.

## How do you keep it secure and control the cost?

Treat the action as a teammate with commit access, because that is what it is. A few habits keep it safe:

- **Scope permissions per workflow.** A review job gets `contents: read`; only a job that must commit gets `contents: write`. GitHub defaults to no permissions when you declare the block, so you grant exactly what the job needs.
- **Gate the trigger.** The `if: contains(..., '@claude')` guard stops the job from running on unrelated comments, and you can add `github.event.comment.author_association == 'MEMBER'` so outsiders commenting on a public repo cannot invoke it.
- **Keep the key a secret.** `ANTHROPIC_API_KEY` lives in repository or organization secrets, never in the YAML. Rotate it if it ever lands in a log.
- **Watch the spend.** Every run is metered API usage. Automated reviews on a busy repo add up, so start with the mention workflow, then add automation once you trust the output.

For teams already on cloud infrastructure, the action also authenticates against Amazon Bedrock or Google Vertex AI with OIDC, so the model calls stay inside your existing provider agreement instead of hitting the Anthropic API directly.

## How is this different from running Claude Code on a schedule?

GitHub Actions is event driven: something happens in the repo, and Claude reacts to it. A [scheduled Claude Code run](/blog/schedule-claude-code) is time driven: it fires on a cron whether or not anything changed, which suits recurring jobs like a nightly dependency audit or a weekly report. They compose well. Use Actions for anything that responds to a PR or an issue, and a scheduler for the work that has no trigger except the clock. Running agents unattended is Implexa's whole reason to exist, and in practice most teams end up with both.

## Frequently asked questions

**Does Claude Code GitHub Actions cost money?** Yes. It uses your Anthropic API key, so every run is billed as normal API usage, or billed through Bedrock or Vertex if you wire it that way. The GitHub Actions runner minutes are separate and billed by GitHub.

**Why is @claude not responding to my comment?** Usually the App is not installed on that repo, the `ANTHROPIC_API_KEY` secret is missing or misnamed, or the workflow's `if:` guard does not match your comment. Open the Actions tab; if no run started, the trigger did not fire, and the cause is the App or the event filter, not Claude.

**Can it work on a private repository?** Yes. Install the App on the private repo and add the secret the same way. The permissions you grant the App are what scope its access.

**Do I need to run `/install-github-app`, or can I set it up by hand?** Either works. The installer is faster and does the App plus the secret plus a starter workflow in one flow. The manual path exists for locked down orgs and for anyone who wants to read every line before it runs.

**Which model does it use?** The action's default, unless you override it. You can pass model settings the same way you configure them locally, so pair this with a tuned [settings.json](/blog/claude-code-settings-json) and a good `CLAUDE.md` to get consistent behavior across your terminal and your CI.

Start with the mention workflow on one repo, tag @claude on a small bug, and watch what comes back. The plumbing takes ten minutes, and the first time a fix shows up as a PR while you were doing something else, the point of it lands better than any guide can.
