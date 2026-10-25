# Wags

Wags uses aggressive acquisition, planned word payouts, and pressure on proven contenders. It now protects valuable longer words instead of automatically fragmenting them into short words. See `BOT-STRATEGIES.md` for the shared planning and defense rules. The settings are heuristics; local comparisons do not establish online strength.

## Strategy

- Version 3 exploration bids start at 13 for common letters, 9 for other letters, and 8 for J/Q/X/Z, before rack-balance and duplicate adjustments. Valuable completions can justify higher bids.
- Normal bids can use up to 60% of cash, preserving up to six coins. Useful endgame purchases can use up to 95%; the final unusable tile receives no bid.
- The planner compares multiple-word payouts and protects promising seven-to-nine-letter goals one or two tiles away. Common missing letters receive more weight than scarce ones; impossible repeated rare-tile goals are excluded.
- Large available words are cashed promptly. Low cash (16 coins or less), five or fewer auctions remaining after the current one, progress of at least 92%, or a rack of at least 13 tiles triggers liquidation. Spare letters can be cashed while a goal is retained. A meaningful bid can protect an immediate completion until the current usable auction settles.
- Purchases are valued after removing the words expected to be cashed before settlement. Expected income does not increase the opening bid budget.
- After a confirmed play and an updated rack, it immediately looks for another word. A 100 ms fallback poll keeps it responsive. Only one word submission can be pending for a match, and the same confirmed rack revision is not replayed.
- Rival pressure focuses on the two leading projected threats. The dual-use premium is at most three coins; a separate credible-block valuation can justify a larger increase within the 15% extra-pressure budget. Uncertain pressure is capped at one. Live public leaderboard records override refreshed local priors. Unknown starting letters are never presented as known words.

## Offline check

From this folder:

```powershell
.\Start-Wags.cmd -Check
```

This runs the tests, build, and an offline behavior example. It does not connect to the game or simulate matches.

## Online play when you choose to start it

Double-click **Start-Wags.cmd**. It prompts privately for Wags's own bot token on the first run, then saves it as `bot-starter/.token-Wags`. Subsequent starts reuse that file. Keep the window open and use Ctrl+C to stop it.

Wags needs a separate registered bot named **Wags** and its corresponding team token. The local build does not create that registration. In the normal website flow, that requires a separate team/account identity. The runner checks the registered bot name and refuses a token belonging to TaylorMason before joining a lobby. The launcher does not reuse an inherited token from another bot.

Logs and reports are kept under `bot-starter/runs/Wags/`. Wags does not load or overwrite TaylorMason's saved defensive profile. The two strategies can be maintained independently.

Its reusable strategy is `bot-starter/src/wags.ts`, exporting `decideWagsBid`, `chooseWagsWord`, and `prepareWagsDictionary`, backed by `scoring-v3.ts`. The direct command-line entry is `npm.cmd run start:wags` from bot-starter. The existing TaylorMason launcher continues to select defensive mode.
