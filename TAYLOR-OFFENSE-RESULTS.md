# TaylorMason: offense-only remodel

TaylorMason now uses **taylor-offense-v4**, selected configuration **Public-word preference, +6 cap**. All leader targeting, denial bids and defensive premiums are removed from TaylorMason. Wags and VictorMateo retain their existing policies. No online runner or public match was started.

1,600 local games completed: 320 development games and 1,280 fresh validation games. Selection was frozen after development. The selected policy improved score and margin over the original defensive policy in both modeled fields, with positive approximate 95% intervals.

## What changed

- Every TaylorMason purchase is justified by its own rack value. Rival names, scores, cash and letters cannot change its bid. Decision amount equals its own-value baseline, with zero defensive increment.
- Preserve the current whole-rack planner, productive buying floor, high-payout word retention, spare-word income, low-cash liquidation and final-tile handling. Do not repeat the unsuccessful replacement of the whole word policy.
- Add bounded acquisition preferences for observed premium-word families and useful letters enriched in premium payouts. Additional acquisition is capped at six coins, within cash/reserve limits; duplicate and late unproductive tiles receive no extra preference.
- Keep the entire legal dictionary. Common words are opportunities, never a compulsory target list. Opening bids use money currently held, not hoped-for word income.
- The normal launcher, fixed online evaluation and practice mode all use the new offense-only policy. Old defensive profile files and environment plans cannot turn defense back on. Practice records fixed-policy results without tuning.

## Public word and letter evidence

Anonymous public records were collected at **2026-10-25T01:38:16.146Z**. The latest 1,000 completed games yielded 1000 audited training games. The eight previous diagnostic game IDs were excluded if present. Word preferences use current-version plays from the eight highest win-rate bots with at least 50 recorded games and at least 20 covered current-version matches.

| Public bot | Current-version wins / games | Covered games | Observed mean score |
|---|---:|---:|---:|
| Nijello | 305/786 (38.8%) | 76 | 87.39 |
| Chinese Dante | 343/969 (35.4%) | 106 | 88.33 |
| LetterSharkUltra | 52/150 (34.7%) | 115 | 89.55 |
| Lambi Lambiii | 155/487 (31.8%) | 101 | 91.71 |
| Metheny | 30/97 (30.9%) | 34 | 93.03 |
| Doppio | 230/760 (30.3%) | 77 | 86.95 |
| Lionel | 97/335 (29.0%) | 116 | 88.59 |
| postturing | 20/72 (27.8%) | 72 | 86.67 |

There were 1,971 legal, score-checked word events from these bots. Only **10 premium anagram families** met the repeated-word threshold: at least 30 points, three distinct matches and two bots. Support is sparse, so this is a small preference rather than evidence of a universal best-word list.

| Representative word | Points | Distinct games | Bots |
|---|---:|---:|---:|
| PERIQUE | 54 | 4 | 4 |
| JOINERY | 51 | 4 | 3 |
| YANQUIS | 57 | 3 | 3 |
| FAVORED | 42 | 5 | 3 |
| FOVEATED | 45 | 3 | 3 |
| QUANTIC | 54 | 3 | 2 |
| WHARFED | 51 | 3 | 2 |
| EXORDIA | 45 | 3 | 2 |
| JANITOR | 42 | 3 | 2 |
| JIVER | 30 | 3 | 3 |

Letter preferences are fitted from all premium plays, not just those repeated families. Reward-weighted letter use is compared with standard bag frequency and shrunk toward the bag distribution. The strongest positive preferences are Z, Q, X, J, K, Y, H, C. Common vowels and connectors retain the existing acquisition floor. Rare-letter enrichment partly reflects their high face value; it is not proof they are profitable at any auction price. A letter preference applies only with a productive current-rack signal or a supported near-completion.

## Development and frozen selection

32 paired bags per field, all five variants. Own score averaged equally across fields selects among offense-only variants; the original defensive policy is a comparison. Score ties use winning margin, then simpler policy.

| Policy | Mean score across fields | Mean margin over highest rival |
|---|---:|---:|
| Original TaylorMason v3, defense 1.6 | 71.00 | -8.55 |
| Offense only | 73.20 | -4.03 |
| Extra own-value spending | 75.31 | -4.30 |
| Public-word preference, +3 cap | 75.09 | -4.06 |
| Public-word preference, +6 cap | 75.34 | -3.95 |

## Fresh validation

128 new bags per field and policy. Seats, lineups, tile bags, model draws and tie randomness are matched. Shared first places count as wins. All configurations stayed frozen throughout validation.

| Field | Policy | Score | Shared-first | 7+ words/game | Points per 7+ word | Purchases/game | Final cash |
|---|---|---:|---:|---:|---:|---:|---:|
| Five public-data models | Original TaylorMason v3, defense 1.6 | 73.37 | 32.8% | 1.95 | 29.33 | 17.92 | 11.84 |
| Five public-data models | Offense only | 73.87 | 36.7% | 2.05 | 28.72 | 17.89 | 16.01 |
| Five public-data models | Extra own-value spending | 75.55 | 40.6% | 2.04 | 29.36 | 17.85 | 14.34 |
| Five public-data models | Public-word preference, +3 cap | 75.66 | 44.5% | 2.07 | 29.17 | 18.02 | 14.84 |
| Five public-data models | Public-word preference, +6 cap | 75.91 | 44.5% | 2.08 | 29.31 | 17.95 | 15.46 |
| Original TaylorMason + Wags + three premium-goal planners | Original TaylorMason v3, defense 1.6 | 68.86 | 28.1% | 1.50 | 33.95 | 14.15 | 10.70 |
| Original TaylorMason + Wags + three premium-goal planners | Offense only | 70.02 | 32.0% | 1.62 | 33.55 | 14.41 | 11.34 |
| Original TaylorMason + Wags + three premium-goal planners | Extra own-value spending | 75.53 | 46.9% | 1.55 | 36.12 | 14.66 | 10.51 |
| Original TaylorMason + Wags + three premium-goal planners | Public-word preference, +3 cap | 72.30 | 39.8% | 1.53 | 35.37 | 14.46 | 10.60 |
| Original TaylorMason + Wags + three premium-goal planners | Public-word preference, +6 cap | 74.16 | 42.2% | 1.50 | 36.03 | 14.59 | 10.41 |

Paired changes with approximate 95% normal intervals. A positive margin change means our score improved relative to the highest rival.

| Field | Comparison | Score change | Margin change | Shared-first change, percentage points |
|---|---|---:|---:|---:|
| Five public-data models | public-six-legacy-pressure | 2.54 [0.75, 4.32] | 4.28 [0.86, 7.70] | 11.72 [3.41, 20.03] |
| Five public-data models | offense-only-legacy-pressure | 0.50 [-1.32, 2.32] | 0.48 [-2.87, 3.84] | 3.91 [-3.75, 11.56] |
| Five public-data models | public-six-offense-only | 2.04 [0.75, 3.33] | 3.80 [0.87, 6.72] | 7.81 [1.43, 14.19] |
| Five public-data models | public-six-offense-spend-six | 0.36 [-1.07, 1.78] | 1.08 [-1.17, 3.32] | 3.91 [-2.76, 10.57] |
| Original TaylorMason + Wags + three premium-goal planners | public-six-legacy-pressure | 5.30 [2.57, 8.02] | 6.10 [2.57, 9.63] | 14.06 [5.72, 22.41] |
| Original TaylorMason + Wags + three premium-goal planners | offense-only-legacy-pressure | 1.16 [-0.89, 3.21] | 0.82 [-1.96, 3.60] | 3.91 [-2.76, 10.57] |
| Original TaylorMason + Wags + three premium-goal planners | public-six-offense-only | 4.14 [1.86, 6.43] | 5.28 [2.47, 8.09] | 10.16 [2.68, 17.64] |
| Original TaylorMason + Wags + three premium-goal planners | public-six-offense-spend-six | -1.38 [-3.48, 0.73] | -2.31 [-4.92, 0.29] | -4.69 [-11.85, 2.48] |

The defense-removal comparison isolates removal from the original policy. Comparing the selected public-word variant against offense-only tests its additional purchases; comparing against extra own-value spending checks whether the public history adds value beyond a larger bid allowance. These comparisons do not establish the private algorithms of the public leaders.

The selected remodel improves score and winning margin over the original defensive policy in both fields. Defense removal alone changes score by 0.50 [-1.32, 2.32] and 1.16 [-0.89, 3.21]; both intervals include zero. Public-word preferences versus the extra-spending control change score by 0.36 [-1.07, 1.78] and -1.38 [-3.48, 0.73]; neither establishes an advantage. Most of the supported improvement concerns productive acquisition, rather than proving either that defense is useless or that these ten word families are uniquely valuable.

## Verification and limits

The new tests check rival independence, zero defensive increment, legal public-word support, baseline parity, extra-bid/cash bounds, duplicate/final-tile behavior, retained word timing and deadline performance. All games validate words, rack use, money and tile conservation. Original control parity and the copied instrumented arena were established in the previous study; their source files were frozen here.

All 18 monitored legacy files matched their frozen hashes at study completion, before the intentional TaylorMason integration. Source and raw-data hashes, 320 paired bag groups and all 1600 game aggregates passed verification. Representative decisions are saved in 30 trace files.

Local win rates are not predictions of server win rates. Public-data opponents sample partially identified bids and use heuristic word timing; the independent planner field tests another assumption but does not reproduce public source code. Both fields idealize timing. Confidence intervals cover bag variation only, are exploratory and unadjusted for multiple comparisons, and omit model mismatch. The public archive is reused for preference fitting and opponent fitting; fresh simulation bags do not replace independent live evaluation. Sparse repeated-word evidence and reward-weighted letter enrichment may fail to generalize.

Artifacts: [results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/taylor-offense-2026-10-25T01-37-54-272Z/results.json), [word evidence](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/taylor-offense-2026-10-25T01-37-54-272Z/word-priors.json), [protocol](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/taylor-offense/PROTOCOL.md), [study verification](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/taylor-offense-2026-10-25T01-37-54-272Z/verification.json), [traces](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/taylor-offense-2026-10-25T01-37-54-272Z/traces).

The online bot remains stopped. Future online evaluation requires a separate request to start it.

## Integration checks

All **91 tests** and the TypeScript build passed after integration. Normal play, fixed evaluation, bounded practice and the default local arena use the same selected offense-only policy. The old defensive strategy spelling is only a compatibility alias for the new policy; saved pressure plans are ignored. Explicit weighted arena agents remain available for historical comparisons.

The shared scoring engine, Wags and VictorMateo policies and their launchers match their pre-study hashes. Core study policy/data files also match the frozen inputs. Only the intended TaylorMason routing, reporting, test-list and main-launcher files changed among the monitored legacy files. See [integration verification](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/taylor-offense-2026-10-25T01-37-54-272Z/integration-verification.json). The online bot remains stopped.
