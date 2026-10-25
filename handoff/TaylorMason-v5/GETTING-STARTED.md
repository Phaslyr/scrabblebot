> Current TaylorMason default: **taylor-median-v5**, frozen median buying candidate with v4 word timing and defense disabled. See FRIEND-HOST-HANDOFF.md for setup. Older policy/results below are historical.

# Your Cal Hacks ScrabbleBot

The bot is in `bot-starter/`. The original game and spectator app are included in this checkout, but you only need to run the bot.

## Play

1. Open [the competition site](https://launchpad-scrabblebot.vercel.app/account). This is the working URL linked in the repository's About section; the older `scrabblebot.vercel.app` address in the README currently returns 404.
2. If the account page says **anonymous**, double-click **Link-Account.cmd**, paste the public **Web identity** shown on the page, and sign in when the browser opens. Refresh the page afterward. This helper uses the project-local CLI, so you do not need to install another command globally.
3. Create or join your team at `/team/new`, then use **Generate token** at `/team`.
4. Double-click **Start-Bot.cmd** in this folder. Paste the token into the hidden prompt and press Enter.

Keep that window open while competing. The bot joins lobbies, plays matches, and rejoins after matches finish. Press Ctrl+C to stop it. Its token is saved in `bot-starter/.token-TaylorMason`, which Git ignores. Keep that file private.

To enter a tournament, get its numeric ID from the organizers, then run in PowerShell from this folder:

```powershell
.\Start-Bot.cmd -TournamentId 123
```

Replace `123` with the actual tournament ID. To use a different local name, add `-BotName your-bot-name` (this selects the local token file; the website controls your registered bot's name).

## Check it without an account

```powershell
.\Start-Bot.cmd -Check
```

This runs the tests, TypeScript build, and an offline example using the full dictionary. It does not join a match.

## Strategy

TaylorMason now uses **taylor-offense-v4**, with productive purchasing and small preferences for successful premium-word families and letters. It does not target rivals or make defensive bids. Wags retains its existing scoring-v3 strategy and contender pressure. Both plan payouts across the whole rack, retain promising long-word goals and cash words when funds are low. See `TAYLOR-OFFENSE-RESULTS.md` for the remodel and its 1,600-game local comparison.

TaylorMason's active entry point is `bot-starter/src/taylor.ts`, with settings in `taylor-settings.ts`, acquisition rules in `taylor-policy.ts` and public preferences in `taylor-priors.ts`. It retains the productive scoring and word timing in `scoring-v3.ts`, called with zero pressure. Wags and VictorMateo keep their existing engines. `defense.ts` and explicit weighted arena agents remain available for historical comparisons. No private opponent racks or live spectator bid views are used.

These are heuristics. `npm.cmd run test:local` uses the current TaylorMason and Wags policies. `test:upgrade` and `test:reframed` retain their historical v3/v2/v1 comparisons and do not evaluate the new TaylorMason remodel.

## Online fixed-policy practice

Double-click **Start-Training.cmd** to run a bounded batch of eight online practice matches with the saved TaylorMason token. Stop any existing bot window first. The runner also prevents two copies of the new runner from using the same local bot name.

Every game uses the same offense-only TaylorMason settings. Practice records results; it does not tune a defensive profile or change the policy. Old saved defensive profiles and `BOT_TRAIN_PLAN` values are ignored by the current TaylorMason runner. Starting a launcher enters public play; no online runner was started during the remodel.

The server may fill empty seats with simulated bots. Reports label these; a game with real entrants can also include filler bots. Results are observational because opponents and letter draws vary.

Reports, public match events, decision timings and purchase reasons are saved under `bot-starter/runs/TaylorMason/`. Each session has `REPORT.md`, `results.json` and `events.jsonl`. These contain no bot token. Older defensive studies remain in their original folders.

From PowerShell in this folder, a different batch size can be requested with `Start-Training.cmd -Matches 8`. Practice stops after its requested completed matches, or after approximately 25 minutes plus time to finish an active match. It does not register for a tournament.

If a connection closes, completed results are saved. Resume a current-policy session with `Start-Training.cmd -Matches 8 -ResumeSession SESSION-NAME`, using its folder name and original match limit. A partly observed match does not count toward the requested full games. Old defensive sessions cannot be resumed as offense-only sessions.

The Windows dictionary path is fixed, and a missing or empty dictionary stops startup with an error. `.gitattributes` also keeps the server's dictionary file on LF line endings so local games accept valid words on Windows.

## Local setup details

Node and Git were already installed. The official SpacetimeDB 2.13.0 Windows CLI is stored under `.tools/spacetime/`; its ZIP was verified against the release SHA-256. No global PATH change is needed.

If the game schema changes, regenerate the bindings from this folder. The command automatically uses the project-local CLI:

```powershell
npm.cmd --prefix bot-starter run generate
```

Do not publish the game module to the competition database. Running your bot only needs your team token.

## Public-data sample opponents

See `PUBLIC-OPPONENTS.md` for seven initial local models based on completed public games. The primary group favors the five highest current win percentages with at least 50 matches; two smaller-history leaders are included with lower confidence. Their original public win rates do not establish the local models' strength.

The local interface is `createSampleBot(model)` in `bot-starter/src/public-opponents.ts`. It exposes bidding and word choice for a future local arena and contains no online connection or match-entry code. Models are saved under `bot-starter/opponents/models/`. Bid uncertainty and explicit heuristic word-playing fallbacks are documented in each model.

From `bot-starter`, `npm.cmd run opponents:download` refreshes anonymous read-only public data, and `npm.cmd run opponents:fit` rebuilds and checks the models against separate newer historical matches. These commands do not play games. Raw snapshots are ignored by Git; `opponents/summary.json` records sources and hashes.

## Wags: aggressive acquisition and planned scoring

See `WAGS.md` for the separate Wags strategy. `Start-Wags.cmd -Check` runs its offline checks; `Start-Wags.cmd` starts online play only after you supply Wags's own registered-bot token. It buys aggressively, plans larger payouts, pressures strong contenders, and rapidly plays subsequent words after confirmed rack updates. Its token file and logs are separate from TaylorMason's, and it rejects a TaylorMason token before joining a lobby.

## VictorMateo: build, defend, and rebuild

See `VICTORMATEO.md` for the third bot. `Start-VictorMateo.cmd -Check` runs offline tests and scripted decisions. `Start-VictorMateo.cmd` starts public play when you choose, using VictorMateo's own registered identity and token. It begins with aggressive scoring, shifts to selective defense when funded and competitive, and returns to offense when cash or position falls. It keeps scoring in every mode and has separate logs, token storage, and per-match state. No full performance comparison has been run for this hybrid.

## Local match testing

Double-click **Test-Local.cmd** to run 1,000 local matches with the existing strategies and saved public-data opponents. No account or token is needed, and this command has no online connection code. It does not tune or deploy either bot.

The batch includes 400 six-player games containing both Wags and TaylorMason, 400 games replacing one with the other against five models, and 200 two-player duels. Identical tile bags and swapped starting seats make comparisons fairer. Private initial opponent letters and sealed bids remain hidden from each strategy.

Results are written to `LOCAL-TEST-RESULTS.md`; full data and reproducibility hashes are saved under `bot-starter/local-tests/`. Treat the output as simulator evidence: public-data models are approximate, and network latency is idealized equally for all players.

From this folder, `Test-Local.cmd --seeds 1000` runs 5,000 local games. `--seed-offset` chooses a different reproducible set of letter bags. The default `--seeds 200` represents 200 independent bags per six-player scenario, plus 100 independent duel bags; swapped-seat games share a bag and are not counted as independent samples in the paired score intervals.

## Verified locally

- All 77 tests and the TypeScript build pass, including auction/word timing, leader pressure, and VictorMateo's unchanged switching and identity checks.
- The full dictionary contains 172,820 words. Representative full-dictionary bid checks, including a crowded rack and five opponents, stayed below 500 ms on this computer after startup indexing.
- During earlier setup testing, a temporary local server accepted EXCLAIM for 54 points and NO for 2 points. The bot completed that match and automatically rejoined its local lobby.
- The temporary bot and server were stopped after testing. Enter your team token through the launcher to play on the competition server.
