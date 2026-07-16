---
title: "Claude Code headless mode: run it from scripts and CI"
slug: "claude-code-headless"
description: "Claude Code headless mode explained: run claude -p from scripts, cron, and CI, parse JSON output, approve tools safely, and avoid the traps that stall runs."
publishedAt: "2026-07-16"
tags: ["claude-code", "headless", "automation", "ci", "ai-agents"]
---

# Claude Code headless mode: run it from scripts and CI

Claude Code headless mode is the `-p` (or `--print`) flag: instead of opening an interactive session, you pass the prompt on the command line, Claude does the work, prints the result to stdout, and exits. That one flag turns Claude Code from an app you sit in into a command you can call from a shell script, a cron job, a CI pipeline, or another program.

That distinction matters more than it sounds. Interactive Claude Code assumes a human is sitting there to approve tools and steer; headless mode makes the opposite assumption, and every flag in this guide exists to handle what follows from it, which is that the run has to finish correctly with no one around to click anything.

I run scheduled agents through headless Claude Code every day, some of them for 20 minutes at a stretch, and most of what is in this post I learned by watching those runs fail in ways the docs did not warn me about. The mechanics are quick to learn. The traps mostly show up later, once a run is long enough that you stop watching it.

## What is Claude Code headless mode?

Headless mode is Claude Code running non-interactively: you add `-p` with a prompt, and Claude executes the task and returns the result without an interactive session. The simplest form is one line:

```bash
claude -p "What does the auth module do?"

# it reads stdin and writes stdout, so it pipes like any other Unix tool
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

One limit to know up front: as of Claude Code v2.1.128, piped stdin is capped at 10MB, and exceeding it exits with an error and a non-zero status. For bigger inputs, write the content to a file and reference the path in your prompt instead.

All the normal CLI options work with `-p`, including `--allowedTools`, `--output-format`, and `--continue`. Skills work too: put `/skill-name` in the prompt string and Claude Code expands it before running. Terminal-only commands like `/login` do not.

## What does the --bare flag do?

`--bare` skips auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md, which makes startup faster and, more importantly, makes the run reproducible. Without it, `claude -p` loads the same context an interactive session would, including whatever happens to live in the project's `.mcp.json` or a teammate's `~/.claude`. That is exactly what you do not want in CI, where the whole point is the same result on every machine. The shape is `claude --bare -p "Summarize this file" --allowedTools "Read"`.

In bare mode Claude still has Bash, file read, and file edit. Anything else you pass explicitly: `--append-system-prompt` for instructions, `--settings` for config, `--mcp-config` for MCP servers, `--agents` for custom agents. Note that bare mode skips OAuth and keychain reads, so authentication has to come from `ANTHROPIC_API_KEY` or an `apiKeyHelper` in the settings you pass.

Anthropic says `--bare` is the recommended mode for scripted calls and will become the default for `-p` in a future release. If you are writing a new pipeline today, start with it.

## How do you get structured output from claude -p?

Pass `--output-format json` to get a structured payload with the result text, a session ID, and metadata, then parse it with jq. The payload also includes `total_cost_usd` with a per-model breakdown, so a scripted caller can track spend per invocation without opening the usage dashboard. If you need output that conforms to a schema, add `--json-schema` with a JSON Schema definition and read the `structured_output` field:

```bash
# plain result text
claude -p "Summarize this project" --output-format json | jq -r '.result'

# schema-conforming output
claude -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

One thing the docs undersell: `--output-format json` buffers everything and prints one blob at the very end of the run. For a 30-second task, fine. For a long agentic run, your script sees zero bytes of output for 20 minutes and you cannot tell a working run from a hung one. I learned this the annoying way, watching a wrapper script that looked dead while Claude was quietly mid-task. The fix is `--output-format stream-json` with `--verbose`, which emits newline-delimited JSON events as they happen, ending with a `result` message that carries the final text, cost, and session metadata. Add `--include-partial-messages` if you want token-level deltas.

The stream also surfaces useful operational events: `system/init` reports the model, tools, and loaded plugins (with a `plugin_errors` array you can use to fail CI when a plugin did not load), and `system/api_retry` fires before each retry on a retryable API error, with the attempt number and delay.

## How do you approve tools without a human in the loop?

Use `--allowedTools` to pre-approve specific tools, or a permission mode to set a baseline for the whole run. This is the part that decides whether your unattended run completes or silently aborts at the first permission prompt.

`--allowedTools` takes permission rule syntax, and the details matter:

```bash
claude -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

The trailing ` *` enables prefix matching, and the space before it is load-bearing: `Bash(git diff *)` allows anything starting with `git diff`, while `Bash(git diff*)` would also match `git diff-index`.

For a locked-down CI run, `--permission-mode dontAsk` denies anything not covered by your allow rules or the read-only command set. `--permission-mode acceptEdits` lets Claude write files without prompting and auto-approves common filesystem commands like `mkdir` and `mv`, but other shell commands still need an explicit rule, otherwise the run aborts when one is attempted.

There is also `--dangerously-skip-permissions`, which does what the name says. If you are tempted, run it inside an isolated environment instead; that is the whole subject of [Claude Code sandboxing](/blog/claude-code-sandbox). Permission rules themselves live in settings files you can commit to the repo, which I covered in [the settings.json guide](/blog/claude-code-settings-json).

## How do you keep context across headless runs?

Use `--continue` to pick up the most recent conversation, or `--resume` with a session ID for a specific one. Each `claude -p` call is otherwise a fresh session with no memory of the last. The pattern for multiple parallel conversations is to capture the ID from the JSON output, `session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')`, then pass it back with `claude -p "Now focus on the database queries" --resume "$session_id"`.

Run both commands from the same directory. Session lookup is scoped to the current project directory and its git worktrees, and a `--resume` from somewhere else will not find the session.

## What breaks when nobody is watching?

The failures that hurt in headless mode are the quiet ones: the run does not error, it just never finishes, or finishes wrong. Four to plan for:

1. **Background processes get reaped.** If Claude starts a background Bash task during a `-p` run (a dev server, a watch build), that shell is terminated about five seconds after the final result is returned. Background subagents are exempt, but since v2.1.182 that wait is capped at ten minutes by default so a stuck agent cannot hold the process open forever. Tune it with `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` if your workflow legitimately needs longer.
2. **Buffered output hides hangs.** Covered above: plain `json` output gives you nothing until the end. Use `stream-json` for anything long enough that you would want a heartbeat.
3. **Usage limits stall the run.** If your subscription hits its usage window cap mid-run, the run stalls with nothing on the other end to notice. A cron-triggered headless job that dies at the cap is invisible unless your wrapper records a start and a finish and alerts when the finish never comes. Record both. This single habit has caught more silent failures for me than everything else combined.
4. **Local config leaks in.** Without `--bare`, the run inherits hooks, MCP servers, and CLAUDE.md from wherever it runs. A job that works on your machine and fails in CI usually differs in exactly this.

## When should you use headless mode vs a schedule or CI action?

Headless mode is the primitive, not the product. It gives you one non-interactive run; everything around it (the trigger, the retries, the logging, the delivery of results) is yours to build.

The decision comes down to the trigger. If the trigger is a code event, wire `claude -p` into your pipeline or use the prebuilt [GitHub Actions integration](/blog/claude-code-github-actions). If the trigger is time, cron calling `claude -p` works, though Claude Code also has native options I compared in [how to schedule Claude Code](/blog/schedule-claude-code). And if what you actually want is recurring agents with run history, failure alerts, and results delivered somewhere useful, without writing the wrapper scripts yourself, that orchestration layer is the thing [implexa](https://implexa.ai) exists to be.

For one-off scripting, skip the ceremony. `claude -p` with a couple of allow rules is genuinely enough.

## FAQ

**Is headless mode the same as the Agent SDK?**
It is the CLI face of it. The same agent loop is available as Python and TypeScript packages with structured outputs and tool approval callbacks; `claude -p` is the right choice when a shell command is all you need.

**Does claude -p cost extra?**
No. It runs on your existing plan or API key. With `--output-format json` you get `total_cost_usd` in every response, which makes per-run cost tracking a jq one-liner.

**Can I use my skills and slash commands in a headless run?**
Yes. Include `/skill-name` in the prompt string and it expands before the run starts. Commands that only make sense in the terminal UI, like `/login`, are unavailable.

**How do I run claude -p on a timer?**
Plain cron works: `0 8 * * 1 claude --bare -p "..." >> run.log`. For the tradeoffs between cron, desktop scheduled tasks, and cloud routines, see [the scheduling guide](/blog/schedule-claude-code).

**Does headless mode work on Windows?**
Yes. One version note: before v2.1.211, an unreadable stdin on Windows could crash the session or exit silently; current versions print a warning to stderr and continue with the command-line prompt.
