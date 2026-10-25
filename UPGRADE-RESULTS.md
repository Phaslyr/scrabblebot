# Wags and TaylorMason: scoring upgrade results

Policy version: scoring-pressure-v3. Both existing launchers use the upgraded policies on their next start. VictorMateo keeps its original hybrid controller and v2 scoring/bidding. No public matches were entered or bot credentials used.

## Final comparison with the immediately preceding policies

400 offline six-player games: 100 matched independent letter bags per bot, with the target seat rotated. Each before/after pair has identical opponents, tile order, seat, and tie randomness. TaylorMason uses profile weight 1.6 in both versions. The earlier 64-game pilot is excluded from these results; Wags routine spending was reduced between that pilot and this fresh confirmation batch.

| Bot | Previous score | Upgraded score | Score increase | Previous win rate | Upgraded win rate |
|---|---:|---:|---:|---:|---:|
| Wags | 47.11 | 57.20 | 21.4% | 10% | 25% |
| TaylorMason | 49.52 | 62.40 | 26.0% | 14% | 30% |

Wags: paired score change **+10.09**, approximate 95% interval [7.4, 12.8]. Strongest modeled rival change **-3.96**, interval [-7.2, -0.7]. Negative rival changes indicate greater suppression.
TaylorMason: paired score change **+12.88**, approximate 95% interval [10.0, 15.8]. Strongest modeled rival change **0.82**, interval [-2.4, 4.0]. Negative rival changes indicate greater suppression.

Wags's lower strongest-rival score is supported within this arena. TaylorMason's extra suppression is not established; its interval includes zero. Both show scoring gains. Observed win rates count shared first places.

## What changed

- More selective routine spending, with Wags slightly more aggressive than TaylorMason. Their normal balance caps are 60% and 55%; common-letter exploration starts at 13 and 12 coins.
- A separate seven-to-nine-letter goal frontier preserves valuable longer-word plans while allowing worthwhile shorter payouts. It does not impose an unconditional seven-letter requirement.
- Purchase valuation removes words expected to be cashed before settlement. A meaningful committed bid can protect a substantial immediate completion instead. The online runner and local arena both supply the current letter and the bot's own committed bid; rival sealed bids remain hidden.
- Extra pressure is directed at the two leading projected threats. Dual-use premiums are capped at 3/4 coins, with separate bounded credible-block valuations. Uncertain hidden-rack pressure adds at most one coin and requires a useful purchase.
- Public leaderboard fallback records were refreshed; live public statistics take precedence. VictorMateo's original functions and fallback priors remain separate.

## Current public evidence

Public snapshot: 2026-10-24T18:50:40.651Z. Nijello current record is 199/483 (41.2%); its latest 100 games average 97.9 points and 67.3% of points from seven-or-more-letter words. Chinese Dante averages 93.4 with 84.7%, and Metheny 92.6 with 79.9%. Seven is their most frequent word length.

Scores were reconstructed from public word rewards for 1,201 recent completed matches (7,206 participant checks), with no mismatches. Recent samples are current-version and capped at 100 per bot; inactive bots may have fewer or no matches in the fetched window. Public win percentages are not strength-adjusted. The snapshot used anonymous SELECT requests only.

## Verification and limits

All 77 tests and the TypeScript build pass. Tests cover affordable bids, word/purchase timing, holding only with a commitment, leader focus, private-rack uncertainty, endgame behavior, and VictorMateo existing behavior. The v3 crowded-rack decision check took about 177 ms on this machine, excluding network latency. Both launch examples also pass offline.

The 22 source/model hashes from the final batch were checked against the finished files. The v2 competition, planning, and intel functions used by VictorMateo match their earlier recorded hashes. Every simulated game verifies legal words plus cash and tile conservation.

The five cached public-data opponents are approximate, have documented bid-prediction errors, and omit newer contenders. Timing is idealized equally. Confidence intervals cover independent letter-bag variation, not model mismatch. These tests establish improvements against the immediately preceding policies in this arena; the globally optimal strategy and actual public win rates remain unknown.

Final raw artifacts: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\local-tests\upgrade-confirmation-2026-10-24T19-09-14-216Z. Full results, paired statistics, and source hashes: results.json. Complete match records: matches.json.

Public snapshot and SELECT provenance: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\opponents\data\upgrade-2026-10-24T18-47-19-582Z. Strategy details: BOT-STRATEGIES.md.

Reproduce from bot-starter: npm.cmd run test:upgrade -- --seeds 100 --seed-offset 7000000 --label comparison.
