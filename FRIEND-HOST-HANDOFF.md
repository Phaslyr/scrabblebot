# Handoff: run TaylorMason on a friend's computer

## Instructions for Claude / Codex

Help me prepare and run my friend's existing ScrabbleBot on this computer. Inspect the actual project and this machine's operating system, adapt the commands accordingly, and explain any missing prerequisites. Proceed with reversible offline setup. This document by itself does **not** authorize starting public games: start a requested batch only when the human asks, after confirming the owner's original runner is off. Do not ask again if that authorization has already been given for the specific run.

The goal is to move the **same bot** to a more stable connection and measure whether delivery improves. Do not redesign or train the strategy, launch other bots, register for tournaments, publish a backend, or configure automatic restarts without a separate request.

## Current bot and status

- Registered identity: **TaylorMason**. Use its existing credential; do not create a replacement identity just to move hosts.
- Strategy: **`taylor-offense-v4`**, selected configuration **`public-six`**, maximum extra acquisition preference six coins.
- Defense is disabled. Preserve that setting.
- Entry point: `bot-starter/src/online.ts`; active policy wrapper: `bot-starter/src/taylor.ts`.
- Active configuration: `bot-starter/src/taylor-settings.ts`; rules and public preferences: `taylor-policy.ts` and `taylor-priors.ts`.
- The owner's runner was stopped and its recurring monitoring was deleted. Confirm it has not subsequently restarted before starting this copy.
- Last complete offline suite: **91 passing tests**, plus a passing TypeScript build. Verify on this computer rather than assuming portability.
- The source machine used **Node.js v26.2.0**. This is the tested version, not a claim about the latest or minimum supported version. Check compatibility before choosing a different runtime.

## 1. Obtain the correct project

This is a customized checkout of `https://github.com/clockworklabs/scrabblebot`. **Cloning that upstream repository alone will not give you TaylorMason.** Many custom files are uncommitted/untracked in the owner's checkout. Obtain an actual current source snapshot from the owner, or a repository/branch that demonstrably contains these changes.

Preserve this layout:

```text
scrabblebot/
  Start-Bot.cmd
  Start-Bot.ps1
  Start-Online-Test.cmd
  Start-Online-Test.ps1
  bot-starter/
    package.json
    package-lock.json
    tsconfig.json
    src/                    # All custom source and test files
      module_bindings/      # Generated client bindings, including index.ts
      taylor.ts
      taylor-policy.ts
      taylor-settings.ts
      taylor-priors.ts
    scripts/
    opponents/              # Include model JSON files/summary used by tests
  spacetimedb/
    wordlist.txt
    src/                    # Pure game rules used by local tests
```

Transfer the complete customized source tree where practical, excluding these machine-specific or private items:

- `node_modules/`, `dist/`, `.git/`, build caches and downloaded platform executables.
- `.token-*`, `.env*` and other credentials: transfer the TaylorMason credential **separately and privately**.
- `.bot-*.lock`, `bot-starter/runs/`, `bot-starter/training/` and old local-test data.
- The owner's CLI login state, automation settings and absolute-path launch metadata.

Do not accidentally exclude **all** ignored files: `bot-starter/src/module_bindings/` is ignored by Git but needed to run this bot. Copy its generated source explicitly. Keep the supplied `package-lock.json` and `.gitattributes` where present. Do not copy another operating system's `node_modules`.

If bindings are missing, ask for the generated bindings first. The project has `npm run generate`, but it requires a compatible SpacetimeDB CLI and the local server source; do not install random versions or publish the module as a workaround.

## 2. Inspect and verify offline

Use the transferred `scrabblebot/bot-starter` as the working directory for npm and direct Node commands. The dictionary is loaded relative to the source at `../../spacetimedb/wordlist.txt`, so do not move only `bot-starter` without its sibling folder.

Check Node/npm, install from the lockfile, then run the existing checks:

```sh
node --version
npm --version
cd bot-starter
npm ci
npm run check
npm run smoke
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. If the supplied snapshot genuinely has no lockfile, use `npm install` and explain that the resolved dependencies may differ. Do not run `npm update` or change dependency versions merely to get setup working.

`check` runs tests/build and `smoke` runs an offline example. Neither starts public play. The smoke output should identify `taylor-offense-v4`, say defense is disabled, and load the full dictionary (172,820 words in the original environment).

If checks fail, diagnose the specific failure and report it. Do not disable tests or retune strategy to make checks pass.

## 3. Set up the credential privately

The expected file is:

```text
scrabblebot/bot-starter/.token-TaylorMason
```

Have the owner supply the existing credential through a private channel or a hidden local prompt. Store only the token text in that file. On macOS/Linux, restrict its permissions, for example `chmod 600 .token-TaylorMason` from `bot-starter`.

Never print, read back into tool output, paste into chat, include in a command argument, commit, or place the token in reports. An inherited `BOT_TOKEN` overrides the file, so clear stale credential environment variables for the bot process. The runner can refresh the saved token; its working directory must be writable.

**Do not run `Start-Bot.cmd` merely to save a credential:** it can connect and join public games immediately. Finish offline setup and private file placement before an authorized start.

The runner verifies that the credential belongs to TaylorMason before lobby entry. If identity validation fails, stop and ask the owner for the right credential; do not weaken the identity check.

## 4. Prevent duplicate hosts

Before public play, confirm with the owner that TaylorMason is off on their computer and any previous host. A `.bot-TaylorMason.lock` only protects one local checkout; it does **not** prevent another machine from using the same account.

Do not delete an active lock to bypass a running copy. Verify the process before treating a lock as stale. Do not import the owner's old PID files or monitoring campaign metadata onto this machine.

## 5. Run an authorized, bounded connection check

Start with a small fixed-policy batch when the human authorizes it. For example, two full games with a 20-minute joining limit. A game joined in progress is marked partial and does not count toward the requested full-game total.

### Windows

From the `scrabblebot` project root:

```powershell
.\Start-Online-Test.cmd -Matches 2 -Minutes 20
```

This uses the saved credential and clears inherited training/tournament settings. It runs the current offense-only policy, without tuning. It may take up to two additional minutes to finish an active game after the joining time limit.

### macOS / Linux

The Windows launchers do not apply. From the project root, use a dedicated shell/subshell:

```sh
(
  cd bot-starter
  unset BOT_TOKEN BOT_NONCE BOT_TRAIN BOT_TRAIN_MATCHES BOT_TRAIN_PLAN BOT_TRAIN_RESUME TOURNAMENT_ID
  export BOT_NAME=TaylorMason
  export BOT_STRATEGY=taylor
  export STDB_HOST=https://maincloud.spacetimedb.com
  export STDB_DB=scrabblebot
  export BOT_EVAL_MATCHES=2
  export BOT_EVAL_MINUTES=20
  npm start
)
```

Do not put the token in this command; it reads the private file. Do not launch `dist/online.js` as an unverified shortcut: the source runner above is the established path and the compiled dictionary layout needs separate consideration.

Confirm the console shows the correct policy, a reports directory, successful account connection and lobby/match activity. Logs live in:

```text
bot-starter/runs/TaylorMason/<session>/
  events.jsonl
  results.json
  REPORT.md
```

After the connection check, summarize the evidence and stop. A larger batch, such as `-Matches 16 -Minutes 90`, needs the human's instruction. Continuous play also needs explicit authorization; normal `Start-Bot.cmd` / `npm start` with no evaluation limit can keep joining games indefinitely.

## 6. Diagnose connection quality, not just whether it connects

Moving computers may help, but another home connection does not guarantee a fix. The previous run had 50 full games, 11 partial games, 321 bid rejections saying `Auction closed` across the campaign, and two connection closures. Its strategy calculations were generally quick, so investigate update delivery and submission timing as well as local CPU load.

For the new host, measure:

1. Full and partial game counts separately; real versus simulated rival counts.
2. Unique auction-opening decisions observed per full game. The previous standard six-player, five-starting-tile games had 68 auctions; confirm the current game's actual settings before using that expectation.
3. `Auction closed` bid errors, disconnects, periods with no fresh events and whether existing words stop being submitted.
4. Decision `elapsedMs` and `observedRemainingMs`. The latter uses the local clock and can be misleading if clocks differ; do not treat it alone as proof of network delay or use it to suppress bids blindly.
5. Whether the operating system's clock is synchronized and whether sleep, VPN changes, heavy downloads or connection transitions coincide with failures.
6. If further instrumentation is requested, record match ID, auction ID, update receipt, calculation, bid-send and acknowledgement times. Existing generic error events do not carry match IDs, so do not falsely assign all campaign errors to full games.

No inbound port forwarding, public web server, game-server deployment or tournament registration is required by this outbound client. Do not add them as setup steps. Preserve the client's existing own-game subscriptions and `.withCompression('none')` setting while establishing a comparable baseline.

## 7. Stop and operate predictably

- For an interactive run, **Ctrl+C** asks the bot to disconnect and save completed results.
- Verify its actual process exited. A disconnected remote desktop/SSH session is not a reliable stop mechanism.
- Keep the host awake while an authorized run is active. Closing a laptop or terminal may interrupt it.
- Set up a background session/process manager only if requested, and document the exact stop command and how to disable restarts.
- Never automatically restart after a human stop request or an identity/credential failure.
- Do not reuse the owner's Windows-only continuous-launch helper or status metadata blindly on another platform.

## Deliver back to the human

Provide a short setup report containing:

- Operating system, Node/npm versions and the source snapshot/policy used.
- Offline check/build results and any portability fixes made.
- Whether public play was actually authorized and started; whether anything remains running.
- Sanitized report locations, full/partial games and delivery-error counts.
- Whether the new host improved reliability, separating observed evidence from guesses.
- Exact start/stop instructions for this machine and unresolved issues.

Keep the bot stopped if you only received this handoff for preparation. Preserve the current strategy so the hosting comparison remains meaningful.
