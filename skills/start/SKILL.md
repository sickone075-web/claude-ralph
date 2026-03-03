---
name: ralph-start
description: "Start the Ralph autonomous agent loop. Use when you want to launch Ralph to work through PRD stories. Triggers on: start ralph, ralph start, launch ralph, run ralph loop."
user-invocable: true
---

# Ralph Start

Start the Ralph autonomous agent loop in the background.

## Usage

```
/ralph-start
/ralph-start --tool claude --iterations 5
/ralph-start --timeout 45
```

## Parameters (all optional)

- `--tool <amp|claude>` - AI tool to use (overrides config default)
- `--iterations <N>` - Max iterations (overrides config default)
- `--timeout <minutes>` - Per-iteration timeout in minutes (overrides config default)
- `--webhook <url>` - Feishu webhook URL for notifications (overrides config default)

## The Job

Follow these steps exactly:

### Step 1: Check if Ralph is already running

Read the file `scripts/ralph/.ralph-pid` using the Read tool.

- If the file exists, extract the PID number from it
- Run `kill -0 <PID> 2>/dev/null && echo "alive" || echo "dead"` via Bash tool
- If the process is alive: report "Ralph is already running (PID: <PID>). Use /ralph-stop to stop it first." and **stop here**
- If the file doesn't exist or the process is dead: continue

### Step 2: Read global config

Read `~/.ralph/config.json` using the Read tool. If the file doesn't exist, use built-in defaults.

Extract these fields (with defaults):
- `defaultTool` (default: `amp`)
- `defaultMaxIterations` (default: `10`)
- `timeoutMinutes` (default: `30`)
- `webhookUrl` (default: empty)

### Step 3: Apply parameter overrides

If the user provided arguments (e.g., `/ralph-start --tool claude --iterations 5`), parse them and override the config values:
- `--tool <value>` overrides `defaultTool`
- `--iterations <value>` overrides `defaultMaxIterations`
- `--timeout <value>` overrides `timeoutMinutes`
- `--webhook <value>` overrides `webhookUrl`

### Step 4: Check PRD status

Read `scripts/ralph/prd.json` using the Read tool.

- Count total stories and stories where `passes: false`
- If all stories have `passes: true`: report "All stories are complete! Nothing to do." and **stop here**

### Step 5: Print launch summary

Output a summary to the user:

```
## Ralph Launch Summary

- Tool: <tool>
- Max Iterations: <iterations>
- Timeout: <timeout> minutes
- Webhook: <url or "not configured">
- Stories: <pending>/<total> remaining

Starting Ralph...
```

### Step 6: Launch Ralph in background

Build and execute the command using the Bash tool with `run_in_background: true`:

```bash
bash scripts/ralph/ralph.sh --tool <tool> --timeout <timeout> [--webhook <url>] <iterations>
```

- Only include `--webhook <url>` if a webhook URL is configured
- Use `run_in_background: true` on the Bash tool so Ralph runs in the background

### Step 7: Confirm launch

Report to the user: "Ralph has started! Use /ralph-stop to stop it, or monitor progress in the Dashboard."
