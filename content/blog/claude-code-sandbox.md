---
title: "Claude Code sandbox: run agents without the prompts"
slug: "claude-code-sandbox"
description: "Claude Code sandbox runs Bash inside OS-level filesystem and network isolation, so most run without a permission prompt. How it works and what it misses."
publishedAt: "2026-07-13"
tags: ["claude-code", "sandbox", "security", "automation", "permissions"]
---

The first time Claude Code stops to ask whether it can run `npm test`, you approve it. The fortieth time, you stop reading the prompt and just hit approve, which is the exact moment the permission stopped protecting you. The Claude Code sandbox exists to break that loop. It runs Bash commands inside an operating-system boundary that decides what a command can touch, so Claude can run your build, your tests, and most of your shell work without asking, and you only hear about it when a command tries to reach past the fence.

We run Claude Code unattended at implexa, hundreds of scheduled agent runs a week with nobody at the keyboard, and this is the feature that makes those runs finish instead of hanging on an approval dialog at 3am. The sections below walk through what the sandbox actually does, grounded in the [official sandboxing docs](https://code.claude.com/docs/en/sandboxing), and where it stops.

## What is the Claude Code sandbox?

The Claude Code sandbox is a built-in mode that runs Bash commands inside OS-enforced filesystem and network isolation instead of gating each one behind a permission prompt. You open it with the `/sandbox` command, pick a mode, and from then on most commands run against a boundary the operating system enforces rather than a rule the model chose to respect. It leans on primitives that already ship with your machine: Seatbelt on macOS, [bubblewrap](https://github.com/containers/bubblewrap) on Linux and WSL2. Native Windows is not supported, so on Windows you run Claude Code inside a WSL2 distribution. As of mid-2026 the feature is a beta research preview, which matters when you decide how much weight to put on it.

The important word is enforced. A permission rule is checked before a command runs, based on the command string. The sandbox holds while the command runs, so it applies to the script, the tool that script calls, and every subprocess underneath, even when an innocent-looking command does more than its name suggests.

## What problem does the sandbox solve?

It solves approval fatigue, and Anthropic puts a number on it: sandboxing reduces permission prompts by 84%. The reasoning is honest about human nature. Constantly clicking approve slows the work down, and worse, it trains you to stop looking, so the prompts that were supposed to keep you safe quietly become noise. Move the boundary from a per-command question to an OS-level fence and Claude can work freely inside the fence while you get pulled in only when something reaches for the outside.

That trade is the whole pitch for autonomous agent work. An agent that has to ask before every command is not really autonomous, it is a very slow pair programmer. An agent inside a sandbox can run a full test suite, install packages, and iterate on a fix for twenty minutes, and the only thing that interrupts it is a genuine attempt to leave the yard.

## How does filesystem isolation work?

By default, a sandboxed command can write to the current working directory, its subdirectories, and the session temp directory, and nothing else. It can read almost everything on the machine. Try to modify `~/.bashrc`, a binary in `/bin`, or anything outside the project, and the write is blocked until you grant it. Claude Code points `$TMPDIR` at the session temp directory so tools that scribble temporary files just work.

When the defaults are too tight, you widen them in `settings.json`. Granting a subprocess write access to a path outside the project takes one key, `sandbox.filesystem.allowWrite`, for example `"allowWrite": ["~/.kube", "/tmp/build"]`. There are matching `denyWrite`, `denyRead`, and `allowRead` keys, and because the OS enforces them, they reach `kubectl`, `terraform`, `npm`, and anything else the command spawns, not just Claude's own file edits.

## How does network isolation work?

Network access runs through a proxy that sits outside the sandbox, and no domains are allowed by default. The first time a command reaches for a new host, Claude Code prompts you. Say yes once and that host is open for the rest of the session. If you already know the domains a job needs, pre-clear them with `network.allowedDomains` and skip the prompt entirely. For a locked-down deployment, an administrator can set `allowManagedDomainsOnly` so unapproved domains are blocked outright instead of prompting.

Filesystem and network isolation are a matched pair, and the docs are blunt that you need both. Drop network isolation and a compromised command can read your SSH keys and mail them out. Drop filesystem isolation and it can plant something in a startup file and get its network access that way. Widen one side and you want to check you have not just handed the other side a way around.

## What are the two sandbox modes?

There are two: auto-allow and regular permissions, and the difference is only whether sandboxed commands need your sign-off. In auto-allow mode, anything the sandbox can contain runs without a prompt, and commands it cannot contain fall back to the normal permission flow. In regular-permissions mode, the isolation is still on but you still approve each command, which trades speed for a closer eye.

Auto-allow is not a blank check. Explicit deny rules always win. An `rm` aimed at `/` or your home directory still stops you. A content-scoped ask rule like `Bash(git push *)` still forces a prompt, because pushing to a remote is exactly the kind of thing you want to confirm even when the command itself is contained.

## How do you turn the sandbox on?

Run `/sandbox` inside a session and pick a mode on the Mode tab. That writes to your project's `.claude/settings.local.json`, which is not checked into git. To turn it on everywhere, set `sandbox.enabled` to `true` in your user settings at `~/.claude/settings.json`. To require it across a team, deliver the same keys through managed settings so a developer cannot quietly turn it off.

On macOS there is nothing to install. On Linux and WSL2 the sandbox needs two packages, `bubblewrap` for filesystem isolation and `socat` for the network relay:

```bash
sudo apt-get install bubblewrap socat
```

The `/sandbox` panel has a Dependencies tab that tells you what is missing, so you do not have to guess. For a deployment that treats the sandbox as a hard security gate rather than a nicety, set `sandbox.failIfUnavailable` to `true` and Claude Code refuses to start rather than silently falling back to running commands in the open.

## The credential gap worth knowing about

The default read policy still lets sandboxed commands read your credential files, and that surprises people. Filesystem isolation blocks writes outside the project, but reads cover almost the whole disk, `~/.aws/credentials` and `~/.ssh` included. So a command that has no business touching your AWS keys can still open them, and if the network side is loose, that is a path out.

The fix is the `sandbox.credentials` block, added in Claude Code v2.1.187. List the files to deny and the environment variables to strip:

```json
{
  "sandbox": {
    "enabled": true,
    "credentials": {
      "files": [
        { "path": "~/.aws/credentials", "mode": "deny" },
        { "path": "~/.ssh", "mode": "deny" }
      ],
      "envVars": [
        { "name": "GITHUB_TOKEN", "mode": "deny" }
      ]
    }
  }
}
```

There is a cleverer `"mode": "mask"` for tokens you still need working, where the command sees a placeholder and the proxy swaps in the real value only on the way to an approved host, so `gh` keeps authenticating while nothing Claude runs ever holds the real token. This is the part that lines up with how we think about trust at implexa: an agent should be able to do its job without ever holding the keys to your accounts.

## What the sandbox does not protect against

Plenty, and the docs say so plainly: the sandbox reduces risk, it is not a complete isolation boundary. Three limits are worth carrying in your head. The proxy does not inspect TLS by default, so a broad allow like `github.com` can become an exfiltration route through techniques such as domain fronting. The isolation only covers Bash subprocesses, so Read, Edit, and Write use the permission system directly, and computer use drives your real desktop with no sandbox at all. And some tools simply do not cooperate: `docker` and `watchman` are incompatible, and Go-based CLIs like `gh` and `gcloud` can fail TLS checks under Seatbelt on macOS, so you list them in `excludedCommands` and run them outside.

None of that makes the sandbox pointless. It makes it a strong layer rather than a wall, best paired with permission rules and hooks instead of asked to stand alone.

## How we use the sandbox at implexa

We treat it as the floor under unattended runs, not the whole safety story. A scheduled agent runs with the sandbox on and its credential files denied, so a run that goes sideways is contained to the project directory and a short list of domains. Above that sits [settings.json](/blog/claude-code-settings-json) for the permission allowlist and [hooks](/blog/claude-code-hooks) for the hard floors we cannot cross, like blocking a push to main. It is the same instinct behind [plan mode](/blog/claude-code-plan-mode), which keeps the model in a read-only sandbox while it drafts an approach. The sandbox is one clean layer in that stack. If you are moving toward [scheduled, hands-off runs](/blog/schedule-claude-code), turning it on is one of the higher-leverage things you can do, and it takes about a minute.

## FAQ

### What is the Claude Code sandbox?

It is a built-in mode that runs Bash commands inside OS-enforced filesystem and network isolation, so Claude Code can run most commands without a permission prompt while the operating system keeps them inside a defined boundary.

### How do I enable the sandbox in Claude Code?

Run `/sandbox` in a session and pick a mode, or set `sandbox.enabled` to `true` in `~/.claude/settings.json` to turn it on for every project. On Linux and WSL2, install `bubblewrap` and `socat` first.

### Does the Claude Code sandbox work on Windows?

Not natively. It runs on macOS, Linux, and WSL2. On Windows you run Claude Code inside a WSL2 distribution, and WSL1 is not supported because the sandbox needs kernel features only WSL2 has.

### Can a sandboxed command still read my API keys?

Yes, by default. Filesystem isolation blocks writes outside the project but read access covers most of the disk, including `~/.aws/credentials` and `~/.ssh`. Use the `sandbox.credentials` block to deny those files and unset secret environment variables.

### Is the sandbox a replacement for permissions?

No. Permission rules decide which tools run before they run, the sandbox restricts what a Bash command can reach once it runs, and hooks enforce the lines you never cross. They are complementary layers, and running all three is how you get autonomy without giving up control.
