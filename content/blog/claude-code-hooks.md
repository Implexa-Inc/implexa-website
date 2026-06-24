---
title: "Claude Code hooks: automate your workflow reliably"
slug: "claude-code-hooks"
description: "Claude Code hooks run commands, HTTP calls, or prompts at fixed points in a session, so linting and guardrails fire every time. Here is how to set them up."
publishedAt: "2026-06-24"
tags: ["claude-code", "hooks", "automation", "ai-agents", "workflow"]
---

# Claude Code hooks: automate your workflow reliably

Claude Code hooks are shell commands, HTTP calls, or model prompts that fire automatically at fixed points in a session, so the steps you want to run every time actually run every time. Write the linter into a prompt and Claude remembers it most of the time. Write the linter into a PostToolUse hook and it runs after every single edit, whether Claude was paying attention or not. That gap between "most of the time" and "every time" is the entire reason the feature exists.

Most people meet hooks the same way. They asked Claude to format code or run tests "from now on," watched it comply for an hour and then quietly drift, and went looking for something sturdier. Hooks are that something. They sit underneath the model instead of inside the prompt, which is what makes them deterministic. This guide covers what they are, where the config lives, the events worth knowing, and the line where a hook stops being enough.

## What are Claude Code hooks?

A hook is a handler that Claude Code runs itself, automatically, when a specific event happens in a session. You do not ask the model to run it. The runtime fires it for you every time the event occurs, which is why a hook gives you control a prompt cannot.

There are five kinds. A command hook runs a shell command and receives the event data as JSON on stdin. An HTTP hook POSTs that same JSON to a URL you choose. A prompt hook sends a short prompt to a Claude model for a yes-or-no decision. An mcp_tool hook calls a tool on a connected MCP server. And an agent hook spawns a subagent to check something, which is still experimental. The command type covers most real use, because almost anything you want to enforce can be written as a script that exits 0 or exits 2.

## Where do hooks live, and what does the config look like?

Hooks are configured in a settings.json file, as a top-level "hooks" field at the same level as "permissions." Project hooks go in .claude/settings.json and ship with the repo, so your whole team inherits them. Personal hooks go in ~/.claude/settings.json and follow you across every project.

The shape is nested. Under "hooks" you key by event name, and each event holds a list of matcher blocks:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\"" }
        ]
      }
    ]
  }
}
```

The "matcher" decides when the block fires. For tool events it matches on the tool name, so "Bash" catches Bash calls, "Write|Edit" catches either, and an empty string or "*" catches all of them. That one config runs prettier on every file Claude writes or edits, and you stop thinking about formatting.

## What events can a hook fire on?

Claude Code exposes more than two dozen lifecycle events, and you will reach for the same handful almost every time. The full list runs from session start to session end and covers most of what happens in between.

The ones that earn their keep:

- **PreToolUse** fires before a tool runs and can block it. This is your guardrail.
- **PostToolUse** fires after a tool succeeds. This is where formatting, logging, and tests go.
- **UserPromptSubmit** fires when you send a message, before Claude reads it, so you can inject context or reject the prompt outright.
- **SessionStart** fires when a session begins or resumes, useful for loading state into context.
- **Stop** fires when Claude finishes responding, handy for a "ping me when it's done" notification.
- **SubagentStop** fires when a subagent finishes, which starts to matter once you run [Claude Code subagents](/blog/claude-code-subagents) in parallel.

The rest cover narrower moments: compaction, permission prompts, files changing on disk, worktree creation. You can ignore them until you have a reason not to.

## How do you write your first hook?

Start with the most useful one, which is running your formatter after every edit. Open .claude/settings.json, add the PostToolUse block from above, save, and restart Claude Code so it loads the new config. The next time Claude writes a file, prettier runs on it before you ever see the result.

Once that works, write a guardrail. Say you never want Claude running a destructive delete. A PreToolUse hook on Bash can inspect the command and stop it:

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')
if echo "$COMMAND" | grep -q 'rm -rf'; then
  echo "Blocked: rm -rf is not allowed here" >&2
  exit 2
fi
exit 0
```

Point a PreToolUse hook with `"matcher": "Bash"` at that script. Now any `rm -rf` Claude tries gets stopped before it runs, and Claude is told why. Two small files later, your sessions are both tidier and safer.

## How does a hook approve or block an action?

A command hook talks back through its exit code. Exit 0 means success, and Claude Code parses anything you printed to stdout as JSON for extra instructions. Exit 2 is a blocking error: the action is stopped and whatever you wrote to stderr becomes the reason Claude sees. Any other exit code is a non-blocking error that gets logged while the run continues.

For finer control, a hook can return JSON instead of leaning on the exit code alone. A PreToolUse hook can print a hookSpecificOutput object with a "permissionDecision" of "deny", "allow", or "ask", plus a "permissionDecisionReason" that Claude reads back. That is how the rm example could explain itself in a sentence rather than just failing silently. The input side is symmetrical: every hook receives the session_id, the cwd, the hook_event_name, and for tool events the tool_name and tool_input, all as one JSON object, so the script has the full context of what it is reacting to.

## Hooks, CLAUDE.md, or a skill: which one do you reach for?

Reach for a hook when something must happen deterministically, and reach for a prompt-based instruction when you want judgment. That is the dividing line, and getting it backwards is the most common hooks mistake.

A rule in [CLAUDE.md](/blog/agents-md) or a [Claude skill](/blog/what-are-claude-skills) is read by the model and applied with discretion, which is what you want for "prefer functional components" or "match the existing test style." A hook has no discretion, which is what you want for "format every file" or "never push to main." Use a hook for the floor you cannot afford to drop below, and a written rule for everything that is a matter of taste. If the cost of the model forgetting is a deleted database or an unformatted commit, encode it as a hook. If forgetting is merely annoying, a written rule is lighter and far easier to change later.

## Where hooks stop, and a control plane begins

Hooks are excellent at the single-session, single-machine layer, and they run out of room the moment the work leaves your laptop. A PostToolUse hook can ping Slack when Claude finishes a task. It cannot judge whether the thing Claude finished is safe to send to a customer, and it cannot pause a scheduled run at 3am to wait for your sign-off.

That ceiling shows up fast once you start [scheduling Claude Code](/blog/schedule-claude-code) to run on its own. A hook fires inside one session, on one computer that has to be awake. An agent running unattended needs more than a per-session trigger: the result has to land somewhere you actually read, a step that would send or publish something has to stop and wait for one tap, and any risky action has to be gated whether you are watching or not. This is the seam [implexa](/) sits in. It is a control plane for agents that run inside your own Claude or Codex, so your hooks keep doing their job at the session level while approval and delivery happen at a level a settings.json file was never built to reach. Hooks are the reflexes. The control plane is the nervous system.

## FAQ

### Do I need to restart Claude Code after adding a hook?

Yes. Claude Code reads settings.json when a session starts, so a hook you add mid-session will not fire until you restart or open a new session. If a hook seems to be ignored, a stale session is the first thing to check.

### What is the difference between PreToolUse and PostToolUse hooks?

PreToolUse fires before a tool runs and can block it, which makes it the right place for guardrails like stopping a dangerous command. PostToolUse fires after a tool succeeds, which makes it the right place for follow-up work like formatting a file or running tests. One gates, the other reacts.

### Can a Claude Code hook stop Claude from doing something?

Yes. A PreToolUse command hook that exits 2 blocks the tool call and passes its stderr back as the reason, and a hook that returns a "permissionDecision" of "deny" does the same with a cleaner explanation. This is how teams block pushes to main, deletes outside a sandbox, or edits to protected files.

### Are hooks the same as MCP servers?

No. An MCP server gives Claude new tools to call when it decides to, while a hook is logic you run around Claude's actions whether or not it wants you to. They compose: an mcp_tool hook can even call an MCP server as its handler. If you are weighing the two for a job, [Claude Skills vs MCP](/blog/claude-skills-vs-mcp) covers the broader choice.

### Where should I store my hook scripts?

Keep project hooks in a .claude/hooks/ folder committed with the repo, and reference them from .claude/settings.json with the ${CLAUDE_PROJECT_DIR} variable so the path resolves on every machine. Personal hooks you want across all projects belong under ~/.claude instead.
