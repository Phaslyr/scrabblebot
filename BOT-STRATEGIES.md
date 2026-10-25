# Current bot strategies

TaylorMason now uses **taylor-offense-v4**: no leader targeting, denial or defensive premiums. It retains whole-rack scoring and word timing, with bounded public-word acquisition preferences. The normal launcher and practice/evaluation modes all use this policy. See [TAYLOR-OFFENSE-RESULTS.md](TAYLOR-OFFENSE-RESULTS.md) for the 1,600-game local comparison, settings and limits.

Wags remains on `scoring-pressure-v3`; VictorMateo retains its existing hybrid. Their strategy code was not changed by TaylorMason's remodel.

## Historical shared version 3 and current Wags

The following describes the prior shared Wags/TaylorMason policy, `scoring-pressure-v3`. It remains active for Wags and as an explicit historical TaylorMason comparison. Both favored efficient scoring and pressure against leading threats. TaylorMason's old defensive settings below no longer govern its normal launcher.

## Evidence

The public snapshot collected on October 24, 2026 at approximately 11:47 AM Pacific still places Nijello first among bots with at least 50 current-version games: 199 wins in 483 games (41.2%). Its latest 100 games average 97.9 points, with 67.3% of points from seven-or-more-letter words. Chinese Dante averages 93.4 points with 84.7% from those words; Metheny averages 92.6 with 79.9%. Seven remains the most frequent word length for these contenders.

This supports protecting valuable longer-word plans while accepting good shorter payouts. A global optimum has not been established. Current public statistics are not strength-adjusted, histories can span different opponent fields, and the local models remain approximate. Raw SELECT provenance is in `bot-starter/opponents/upgrade-snapshot.json` and its referenced manifest. Aggregates are in `opponents/upgrade-evidence.json`.

## Settings

| Decision | Wags | TaylorMason |
|---|---:|---:|
| Common / other / rare exploration bids | 13 / 9 / 8 | 12 / 9 / 7 |
| Normal per-auction balance cap | 60% | 55% |
| Normal reserve | Up to 6 coins | Up to 8 coins |
| Cash-out balance | 16 or less | 18 or less |
| Premium for a useful letter that also completes a leader's word | Up to 3 coins | Up to 4 coins |
| Additional pure-pressure budget cap | 15% of current cash | 20% of current cash |
| Useful endgame balance cap | 95% | 95% |

Duplicate tiles, vowel balance, rack productivity, word completion value, cash, and remaining auctions also affect bids. Caps and reserves are ceilings, not spending targets. Defensive profile weight zero disables pressure. TaylorMason's saved pressure setting 1.6 now represents normal v3 intensity; smaller profile values reduce it. Previous online profile results do not validate v3.

The dual-use premium is one component. A separate credible-block valuation can justify a larger increase, within the extra-pressure and overall bid caps.

## Scoring and timing

The new policy in `src/scoring-v3.ts` keeps feasible whole-rack packing from the existing planner and adds a separate frontier for seven-to-nine-letter words one or two tiles away. It discounts scarce missing letters, rejects impossible repeated rare tiles, and preserves valuable goals while allowing spare-letter income. This is a bounded heuristic, not an exhaustive optimal solution.

Available seven-letter-or-longer payouts are cashed promptly. Worthwhile five/six-letter words and premium short words can finance more play. Low cash, five or fewer auctions remaining after the current one, at least 92% progress, or a rack of 13 tiles triggers liquidation unless a meaningful committed bid warrants waiting for the current usable award.

Bids now anticipate the sequence of words the bot expects to cash before settlement. Those consumed letters are removed before valuing the prospective purchase. A sufficiently competitive commitment can instead protect a material immediate completion for that auction. This fixes the previous mismatch where a bid could value letters that word play was about to consume. The estimate still cannot know whether a sealed bid will win.

Both the online runner and local arena supply only the current auction letter and the bot's own committed bid to this word decision. Rival sealed bids remain hidden. Bid affordability uses money already held at opening, not expected word income. The final tile is skipped; existing words are submitted before match end.

## Leader pressure

For each letter, the bot ranks real rivals by visible score, known available payouts, public rack size, and competitor strength. Live public leaderboard rows take precedence over the refreshed dated fallback records in `src/leader-priors-v3.ts`. An unrecognized but strong entrant can become a target.

Only the two leading projected threats receive extra pressure. The small dual-use premium applies when the letter also improves our own scoring plan. Pure denial is capped; uncertain hidden-rack pressure is limited to one extra coin and requires a useful purchase against a proven threat. Known partial racks are discounted. No private starting letters are invented, and a broke exact-rack rival without a playable word is not treated as able to buy immediately.

First-price auctions receive less extra pressure. A pressure purchase or a raised rival payment does not prove that any particular points were prevented.

## Checking and results

`Start-Wags.cmd -Check` and `Start-Bot.cmd -Check` perform offline checks. A normal launcher start enters public play. No public play is started by building or testing the policies.

From `bot-starter`, `npm.cmd run test:upgrade -- --seeds 100 --seed-offset 7000000 --label comparison` runs 400 matched offline games comparing v3 with the immediately preceding v2 policies. Old snapshots and earlier reports remain preserved. Local comparisons measure the policies against cached approximate models, with equal idealized timing, not actual public win rates.

## VictorMateo stays on its existing policy

VictorMateo continues to use its original `victor-hybrid-v1` controller and the v2 functions in `competition.ts` and `planning.ts`. It does not use the new scoring policy or refreshed fallback priors. See [VICTORMATEO.md](VICTORMATEO.md). Its behavior checks remain part of the full test suite.
