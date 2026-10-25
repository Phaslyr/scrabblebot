# Local opponents modeled from public server history

Public snapshot collected 10/24/2026, 4:37:02 AM PDT. No bot token was used, no accounts or bot registrations were created, and no matches were entered or simulated.

## Selection and fitted models

Top five current win rates with at least 50 matches, plus top two with 10–49 matches labeled small-sample.

Win percentages are for each bot's current leaderboard version and include shared first-place finishes. They are not adjusted for opponent strength or simulated filler seats; historical win rates do not establish current strength. Deleted bots are excluded.

| Bot | Priority | Public wins/games | Win rate | Train/holdout games | Mode-derived target word length | Holdout winning-bid MAE, coins | Losing-bound violations |
|---|---|---:|---:|---:|---:|---:|---:|
| Nijello | priority | 50/129 | 38.8% | 64/16 | 7 | 4.30 | 16.5% |
| Chinese Dante | priority | 111/310 | 35.8% | 64/16 | 7 | 4.48 | 53.8% |
| LetterShark | priority | 66/188 | 35.1% | 64/16 | 7 | 3.82 | 36.5% |
| YeziShanYang | priority | 65/192 | 33.9% | 64/16 | 7 | 6.76 | 43.2% |
| Doppio | priority | 52/159 | 32.7% | 64/16 | 7 | 4.79 | 46.9% |
| mexicanpepper | small-sample | 6/10 | 60.0% | 8/2 | 7 | 4.89 | 37.5% |
| james | small-sample | 13/34 | 38.2% | 27/7 | 7 | 4.30 | 28.4% |

Audited 380 distinct completed matches; 380 passed exact score/balance reconstruction checks. Excluded 0 inconsistent histories and 89 winning-bid observations whose amounts exceeded the balance visible at auction opening.

## What the models capture

Each runnable local sample bot predicts affordable bids from letter, balance, public rack size, retained public copies, match progress, score, leader gap, and auction payment type. The learner uses exact archived winning bids, upper bounds for losses, and lower bounds where winning-bid archives are missing. Losing bids are never fabricated as zero.

The model family is chosen between a censored linear model and per-letter median bid fractions using an internal chronological calibration split. The reported holdout consists of newer whole matches kept separate from fitting and family selection. Features are reconstructed at auction opening, without using later word plays to reveal hidden letters.

The local word policy aims for each teacher's most frequent training word length, while retaining shorter-word fallbacks. This is a mode-derived heuristic, not a claim that the teacher never plays shorter words or uses that threshold internally. Actual local word choice uses the full shared dictionary and the sample bot's own rack. Cash-out, endgame flushing, and rack-limit behavior remain explicit heuristic fallbacks, because public history cannot reveal which unplayed words were available to the original bot.

Several models violate many losing-bid bounds on the holdout games; they are marked limited fidelity in their model files. Winning-bid prediction is better than the per-letter median baseline, but that does not repair the missing private-state information or validate their strength as opponents.

## Limits of validation

MAE measures absolute prediction error on observed winning bids only. Losing-bound violations measure incompatible predictions where a rival's winning bid supplies a usable upper bound. These do not measure accuracy on all bids. Initial letters, losing bids, latency, code changes within a version, and private strategy remain unknown. These are approximate opponents, not exact replicas; their original win percentages must not be attributed to the local models. No local match-strength or online performance claim has been validated here.

## Files and use

Model files: `bot-starter/opponents/models/bot-ID.json`. Reusable interface: `createSampleBot(model)` from `bot-starter/src/public-opponents.ts`, providing `decideBid(ctx)` and `chooseWord(ctx)` for a future local arena. It has no networking or registration behavior.

Run `npm.cmd run opponents:download` from bot-starter to refresh the anonymous read-only snapshot, then `npm.cmd run opponents:fit` to rebuild and validate models. Raw data is ignored by Git; summary.json records query provenance and SHA-256 hashes.

Source endpoint: https://maincloud.spacetimedb.com/v1/database/scrabblebot/sql
Snapshot: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\opponents\data\2026-10-24T11-37-02-198Z
