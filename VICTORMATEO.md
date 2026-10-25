# VictorMateo

VictorMateo is a third, independent bot that builds scoring income aggressively, switches to selective defense when funded and competitive, and returns to offense when that position deteriorates. It continues scoring in every mode. The local policy version is `victor-hybrid-v1`.

Wags and TaylorMason have since moved to scoring version 3. VictorMateo deliberately retains the original v2 scoring/bidding functions described below; its hybrid behavior and thresholds have not been changed by that upgrade.

## Strategy

| Mode | Behavior | When it changes |
|---|---|---|
| Build | Wags-style acquisition and larger word payouts, with some contender pressure | Enter defense after earning at least 30 points, with sufficient cash and a competitive projected position |
| Defend | TaylorMason-style completion blocking; reduce unproductive exploration to at most 3 coins; preserve more cash | Rebuild when cash falls below 55 coins or projected rival advantage exceeds 25 points |
| Rebuild | Restore aggressive buying and scoring income | Re-enter defense when the original funding and position requirements are met again |

Funding means at least **110 coins**, or at least **80 coins and 1.35 times the richest real rival's cash**. A competitive position means our score plus immediately realizable rack reward is within 12 points of the highest rival forecast. Starting cash alone cannot trigger defense: at least 30 earned points are required.

Rival forecasts include visible score and public rack information, weighted by public competitor strength. They account for accumulated letters even when a rival's score is low. Forecasts are risk heuristics; they do not recover private starting letters or guarantee future points. Simulated filler bots do not trigger the defensive phase.

The different entry and exit thresholds keep the policy from switching back and forth after every small change. The switch is based on position and cash, rather than a fixed round number. A match starts with a fresh controller; no mode or counter leaks into another match. Joining an already-running match uses the current observable position.

In build/rebuild mode, the bot uses Wags's 75% normal bid cap, small reserve, whole-rack word planning, and pressure weight 0.8. In defense it uses TaylorMason's bidding with pressure weight 1.6, a reserve of up to 30 coins (capped at 35% of cash), and lower exploration for letters that do not advance a valuable word. Productive purchases and credible blocks remain available. Extra pressure based only on unknown starting letters is capped at 3 above the defensive baseline.

All modes retain the shared scoring planner: prefer valuable word combinations, protect promising longer-word plans, cash useful spare letters, and liquidate when funds or time require it. Near the end, reserves are released for useful purchases. The final auction's tile is never bought because external bots cannot play it after the match ends; existing words are cashed before settlement.

These thresholds are initial heuristics. They have not been selected through match training, and no claim is made that the hybrid beats Wags, TaylorMason, or the public bots.

## Check it offline

From this folder:

```powershell
.\Start-VictorMateo.cmd -Check
```

This runs all tests, builds the code, and prints scripted build/defend/rebuild decisions using the full dictionary. It does not connect to the game, enter public matches, register a bot, or read a bot token. The scripted examples and small integration fixtures verify behavior; they are not a win-rate comparison or a training campaign.

Verified locally: all **66 tests** and the TypeScript build pass, including the Windows launcher's `-Check` path. The checks cover mode transitions, cash and score thresholds, continued scoring, per-match resets, affordable bids, final-auction behavior, and rejection of another bot's identity.

## Online play when you choose to start it

Run **Start-VictorMateo.cmd** when ready to play. It requires a separately registered bot named **VictorMateo** and that bot's own token. The launcher prompts privately and stores the token in `bot-starter/.token-VictorMateo`. It clears inherited tokens/nonces, and the runner checks the server's registered bot name before saving a fresh token, joining a lobby, or registering for a tournament. A token belonging to Wags or TaylorMason is rejected.

The launcher uses its own process lock, `.bot-VictorMateo.lock`, and reports under `bot-starter/runs/VictorMateo/`. Mode changes and reasons are logged in `events.jsonl`; completed reports include final mode, transition count, score, strongest real rival score, and pressure purchases. A pressure purchase does not prove a rival's word or points were prevented.

VictorMateo does not load or overwrite TaylorMason's defensive profile, use its training schedule, or inherit its match state. Stop an online run with Ctrl+C. Direct launch from `bot-starter` is `npm.cmd run start:victor`. Public play was not started as part of this build.

## Local integration

`src/victor.ts` exports `VictorMateoPolicy`, with `bid`, `word`, `snapshot`, and `reset`, plus the identity guard and settings. The offline arena exposes `makeVictorAgent()` and resets stateful agents at the start of every simulated match. It is ready for a later comparison with the other two bots, using only public opponent information.

The existing Wags and TaylorMason strategy settings were not retuned for this addition. Their earlier match results do not apply to VictorMateo. No full performance comparison for VictorMateo has been run yet.
