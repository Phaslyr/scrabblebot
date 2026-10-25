# All-three bid-prediction experiment

Keep the live policies unchanged. This experiment does not establish that the direct forecast improves score over unchanged play, the simple table, and extra aggression alone for any of the three bots.

Completed 3,240 offline six-player games. Fresh prediction validation used 560 newer completed public matches (3813–4372); all passed the final score/balance audit. No public match was entered. All 18 hashed live policy/configuration files remained unchanged.

## What the results suggest

Wags and TaylorMason show no clear score improvement from the new predictor. VictorMateo improves against the unchanged control, but the simple table produces identical own-score results on every paired replacement game in all four arenas. Extra aggression alone scores higher than the learned forecast in the main VictorMateo comparison. These results do not support paying for the more complex prediction model.

VictorMateo’s main direct response makes only two extra bids and 21 extra word holds. That makes word timing a promising explanation for its gain, although a hold-only comparison would be needed to isolate the cause. VictorMateo also enters defense in just 9 of 120 main games; its current build/defend transition deserves attention before treating this hybrid as an improvement over the newer Wags/TaylorMason policies. Those are follow-up hypotheses, not changes made here.

## Prediction on newer public games

There were 38,080 auction observations in 560 games. One target seat was selected per auction using a rotation independent of bids and outcomes. The target is the highest rival bid, rather than each rival’s hidden bid. Error is distance to the observed price interval; coverage means the forecast interval intersects the observed target interval.

| Forecast | Mean price error, coins | Central 80% band coverage | Mean band width |
|---|---:|---:|---:|
| Simple market table | 3.99 | 85.6% | 13.00 |
| Player-specific forecast | 7.32 | 83.0% | 21.00 |
| Direct market learner | 3.94 | 82.4% | 12.20 |

Direct minus simple price error: **-0.04 [-0.05, -0.04] coins**, a 1.1% reduction. The gain is small even though it is consistent across these game-level comparisons.

The simple table and new learner used 85,884 observations from old matches through 3452. Selection and calibration used 24,480 observations through 3812. Those old games were previously studied and are not a fresh final test. Context-only and identity-augmented learners were compared at 0/10/20/40/80 stumps; calibration selected **context, 80 stumps** before the fresh holdout was loaded. Adding player identities did not improve selection error. The previous player-specific model’s weights stayed frozen, with its market-level output recalibrated on the same calibration partition.

## Main gameplay comparison

Each row uses 120 new letter bags, matched across policies. Each target faces approximate rivals built from newer public bid records for Nijello, Chinese Dante, Metheny, Doppio, and Lambi Lambiii. Shared-first counts tied top scores as wins. These are simulated rates, not public-server win rates.

| Bot | Response | Average score | Shared-first rate | Bid raises | Extra holds |
|---|---|---:|---:|---:|---:|
| Wags | Unchanged | 73.45 | 45.8% | 0 | 0 |
| Wags | Simple market table | 73.38 | 45.0% | 30 | 0 |
| Wags | Player-specific forecast | 73.27 | 45.8% | 31 | 0 |
| Wags | Direct market learner | 73.37 | 45.0% | 28 | 0 |
| Wags | Extra aggression alone | 73.36 | 48.3% | 433 | 11 |
| TaylorMason | Unchanged | 76.97 | 54.2% | 0 | 0 |
| TaylorMason | Simple market table | 77.28 | 52.5% | 60 | 0 |
| TaylorMason | Player-specific forecast | 77.15 | 56.7% | 58 | 0 |
| TaylorMason | Direct market learner | 77.12 | 52.5% | 64 | 0 |
| TaylorMason | Extra aggression alone | 77.94 | 55.8% | 503 | 11 |
| VictorMateo | Unchanged | 57.59 | 15.0% | 0 | 0 |
| VictorMateo | Simple market table | 59.15 | 16.7% | 2 | 21 |
| VictorMateo | Player-specific forecast | 59.85 | 17.5% | 3 | 42 |
| VictorMateo | Direct market learner | 59.15 | 16.7% | 2 | 21 |
| VictorMateo | Extra aggression alone | 59.86 | 17.5% | 38 | 83 |

Paired score differences with approximate 95% intervals, using 120 bags per bot:

| Bot | Direct − unchanged | Direct − simple | Direct − extra aggression |
|---|---:|---:|---:|
| Wags | -0.08 [-0.36, 0.19] | -0.02 [-0.05, 0.02] | 0.01 [-0.96, 0.98] |
| TaylorMason | 0.15 [-0.16, 0.46] | -0.17 [-0.66, 0.33] | -0.82 [-2.20, 0.55] |
| VictorMateo | 1.56 [0.67, 2.44] | 0.00 (all sampled pairs equal) | -0.71 [-1.38, -0.03] |

Changes in shared-first rate and the highest rival’s score (direct minus unchanged):

| Bot | Shared-first change, percentage points | Highest rival score change |
|---|---:|---:|
| Wags | -0.8 [-2.5, 0.8] | 0.33 [-0.12, 0.77] |
| TaylorMason | -1.7 [-5.7, 2.3] | -0.15 [-0.68, 0.38] |
| VictorMateo | 1.7 [-0.6, 4.0] | -0.53 [-1.40, 0.35] |

## All three in the same game

All three bots share the field with three empirical rivals, with no private information exchanged. These are separate games from the replacement comparison: 60 new bags × three seat rotations × two policies = 360 games. For uncertainty, average the three rotations within each bag before comparing the two policies. All three policies change together here, so a gain is a field-level effect rather than an isolated bot effect.

| Bot | Unchanged score / shared-first | Direct score / shared-first | Paired score change, 60 bags |
|---|---:|---:|---:|
| Wags | 57.87 / 11.7% | 57.56 / 11.1% | -0.32 [-1.02, 0.38] |
| TaylorMason | 71.53 / 34.4% | 71.13 / 32.8% | -0.39 [-1.22, 0.43] |
| VictorMateo | 43.50 / 3.9% | 44.38 / 5.0% | 0.88 [0.07, 1.68] |

## Sensitivity to the rival model

Each sensitivity uses 24 new bags per bot and response. Low/mid/high fill hidden losing bids at 15%/50%/85% of their allowed interval. They are assumptions, not actual recovered bids or bounds on performance. All losing-bid intervals are retained, including weak bounds; this is stricter than the earlier experiment’s replay filtering. Cached older public-opponent models are a separate sensitivity and can favor related prediction formulas.

| Arena | Bot | Direct − unchanged score | Direct − simple score | Direct − extra aggression score |
|---|---|---:|---:|---:|
| empirical-low | Wags | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | 0.08 [-2.73, 2.90] |
| empirical-low | TaylorMason | 0.29 [-0.50, 1.08] | 0.00 (all sampled pairs equal) | -0.88 [-3.61, 1.86] |
| empirical-low | VictorMateo | 1.38 [-0.15, 2.90] | 0.00 (all sampled pairs equal) | -2.38 [-5.16, 0.41] |
| empirical-high | Wags | 0.08 [-0.08, 0.25] | -0.17 [-0.62, 0.29] | -1.83 [-5.80, 2.14] |
| empirical-high | TaylorMason | -0.08 [-1.91, 1.75] | -0.67 [-1.97, 0.64] | 1.71 [-2.48, 5.89] |
| empirical-high | VictorMateo | 0.50 [-0.48, 1.48] | 0.00 (all sampled pairs equal) | -1.33 [-3.27, 0.60] |
| cached-model | Wags | 0.00 (all sampled pairs equal) | -0.08 [-0.25, 0.08] | -0.50 [-1.57, 0.57] |
| cached-model | TaylorMason | 1.92 [-2.49, 6.32] | 2.08 [-2.00, 6.17] | 0.67 [-2.32, 3.65] |
| cached-model | VictorMateo | 0.38 [-0.36, 1.11] | 0.00 (all sampled pairs equal) | 0.13 [-0.12, 0.37] |

## VictorMateo and response limits

VictorMateo uses its current stateful build/defend/rebuild controller, rather than substituting the newer Wags/TaylorMason strategy. The controller resets for every game. The response retains its phase-dependent cash reserve, with a small budget extension for productive tiles. Response endgame ceilings follow the current policies; this differs from the previous follow-up wrapper’s fixed normal fraction and is shared by all experimental responses here. Exact control equivalence, mode/reset behavior, public feature isolation, acquisition guards, and word-holding guards passed five targeted tests.

| VictorMateo main response | Games entering defense | Games entering rebuild | Build / defend / rebuild auction decisions |
|---|---:|---:|---:|
| Unchanged | 9/120 | 9/120 | 7613 / 269 / 278 |
| Simple market table | 9/120 | 9/120 | 7613 / 269 / 278 |
| Player-specific forecast | 9/120 | 9/120 | 7613 / 269 / 278 |
| Direct market learner | 9/120 | 9/120 | 7613 / 269 / 278 |
| Extra aggression alone | 9/120 | 9/120 | 7613 / 269 / 278 |

Forecast responses may raise an already productive bid by at most four coins, within cash and value ceilings, or extend a short-word hold when buying the next letter could complete a more valuable word. They never withhold an available seven-letter word. The aggression control allows the same actions without a forecast. A prediction result alone does not justify removing these limits.

## Limits and reproducibility

Initial rival letters and losing bids remain hidden. Rival bidding is sampled from public interval records; word selection is a common heuristic, not the original bots’ code. 745 observed winning bids exceeded reconstructed opening cash, consistent with bots earning or bidding later during an auction; replay fractions are capped at the available budget. The local arena idealizes auction timing and cannot reproduce network behavior or later bid revisions.

The 3,240 runs include matched variants, not 3,240 independent observations. Main uncertainty uses 120 independent letter bags per bot, sensitivity uses 24, and mixed-game uncertainty uses 60. Public forecast uncertainty is grouped by game; changing bot versions and correlations between nearby games can make those intervals optimistic. Intervals are exploratory and unadjusted for multiple comparisons. All-equal sampled pairs are described as such rather than evidence of zero population uncertainty. No forecast or response setting was retuned after fresh holdout or gameplay outcomes.

Artifacts: [protocol](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/market/PROTOCOL.md), [response details](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/market/IMPLEMENTATION-NOTES.md), [prediction results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/market-all-three-2026-10-24T21-20-21-319Z/prediction-results.json), [gameplay results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/market-all-three-2026-10-24T21-20-21-319Z/results.json), [all games](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/market-all-three-2026-10-24T21-20-21-319Z/games.json), [read-only collection manifest](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/market-all-three-2026-10-24T21-20-21-319Z/manifest.json). Source/model hashes are saved with the results.

To rerun the frozen local gameplay experiment from bot-starter: `node --import tsx experiments/market/simulate.mjs`. Recollecting/retraining is a separate action and changes the validation dataset.
