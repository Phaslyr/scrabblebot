# Median-tendency local strategy study

The frozen candidate did not establish a consistent improvement in both full-match fields after multiple-comparison correction.

Completed **6,592 local simulations**. No online matches were started, no credentials were used, and all 18 monitored live files remain unchanged. The active bot and friend-host handoff still use TaylorMason v4. The new candidate remains experimental.

## Practical findings

The selected buying-only change adds 1.83 points in Refreshed public-data models (Holm p 0.0790) and 2.78 points in Current TaylorMason + Wags + independent premium planners (Holm p 0.0120). Winning-margin increases are not significant after correction in either field. The local win-rate changes are descriptive, not established improvements in server win probability.

Copying the median word timing as well as buying changes score by -11.18 and -23.25 points against current v4, with significant regressions in both fields. Preserve the existing word timing. Observed cash before playing and observed word rewards should not be mistaken for the bots’ actual trigger rules.

The 5% lower and higher bid-target neighbors do not reliably improve on the selected candidate. The lower target produces nearly identical mean scores; the higher target has lower point estimates. This is a relatively flat region for that particular price-target knob, not proof that every acquisition parameter is optimized. A future experiment could isolate value ceilings and funding decisions while keeping word timing fixed.

## What was fitted and tested

The fresh 2,000-game anonymous snapshot excluded 61 games observed in our stopped online campaign. The remaining games split chronologically into **1551 fit games** and **388 public holdout games**. The eight leading eligible current-version bots define a median long-word payout of **45 points** and median cash before playing of **10 coins**, taking the median of each bot’s median. These observed outcomes are not recovered decision thresholds.

| Bot | Fit-period games | Median 7+ reward | Median cash before a word |
|---|---:|---:|---:|
| K-13 | 87 | 48 | 12 |
| LetterSharkUltra | 143 | 51 | 12 |
| Lambi Lambiii | 145 | 45 | 9 |
| postturing | 79 | 45 | 10 |
| Lionel | 163 | 48 | 13 |
| Chinese Dante | 102 | 42 | 11 |
| Calebot | 115 | 42 | 9 |
| Metheny | 105 | 45 | 6 |

| Letter | Median winning bid | Median actual payment | Winning samples |
|---|---:|---:|---:|
| J | 38 | 31 | 143 |
| Q | 40 | 30 | 138 |
| X | 39 | 34 | 121 |
| Z | 48 | 41 | 152 |

Winning bids and payments are different quantities. They are conditional on winning, not estimates of every sealed bid or a guarantee of profitability. The candidate uses these prices only within own-value and cash limits.

The experimental buyer considers multiple dictionary completions rather than the previous ten-word list, removes exhausted observed letters from future opportunities, estimates missing-letter availability and future acquisition costs, and contests median-like prices when its rack supports the purchase. Existing productive acquisition remains a floor. It never adds defensive pressure or reads current rival bids.

## Development iterations

Twelve initial policies isolate buying and word-timing changes, combine the median center, and vary one coordinate at a time: bid targets by +/-10%, payout threshold by +/-3 points, cash-out by +/-3 coins, and value ceiling by +/-0.15. Each uses 32 paired bags per field. These are selection data.

| Initial policy | Mean score across fields | Mean margin over highest rival |
|---|---:|---:|
| bid-high | 63.23 | -21.03 |
| bid-low | 63.95 | -19.59 |
| cash-high | 63.66 | -20.47 |
| cash-low | 63.72 | -20.41 |
| current-v4 | 81.47 | -2.72 |
| median-bids | 83.14 | -0.59 |
| median-center | 63.73 | -20.22 |
| median-words | 58.97 | -24.31 |
| payout-high | 63.41 | -21.22 |
| payout-low | 66.14 | -17.61 |
| value-high | 66.47 | -17.50 |
| value-low | 62.44 | -22.92 |

The best non-control policy was refined on 32 different bags per field. Two small neighbors adjust bid scale (or payout if buying is unchanged); two adjust cash-out (or value ceiling if word timing is unchanged). Selection uses mean winning margin across equally weighted fields, with own score as tie-breaker.

| Refinement | Bid scale | Value scale | Cash offset | Mean score | Mean margin |
|---|---:|---:|---:|---:|---:|
| refine-second-high | 1 | 1.2 | 0 | 82.19 | 0.59 |
| refine-first-low | 0.95 | 1.15 | 0 | 81.58 | -0.28 |
| refine-parent | 1 | 1.15 | 0 | 81.58 | -0.69 |
| refine-second-low | 1 | 1.1 | 0 | 82.00 | -1.70 |
| refine-first-high | 1.05 | 1.15 | 0 | 79.50 | -3.30 |

Frozen selected settings: `{"id":"refine-second-high","bids":true,"words":false,"bidScale":1,"payoutOffset":0,"cashOffset":0,"valueScale":1.2}`. The final pass also includes current v4, the original combined median center, and small neighbors around the selected bid target. No settings were changed after seeing validation outcomes.

## Fresh full-match validation

Each policy uses **384 fresh bags per field**. Seats, rival lineups/random draws, bags and ties are paired. Wins count shared first places and are descriptive secondary outcomes.

| Field | Policy | Score | Shared-first | Margin | Premium tiles/game | 7+ points/word | Final cash |
|---|---|---:|---:|---:|---:|---:|---:|
| Refreshed public-data models | Current TaylorMason v4 | 88.07 | 48.4% | 0.33 | 0.14 | 30.03 | 13.07 |
| Refreshed public-data models | Combined median center | 76.89 | 28.4% | -14.68 | 0.23 | 35.34 | 9.79 |
| Refreshed public-data models | Selected: median-based buying | 89.90 | 51.8% | 1.94 | 0.29 | 31.70 | 10.20 |
| Refreshed public-data models | Selected with 5% higher bid targets | 88.92 | 50.5% | 0.72 | 0.27 | 31.73 | 9.72 |
| Refreshed public-data models | Selected with 5% lower bid targets | 89.85 | 51.6% | 1.71 | 0.29 | 31.65 | 10.20 |
| Current TaylorMason + Wags + independent premium planners | Current TaylorMason v4 | 73.37 | 39.1% | -6.75 | 0.17 | 35.79 | 10.37 |
| Current TaylorMason + Wags + independent premium planners | Combined median center | 50.12 | 8.3% | -32.02 | 0.26 | 40.90 | 9.13 |
| Current TaylorMason + Wags + independent premium planners | Selected: median-based buying | 76.15 | 40.1% | -4.91 | 0.41 | 38.01 | 9.22 |
| Current TaylorMason + Wags + independent premium planners | Selected with 5% higher bid targets | 74.94 | 39.6% | -5.99 | 0.41 | 37.76 | 9.41 |
| Current TaylorMason + Wags + independent premium planners | Selected with 5% lower bid targets | 76.14 | 39.8% | -4.96 | 0.42 | 38.02 | 9.20 |

The declared family has **20 tests**: the unique planned policy comparisons, both fields, and both own score and winning margin. Tests use paired Student t differences by bag. P-values use Holm correction across this whole family; displayed intervals use the more conservative Bonferroni simultaneous coverage. A small p-value is conditional on the simulator and is not a live win-rate claim.

| Field | Comparison | Own-score difference, simultaneous interval | Holm p | Margin difference, simultaneous interval | Holm p |
|---|---|---:|---:|---:|---:|
| Refreshed public-data models | selected minus current-v4 | 1.83 [-0.23, 3.89] | 0.0790 | 1.61 [-1.57, 4.80] | 0.6191 |
| Refreshed public-data models | median-center minus current-v4 | -11.18 [-13.80, -8.56] | <0.0001 | -15.01 [-18.78, -11.24] | <0.0001 |
| Refreshed public-data models | selected minus median-center | 13.01 [10.23, 15.78] | <0.0001 | 16.63 [12.56, 20.69] | <0.0001 |
| Refreshed public-data models | selected-low minus selected | -0.05 [-0.31, 0.21] | 1.0000 | -0.23 [-0.84, 0.38] | 0.9746 |
| Refreshed public-data models | selected-high minus selected | -0.97 [-2.07, 0.12] | 0.0790 | -1.22 [-3.02, 0.57] | 0.3094 |
| Current TaylorMason + Wags + independent premium planners | selected minus current-v4 | 2.78 [0.23, 5.33] | 0.0120 | 1.84 [-1.39, 5.06] | 0.5011 |
| Current TaylorMason + Wags + independent premium planners | median-center minus current-v4 | -23.25 [-26.18, -20.32] | <0.0001 | -25.27 [-28.99, -21.54] | <0.0001 |
| Current TaylorMason + Wags + independent premium planners | selected minus median-center | 26.03 [23.02, 29.04] | <0.0001 | 27.10 [23.27, 30.94] | <0.0001 |
| Current TaylorMason + Wags + independent premium planners | selected-low minus selected | -0.01 [-0.11, 0.10] | 1.0000 | -0.05 [-0.18, 0.08] | 0.9746 |
| Current TaylorMason + Wags + independent premium planners | selected-high minus selected | -1.21 [-2.62, 0.20] | 0.0821 | -1.07 [-2.87, 0.72] | 0.4850 |

Positive values favor the first policy. Negative values favor the second. Inconclusive neighbors should not be promoted just because one has the highest observed mean. These tests can identify a useful direction or a broad plateau; they cannot establish a global optimum.

## Held-out actual price paths

These 256 cases use real revealed letter sequences and archived five-rival bid ceilings from public holdout games, plus a seeded synthetic own starting rack drawn from the reconstructed aggregate initial pool. The policy sees only its own rack, past public letters and fitted prices. Rival current bids/future letters stay hidden until settlement. Ties lose conservatively.

Historical rival behavior is fixed even if our hypothetical purchase changes ownership, so this is a price-taking sensitivity rather than a valid multiplayer counterfactual. No hypothetical live win rates, rival scores or denied points are reported.

| Policy | Own score | Purchases/game | Premium tiles/game | Final cash |
|---|---:|---:|---:|---:|
| Current TaylorMason v4 | 58.87 | 13.30 | 0.04 | 21.64 |
| Combined median center | 47.73 | 12.38 | 0.07 | 16.57 |
| Selected: median-based buying | 62.23 | 13.40 | 0.11 | 17.42 |
| Selected with 5% higher bid targets | 62.14 | 13.34 | 0.09 | 17.08 |
| Selected with 5% lower bid targets | 62.27 | 13.41 | 0.11 | 17.66 |

| Comparison | Score difference, simultaneous interval | Holm p in price-path family |
|---|---:|---:|
| selected minus current-v4 | 3.36 [1.90, 4.83] | <0.0001 |
| median-center minus current-v4 | -11.14 [-13.38, -8.90] | <0.0001 |
| selected minus median-center | 14.50 [12.32, 16.69] | <0.0001 |

Selected versus current in these fixed price paths: 3.36 [1.90, 4.83], Holm p <0.0001. This is secondary robustness evidence; the public holdout also supplies benchmark calibration diagnostics and is not a new online trial.

## Stylized missed-bid stress

The selected policy and current v4 also face a paired, seeded 15% opening-bid loss mask on 96 other bags per full-match field. This does not reproduce network queues, clock skew, word-RPC timing or client stalls, and fixes no transport problem. It is secondary exploratory evidence.

| Field | Policy | Score | Shared-first | Margin |
|---|---|---:|---:|---:|
| Refreshed public-data models | Current TaylorMason v4 | 83.82 | 33.3% | -7.05 |
| Refreshed public-data models | Selected: median-based buying | 84.77 | 43.8% | -6.40 |
| Current TaylorMason + Wags + independent premium planners | Current TaylorMason v4 | 71.26 | 33.3% | -12.28 |
| Current TaylorMason + Wags + independent premium planners | Selected: median-based buying | 78.15 | 41.7% | -3.91 |

## Calibration, timing and limits

A single opponent bid multiplier (0.75) was fitted on training-only historical price predictions. Public holdout calibration has 68 cases: predicted median rival ceiling 19.00 versus actual 14.00, and mean absolute error 12.15. This remaining mismatch is one reason to keep the real-price sensitivity and to avoid reading simulated win rates as server forecasts.

Public model word timing and censored losing bids remain approximate. Independent planning rivals use a different reward/missing-letter ranking and do not share the candidate’s observed-availability/net-return formula. All public opponent and price fits reuse one frozen archive; fresh synthetic bags test conditional generalization, not real-world strategy recovery. The replay auction path cannot react to changed ownership. The whole-rack planner and goal beams are bounded searches, and availability/value calculations are heuristics.

The buying branch changes price targets, broad goal availability and value ceilings as a package. There is no equally aggressive flat-spending control in this study, so these gains cannot be attributed to median prices alone. The diagnostic no-word counter is a loop-exit count, not a measure of holding duration. Primary validation and price paths had zero recorded forecast mismatches; the bid-loss stress had 12, because forcing a commitment to zero can change the subsequent word choice. This stress does not reproduce the live client’s handling of unconfirmed commitments.

The selected policy was profiled on five synthetic rack fixtures after dictionary indexing. The largest first-call time was 570.6 ms; the largest repeat with caches warm was 5.8 ms. This is not an online readiness guarantee for one-second auctions. Profiling and delivery tests remain necessary before deployment, and a live adapter must instantiate/reset its state per match and restore public auction history on midgame joins. Live transport fixes are separate from this local strategy experiment.

Verification: 11 focused policy/statistics/price-taking tests and the TypeScript build passed. Every game checks legal words and money/tile conservation. Original v4 control parity, rival independence, reset/trace behavior and information boundaries passed checks. 1344 paired scenario groups, all stage counts, raw/source hashes, final aggregates and corrected comparisons were verified. There are 58 representative traces.

Artifacts: [protocol](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/median-study/PROTOCOL.md), [complete results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/median-study-2026-10-25T05-12-07-235Z/results.json), [frozen selection](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/median-study-2026-10-25T05-12-07-235Z/selected.json), [verification](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/median-study-2026-10-25T05-12-07-235Z/verification.json), [experimental factory](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/median-study/research-candidate.mjs), [traces](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/median-study-2026-10-25T05-12-07-235Z/traces).

The online bot remains stopped. No production policy or friend-host configuration was changed.
