---
title: "What is the Claude Agent SDK, and do you need it?"
slug: "claude-agent-sdk"
description: "The Claude Agent SDK lets you run Claude Code's agent loop inside your own app. What it is, how it differs from the Claude API, and when you actually need it."
publishedAt: "2026-07-06"
tags: ["claude-agent-sdk", "claude-code", "ai-agents", "anthropic", "developers"]
---

# What is the Claude Agent SDK?

The Claude Agent SDK is a library that lets you run the same agent loop that powers Claude Code from inside your own Python or TypeScript program. Instead of typing into a terminal and watching Claude read files, run commands, and edit code, you call a function, stream the messages back, and embed that whole loop in a product, an internal tool, or a pipeline that runs with nobody watching. It is the packaged version of the thing Claude Code has been doing all along.

It used to be called the Claude Code SDK. Anthropic renamed it to the Claude Agent SDK in late 2025, and the rename is the tell: this was never just a wrapper around the CLI. It is the agent runtime, exposed as code, and you can point it at jobs that have nothing to do with software.

Most people who search for it do not actually need it yet. That is worth saying up front, because the tutorials rarely do. If your goal is to get an agent doing one recurring job for you, there is a shorter path, and I will get to where the SDK stops being overkill.

## What is the Claude Agent SDK, exactly?

It is a code library that gives you Claude Code's agent loop as a function you call. The loop is the part that matters: Claude picks a tool, runs it, reads what came back, and decides the next move, over and over, until the job is done or it hits something it cannot handle. You do not write that loop. The SDK ships it, along with built-in tools for reading files, running shell commands, editing code, and searching, so an agent can start working the moment you install it.

Two things come in the box that people underrate. The first is context management: the SDK handles what stays in the model's working memory across a long task, so you are not manually stuffing and trimming a prompt. The second is tool execution. When Claude decides to run `Bash` or edit a file, the SDK actually carries that out and feeds the result back, which is the plumbing that turns a chat model into something that acts.

The Python package is `claude-agent-sdk` and imports as `claude_agent_sdk`. The TypeScript package is `@anthropic-ai/claude-agent-sdk`. Python needs 3.10 or newer, and both paths expect Node 18+ with the Claude Code CLI installed, because the SDK drives the same underlying binary.

## How is the Agent SDK different from the Claude API?

The Claude API is a function that returns a value. The Agent SDK is a process that keeps running until a goal is reached. That is the whole difference, and it is bigger than it sounds.

With the raw API, you send messages and get a response. If you want the model to use a tool, you get back a request to call that tool, you run it yourself, you append the result, and you send the whole thing again. You are hand-building the loop, the tool execution, and the memory. For a single question that is fine. For a task with fifteen steps and three dead ends, you are now maintaining an agent framework you did not set out to write.

The Agent SDK owns that loop for you. Claude decides when to call a tool, the SDK runs it, the result comes back, and the cycle continues without you orchestrating each turn. You describe the job and the tools it is allowed to touch; the SDK handles the back-and-forth. If you have ever written a `while` loop around the Claude API to keep it going until a task finished, the SDK is that loop, done properly, with subagents and sessions layered on top.

## Is the Agent SDK the same thing as Claude Code?

Under the hood, yes; in how you use it, no. Claude Code is the agent loop wrapped in an interactive terminal for a human. The Agent SDK is the same loop wrapped in a function call for a program. They share the engine. What changes is who is driving, a person at a keyboard or your code.

This is why the SDK can do things that look like Claude Code and things that do not. You can build a coding agent with it, sure. You can also build a support triage bot, a research agent that files reports, or a nightly job that reviews pull requests, none of which involve a developer sitting there approving each step. The loop does not care whether the task is code. It cares whether you gave it clear instructions and the right tools.

## How do you use the Claude Agent SDK?

You install the package, call `query()` with a prompt, and iterate over the messages it streams back. The `query()` function is the entry point, and it returns an async stream of messages while Claude works. Here is the minimal Python version:

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py, then run the tests",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        print(message)

asyncio.run(main())
```

The `allowed_tools` list is the important line. It says which tools this agent may use, and it is also your safety boundary. An agent that can run `Bash` can run any shell command, so in a real deployment you scope it down, sometimes to a single command like `Bash(npm test)` rather than open shell access. Everything else, the streaming, the tool calls, the deciding-what-to-do-next, happens inside that one `query()` call.

From there you add the parts that make it production-grade: subagents that split a big job into focused workers, sessions that carry state across multiple runs, and Model Context Protocol (MCP) servers that connect the agent to outside systems like a database or a ticketing tool. If those terms are new, [Claude Code MCP](/blog/claude-code-mcp) and [Claude Code subagents](/blog/claude-code-subagents) cover the same building blocks from the CLI side, and they behave the same way through the SDK.

## When do you actually need the Agent SDK?

You need it when you are embedding an agent inside software you ship to someone else. You do not need it when you just want an agent doing a job for you. That line is the one the tutorials skip, and getting it right saves a lot of wasted effort.

Reach for the SDK when the agent has to live inside a product: a SaaS feature where your users trigger runs, an internal service other systems call, a CI stage that reviews every commit. In those cases you want the loop as a library you can wire into your codebase, deploy, and monitor. That is exactly what it is for.

Skip it when the agent is for your own work. If you have one weekly chore, a report to compile, an inbox to triage, a repo to keep tidy, you do not write a Python program around the SDK. You write the instructions once as a skill, a plain `SKILL.md` file, and run it in Claude Code. The loop is already there. Our [how to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude) walkthrough takes that route end to end, and [Claude Code skills](/blog/claude-code-skills) explains the file the agent actually runs. No SDK, no code, same underlying engine.

The honest test: are you the only person who will ever run this agent? If yes, the SDK is probably more machinery than the job needs. If other people or other systems will run it, the SDK is the right tool.

## Running an SDK agent unattended: the one gotcha

The moment you run an agent without a human watching, tool approval stops protecting you and starts blocking you. In an interactive session, Claude asks before it runs a tool and you click yes. In an unattended SDK run there is nobody to click, so an agent that hits an un-approved tool does not ask; it stalls. You have to pre-authorize the tools you trust, and scope them tightly, before the run starts.

This is the same wall people hit when they [schedule Claude Code](/blog/schedule-claude-code) to run on a cadence. Pre-authorize too little and the agent freezes on the first tool call. Pre-authorize too much, like open `Bash`, and an unattended agent can do real damage from one bad instruction. The fix is narrow allow-lists: name the exact commands and paths the job needs and nothing else. An agent that runs while you sleep is only as safe as the boundary you drew around it before you went to bed.

## What implexa does with this

implexa runs on top of exactly this machinery, so you do not have to touch the SDK to get a running agent. [implexa](/) is a control plane for agents that run inside your own Claude or Codex. You build an agent in plain English, it runs on the AI subscription you already pay for, and implexa handles the scheduling, the permission boundaries, and the record of what each run did. The agent loop underneath is the same one the Agent SDK exposes; the difference is you never open an editor. For a solo founder who wants agents doing real work without becoming an SDK developer, that is the point.

## FAQ

**Is the Claude Agent SDK free?**
The SDK itself is an open library, and you can use it with a Claude subscription or an API key. What you pay for is the model usage, either through your plan or per-token on the API. There is no separate license fee for the SDK.

**What languages does the Claude Agent SDK support?**
Python and TypeScript, officially. The Python package is `claude-agent-sdk` (Python 3.10+) and the TypeScript package is `@anthropic-ai/claude-agent-sdk`. Both drive the same Claude Code engine, so they need Node 18+ and the CLI installed.

**Is the Claude Agent SDK the same as the old Claude Code SDK?**
Yes. Anthropic renamed the Claude Code SDK to the Claude Agent SDK in late 2025 to reflect that it builds general agents, not just coding tools. If a tutorial references the Claude Code SDK, it is talking about the same library.

**Do I need the Agent SDK to build a Claude agent?**
No, not for personal or small-team use. Claude Code already is the agent runtime, so you can write a skill and run it there. The SDK is for when you are embedding the agent inside your own application. See [how to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude).

**Can the Agent SDK use MCP servers?**
Yes. The SDK connects to Model Context Protocol servers the same way Claude Code does, which is how you give an agent access to a database, a CRM, or any external tool. [Claude Code MCP](/blog/claude-code-mcp) covers what MCP is and how the connection works.

**What is the difference between the Agent SDK and Claude Code?**
They share the same agent loop. Claude Code wraps it in an interactive terminal for a person; the Agent SDK wraps it in a function call for a program. Same engine, different driver.

## Next reads

- [How to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude) for the no-code path when you do not need the SDK.
- [Claude Code skills](/blog/claude-code-skills) for the `SKILL.md` file an agent actually runs.
- [Claude Code MCP](/blog/claude-code-mcp) for connecting an agent to outside systems.
- [Claude Code subagents](/blog/claude-code-subagents) for splitting a big job across focused workers.
- [How to schedule Claude Code](/blog/schedule-claude-code) for running an agent on a cadence without a human.
