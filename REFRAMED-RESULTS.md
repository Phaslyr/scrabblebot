# Wags and TaylorMason: reframed strategies

Both bots now plan larger word payouts and target strong competitors. Wags favors aggressive acquisition; TaylorMason preserves more cash and weights targeted denial more heavily. The existing launchers use these policies on their next start. No public matches were entered.

The final results below use only the finished implementation on 100 previously unused matched letter bags per bot (400 total games). The 48-game pilot and 400-game preliminary comparison are preserved separately and are not pooled with this final batch.

Both scoring improvements are clear within this model arena. Additional opponent suppression is not established: the strongest-rival change intervals cross zero for both bots. The targets and budgets implement defensive intent; they do not guarantee denied points.

The source and model hashes in the final run were verified against the current files. All 50 checks and the TypeScript build pass. The crowded-rack decision test with five opponents stayed under its 500 ms allowance; this does not include real server/network latency.

Detailed artifacts: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\local-tests\reframed-final-2026-10-24T17-44-43-373Z.

## Final paired comparison

400 offline six-player matches, 100 matched independent bags per bot. Target seats rotate; each before/after pair has identical opponents, tile order, target seat, and tie randomness. TaylorMason uses weight 1.6 in both versions. No live matches, credentials, or network access.

| Bot | Policy | Average score | Average strongest rival | Win rate | Purchases | Average word length | Points from 7+ letters |
|---|---|---:|---:|---:|---:|---:|---:|
| Wags | before | 29.2 | 72.0 | 1.0% | 14.7 | 2.3 | 0.0% |
| Wags | after | 48.3 | 73.8 | 9.0% | 11.1 | 4.1 | 60.6% |
| TaylorMason | before | 21.6 | 76.3 | 0.0% | 8.0 | 2.7 | 0.0% |
| TaylorMason | after | 48.7 | 74.2 | 13.0% | 12.3 | 3.7 | 56.6% |

Wags: paired score change 19.1, approximate 95% interval [16.5, 21.7]. Strongest-rival change 1.9, interval [-0.9, 4.6]; negative means greater suppression.

TaylorMason: paired score change 27.1, approximate 95% interval [24.5, 29.7]. Strongest-rival change -2.1, interval [-5.9, 1.7]; negative means greater suppression.

These are comparisons against five cached approximate public-data models, not the real bots. They omit newer contenders, have documented prediction errors, and idealize network timing equally. Intervals describe bag variation, not opponent-model error. Shared first places count as wins. Both old and new policies see only their own dealt letters, public rack sizes, retained public purchases, balances, and scores. All matches check cash/tile conservation and forbid post-end cashing of the final awarded tile.

Seed offset 5000000. Runtime 163.5 seconds. Source and model hashes: results.json. Complete games: matches.json.
