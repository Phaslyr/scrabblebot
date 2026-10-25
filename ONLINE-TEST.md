# Previous TaylorMason online test

This page records the earlier `scoring-pressure-v3` online test. That runner is stopped. TaylorMason now uses offense-only `taylor-offense-v4`; see [TAYLOR-OFFENSE-RESULTS.md](TAYLOR-OFFENSE-RESULTS.md). The online-test launcher has been updated to the new policy, but no new online batch was started during the remodel.

The recorded test used `scoring-pressure-v3`, the fixed `pressure` profile (weight 1.6), and the saved TaylorMason credential. It did not tune profiles, overwrite the saved training choice, or register for a tournament. The registered account name is checked before lobby entry.

The batch stops after eight full matches or a 90-minute joining limit, with up to two minutes to finish an in-progress match. A match already underway when the client connects is marked partial and does not count toward eight full matches. Real opponents and simulated filler seats are recorded separately.

The clean corrected session started at 2026-10-24 23:02 UTC. Its results and event log are under:

`bot-starter/runs/TaylorMason/2026-10-24T23-02-06-768Z/`

The [current report](bot-starter/runs/TaylorMason/2026-10-24T23-02-06-768Z/REPORT.md) is updated after completed games. Active process/session details are saved in `bot-starter/runs/online-test-launch.json`. The test was started from Codex; do not launch a second copy while its process lock is active.

For a future batch, [Start-Online-Test.cmd](Start-Online-Test.cmd) now runs offense-only TaylorMason, with defaults of eight full games and 90 minutes. In PowerShell, `./Start-Online-Test.ps1 -Matches 8 -Minutes 90` starts public play; Ctrl+C stops it and saves completed results. `-Check` runs offline verification without connecting. Current-policy results must be kept separate from the older results below.

## Corrected live counter

The server's `bagTotal` is the number of tiles remaining after the current draw, not the original bag size. The old online adapter subtracted the initial deal and round count again, causing premature endgame behavior. The corrected adapter, `remaining-bag-v2`, uses the server's remaining count directly and derives progress from that count plus the current round.

Startup integration sessions before 23:02 UTC are marked `EXCLUDED-STARTUP.json`. Their games are not valid evidence about the final setup. Earlier public statistics also mix previous implementations; use the clean session's report for the new evaluation.

The client now subscribes only to its own match history and requests uncompressed updates. This avoids the stalled update stream seen during startup. Authentication setup has a 45-second deadline. A `connected` event records the verified account identity; actual auction decisions are recorded separately.

Verified before restart: all 82 tests and the TypeScript build pass, including live/local counter parity over every round, fixed profile selection, match limits, partial-game exclusion, and credential-name checks. No bot token is stored in reports or launch arguments.
