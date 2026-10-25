# Value-oriented planning: local development results

Keep the current production policy. The new goal-based refinements did not establish a consistent advantage over unchanged TaylorMason and matched extra spending in both validation fields.

Completed **2,064 local games** across the initial study and a separate development-led follow-up. The eight known live games were replayed diagnostically at 544 opening positions; they were not counted as fresh matches. All 18 monitored production policy/configuration files are unchanged. The online bot remains stopped.

## What was implemented

- Own-rack, balance, goal, missing letters, estimated cost/probability, alternative playable words, bids, proposed cash-outs and decision reasons in representative local traces and all eight diagnostic replays.
- Goals ranked by real payout, acquisition cost, estimated remaining opportunities, liquidity and the score sacrificed by reserving ingredients; five-/six-letter premium words are eligible alongside longer words.
- Goal-directed bidding tested independently from changed word timing, then combined.
- Refreshed public-data opponents covering all seven observed winners, plus additional current leaders; a separate field uses current Wags/TaylorMason and independently ranked premium-goal planners.
- Defense disabled/selective/current comparisons and settlement-based ownership metrics, with true synthetic rival bids available only to the evaluator after decisions.

## Initial replacement study

The first development pass used 32 bags per field. It compared each component separately and jointly against the unchanged policy. These are tuning results, not final validation.

| Policy | Mean score across fields | Winning margin | Shared-first rate |
|---|---:|---:|---:|
| Unchanged TaylorMason | 74.56 | -6.56 | 42.2% |
| Initial goal-directed bidder | 65.33 | -20.06 | 31.3% |
| Initial word-policy replacement | 48.67 | -34.67 | 10.9% |
| Initial joint replacement | 33.36 | -56.11 | 0.0% |

The initial new bidder retained 78.6 coins per game, versus 12.2 for the control, in development. It underinvested rather than merely choosing better tiles. The word-policy replacement also produced fewer long words. A follow-up was therefore preregistered from these development logs, before consulting the first study’s validation outcomes. The first study continued unchanged.

First-study fresh validation, 128 bags per policy and field:

| Field | Initial bidder score / shared-first | Unchanged score / shared-first | Paired score change |
|---|---:|---:|---:|
| Five public-data opponents | 65.26 / 24.2% | 74.74 / 38.3% | -9.48 [-12.65, -6.32] |
| TaylorMason + Wags + three premium-goal planners | 64.20 / 24.2% | 73.00 / 43.8% | -8.80 [-12.84, -4.75] |

## Conservative integration follow-up

The follow-up preserves the current acquisition baseline, caps extra own-value bidding at six coins, and keeps existing defense. One variant adds only a current-auction hold for a known gain of at least 18 points when the committed bid covers the estimated market threshold. The spending control permits the same extension using the original value signal. Both use the same budget caps. This tests whether a goal model adds value beyond spending more.

The premium candidate selected on 24 development bags per field was **Premium acquisition overlay**. All four policies then ran on 96 fresh bags per field; no policy or setting was retuned afterward.

| Field | Policy | Average score | Shared-first | 7+ words/game | Points per 7+ word | Final cash |
|---|---|---:|---:|---:|---:|---:|
| Five public-data opponents | Unchanged TaylorMason | 74.79 | 39.6% | 1.95 | 30.42 | 11.40 |
| Five public-data opponents | Premium acquisition overlay | 76.16 | 44.8% | 1.95 | 30.56 | 11.30 |
| Five public-data opponents | Premium overlay + current-tile hold | 76.16 | 44.8% | 1.95 | 30.56 | 11.30 |
| Five public-data opponents | Matched extra-spending control | 75.30 | 44.8% | 1.81 | 30.88 | 10.46 |
| TaylorMason + Wags + three premium-goal planners | Unchanged TaylorMason | 70.71 | 38.5% | 1.48 | 34.71 | 11.30 |
| TaylorMason + Wags + three premium-goal planners | Premium acquisition overlay | 71.90 | 40.6% | 1.53 | 34.41 | 11.66 |
| TaylorMason + Wags + three premium-goal planners | Premium overlay + current-tile hold | 71.90 | 40.6% | 1.53 | 34.41 | 11.66 |
| TaylorMason + Wags + three premium-goal planners | Matched extra-spending control | 73.50 | 40.6% | 1.46 | 36.11 | 10.11 |

Paired effects with approximate 95% intervals:

| Field | Comparison | Score change | Winning-margin change | Shared-first change, percentage points |
|---|---|---:|---:|---:|
| Five public-data opponents | premium-bids-current-taylor | 1.36 [0.19, 2.54] | 1.74 [-0.79, 4.27] | 5.21 [-2.67, 13.09] |
| Five public-data opponents | premium-bids-matched-extra | 0.85 [-0.57, 2.28] | -0.30 [-2.65, 2.04] | 0.00 [-6.49, 6.49] |
| Five public-data opponents | premium-joint-premium-bids | 0.00 (all pairs equal) | 0.00 (all pairs equal) | 0.00 (all pairs equal) |
| TaylorMason + Wags + three premium-goal planners | premium-bids-current-taylor | 1.19 [-0.94, 3.32] | 1.65 [-1.42, 4.71] | 2.08 [-7.53, 11.70] |
| TaylorMason + Wags + three premium-goal planners | premium-bids-matched-extra | -1.60 [-4.14, 0.93] | -3.00 [-6.39, 0.39] | 0.00 [-8.21, 8.21] |
| TaylorMason + Wags + three premium-goal planners | premium-joint-premium-bids | 0.00 (all pairs equal) | 0.00 (all pairs equal) | 0.00 (all pairs equal) |

A positive change in winning margin means our score improved relative to the highest rival. This remains an approximate local benchmark; a simulated win rate is not a server forecast.

The selected premium overlay changed own score by 1.36 points in Five public-data opponents and 1.19 points in TaylorMason + Wags + three premium-goal planners. Only the public-model field’s score interval excluded zero; neither field established a win-rate increase. The matched extra-spending control had the largest winning-margin improvement in both fields, so these results do not establish that the new goal model adds value beyond a larger bid allowance.

The new current-tile hold activated 0 times in final validation. Its outcomes were identical to the premium-bid variant. This gives no evidence about the benefit of holding when it activates; the trigger needs targeted coverage before further claims.

Recommended next development: retain the current word policy and acquisition floor, investigate the small extra-bidding allowance, improve opponent-model calibration against observed live scores, and use the new traces to study premium-word completion. Treat both small score gains and the spending-control margin gain as exploratory until independently replicated. No policy is automatically promoted.

## Defense and actual ownership changes

Initial defense development, 24 bags per field:

| Defense setting | Mean score | Winning margin | Shared-first |
|---|---:|---:|---:|
| current | 58.17 | -27.63 | 10.4% |
| off | 55.88 | -30.75 | 16.7% |
| selective | 55.75 | -30.79 | 16.7% |

The following counts come from final follow-up games. Raised own-value/premium bids are part of the baseline and are not labelled defensive.

| Field | Policy | Pressure-labelled purchases | Purchases changing ownership | Already won at baseline | Payments on ownership-changing purchases |
|---|---|---:|---:|---:|---:|
| Five public-data opponents | Unchanged TaylorMason | 795 | 112 | 683 | 1436 |
| Five public-data opponents | Premium acquisition overlay | 804 | 110 | 694 | 1430 |
| TaylorMason + Wags + three premium-goal planners | Unchanged TaylorMason | 144 | 73 | 71 | 952 |
| TaylorMason + Wags + three premium-goal planners | Premium acquisition overlay | 135 | 65 | 70 | 862 |

Ownership is recomputed with the same rival bids and seeded tie-breaks but our defensive increase removed. These are conditional auction effects, not proof of denied words or final points. Payments are full prices for newly acquired tiles, not automatically wasted or incremental defensive costs. These counts omit increases in a rival’s purchase price when our raised bid loses; whole-game score and margin comparisons include those economic effects.

## Eight live-game diagnostic replays

All eight own initial racks were uniquely reconstructed from letter deficits, with five required letters each. All word plays, final scores and cash balances passed replay audits. The unchanged bidder matched 496/544 recorded opening bids; historical opponent reputation rows were not logged, so shadow decisions use current public reputation and are not a bit-for-bit recreation of every live input.

| Game | Exact own initial rack | Audited positions | Unchanged bid matches |
|---|---|---:|---:|
| 12761 | FJLNO | 68 | 56 |
| 12770 | DEHOQ | 68 | 63 |
| 12779 | AJKRU | 68 | 62 |
| 12788 | AIILW | 68 | 54 |
| 12797 | ADMRT | 68 | 63 |
| 12806 | DOOSW | 68 | 67 |
| 12816 | FGNRY | 68 | 65 |
| 12826 | EGINQ | 68 | 66 |

The replay evaluates alternative decisions against the observed state at each opening. Hypothetical choices do not propagate to later racks, rival behavior or scores. Archived highest bids are used only after a shadow decision to classify that one auction’s price comparison. No counterfactual match win rates or final scores are reported. The eight games were excluded from public price/opponent fitting and never used as final validation. Both original and follow-up traces are saved.

## Benchmark coverage and limits

The public collection contains 1,000 completed games; excluding the eight diagnostic cases leaves 992 training games, all passing score/balance reconstruction. Public models retain exact winning bids and censored losing-bid intervals, rather than inventing hidden losing bids.

| Opponent model | Archive games | Observed mean score | Premium payout reference |
|---|---:|---:|---:|
| SookraBot | 118 | 86.14 | 48 |
| Lionel | 119 | 87.08 | 42 |
| LUCENT | 109 | 83.19 | 39 |
| Menice | 63 | 75.54 | 42 |
| LetterSharkUltra | 88 | 89.83 | 51 |
| swanbot | 98 | 76.54 | 36 |
| Nijello | 79 | 92.04 | 48 |
| Chinese Dante | 111 | 90.12 | 42 |
| Metheny | 69 | 89.88 | 45 |

Public models sample bid intervals and use explicit word-timing fallbacks. Planning rivals use a separate payout/missing-letter ranking and public payout references; they do not share the candidate’s completion-probability or net-value formula. Their private synthetic racks belong only to those model agents. Neither family reproduces the original bots’ code. Public observed means come from different opponent fields and are descriptive rather than strength-adjusted calibration targets.

Initial bidder sensitivities, 24 bags per policy and field:

| Hidden-bid assumption | Field | Score change vs unchanged | Winning-margin change |
|---|---|---:|---:|
| low | Five public-data opponents | -18.21 [-25.61, -10.81] | -26.42 [-36.68, -16.16] |
| low | TaylorMason + Wags + three premium-goal planners | -7.67 [-15.84, 0.51] | -17.08 [-28.70, -5.47] |
| high | Five public-data opponents | -10.71 [-16.13, -5.28] | -18.75 [-27.45, -10.05] |
| high | TaylorMason + Wags + three premium-goal planners | -4.50 [-11.81, 2.81] | -4.88 [-15.03, 5.28] |

The candidate’s availability and cost calculations are bounded heuristics, not calibrated probabilities or guaranteed prices. Goal search keeps payout-oriented and common-letter beams and does not find every possible plan. The arena idealizes auction/network timing. All variants see only their own rack and public rival state; no current rival bids or future tile order reach the policy.

The 2,064 runs include paired variants, not that many independent samples. Initial validation uses 128 bags per field; follow-up validation uses 96. Development uses 32/24 bags, and first-pass sensitivity uses 24. Confidence intervals are exploratory, unadjusted for multiple comparisons. The same frozen public archive is reused; fresh bags and independent planner rivals test some generalization but do not replace authorized live evaluation.

Verification: 12 focused tests and the TypeScript build passed. Tracing preserves outcomes, the unchanged control and instrumented arena reproduce the originals, every game checks word/cash/tile legality, all saved source hashes remain unchanged, and the online lock is absent. There are 46 representative trace files plus the two diagnostic trace sets.

Artifacts: [protocol](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/value-planning/PROTOCOL.md), [follow-up design](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/value-planning/FOLLOW-UP.md), [first results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/value-planning-2026-10-25T00-27-14-332Z/results.json), [follow-up results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/value-planning-2026-10-25T00-27-14-332Z/followup-results.json), [diagnostic summary](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/value-planning-2026-10-25T00-27-14-332Z/replay-followup-results.json), [trace directory](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/value-planning-2026-10-25T00-27-14-332Z/traces), [verification](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/value-planning-2026-10-25T00-27-14-332Z/verification.json).

No production policy, account, launcher, or online test was changed or started by this study.
