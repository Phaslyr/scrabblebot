# Is bid-style prediction worth using?

Do not integrate this player-specific predictor yet. Predictive and gameplay evidence do not meet the predeclared adoption checks.

The experiment audited 1800 public completed matches, held out newer whole games, and ran 2,720 offline six-player response games (1,600 guarded; 1,120 exploratory follow-up). All 18 hashed live policy/configuration files are unchanged. No bot credentials, registrations, or public match entry were used.

## What can be predicted

Across 3,312 observed winning bids by the five leaders in the final test partition, player-specific models reduced weighted error from 8.26 to 5.37 coins. This is a selected subset of bids; it does not establish accuracy on hidden losing bids.

| Bot | Train / calibration / test games | Exact test wins | Generic winning-bid error | Player-specific error | Conflicts with informative losing bounds |
|---|---:|---:|---:|---:|---:|
| Nijello | 184/62/53 | 769 | 8.80 | 5.54 | 47.1% |
| Chinese Dante | 176/60/51 | 635 | 8.26 | 5.16 | 50.4% |
| Metheny | 123/66/49 | 598 | 8.38 | 4.80 | 52.7% |
| Doppio | 192/64/54 | 738 | 8.34 | 5.73 | 46.2% |
| Lambi Lambiii | 117/51/43 | 572 | 7.31 | 5.50 | 62.4% |

The actionable quantity in a second-price auction is the highest rival bid: it determines our payment if we beat the field, subject to the one-coin reserve. That quantity can often be reconstructed from public archives without knowing each losing bid.

| Forecast | Highest-rival-bid error, coins | Central 80% interval coverage | Average interval width, coins |
|---|---:|---:|---:|
| Pooled letter/balance bidder | 7.86 | 80.2% | 23.01 |
| Per-bot letter/balance bidder | 9.16 | 82.1% | 26.60 |
| Per-bot selected feature/median model | 8.85 | 79.1% | 22.15 |
| Simple letter/phase/liquidity market table | 4.26 | 81.0% | 12.00 |

The simple baseline was selected on calibration games: Simple letter/phase/liquidity market table. Player-specific minus simple error is **4.59 [4.17, 5.02] coins**, paired by 191 distinct test games. Positive means worse player-specific forecasts. The intended predictive gate was at least 10% lower error and at least 75% coverage; passed: **false**.

## Did responding improve games?

The main arena independently samples held-out public bid intervals. Hidden losing bids use their midpoint; low/high assumptions and cached older models are reported separately. Word choice remains a heuristic, not a recovered private strategy.

The two forecast responses use identical guards. They may raise a valuable bid by at most four coins within a cash/value ceiling, or retain a valuable completion when the forecast supports a low-cost win. The blind control allows those same actions without a forecast. It tests whether any gain comes from extra aggression rather than prediction. Unchanged controls were checked against the actual current Wags/TaylorMason factories.

| Bot | Response | Main games | Average score | Shared-first rate | Bid raises | Extra holds |
|---|---|---:|---:|---:|---:|---:|
| Wags | Unchanged v3 | 80 | 68.10 | 27.5% | 0 | 0 |
| Wags | Simple price forecast | 80 | 68.30 | 27.5% | 1 | 0 |
| Wags | Player-specific forecast | 80 | 68.10 | 27.5% | 0 | 0 |
| Wags | Blind extra aggression | 80 | 67.90 | 33.8% | 273 | 10 |
| TaylorMason | Unchanged v3 | 80 | 73.26 | 37.5% | 0 | 0 |
| TaylorMason | Simple price forecast | 80 | 73.26 | 37.5% | 1 | 0 |
| TaylorMason | Player-specific forecast | 80 | 73.26 | 37.5% | 0 | 0 |
| TaylorMason | Blind extra aggression | 80 | 72.22 | 38.8% | 349 | 9 |

The player-specific guarded response made zero additional bids or holds across all four arenas, so it produced identical outcomes. This is an actionability failure under the chosen guardrails. It does not show that every prediction-based policy has zero effect. Equal sampled pairs are reported without a misleading zero-width confidence claim.

Paired score changes and approximate 95% intervals in the main arena:

Wags:
- style-control: 0.00 (all sampled pairs equal) points; shared-first change 0.0%.
- style-simple: -0.20 [-0.59, 0.19] points; shared-first change 0.0%.
- style-blind: 0.20 [-0.85, 1.25] points; shared-first change -6.3%.

TaylorMason:
- style-control: 0.00 (all sampled pairs equal) points; shared-first change 0.0%.
- style-simple: 0.00 (all sampled pairs equal) points; shared-first change 0.0%.
- style-blind: 1.04 [-0.94, 3.02] points; shared-first change -1.3%.

## Sensitivity checks

| Arena | Bot | Bags per response | Player-specific minus unchanged score | Player-specific minus simple score | Player-specific minus blind score |
|---|---|---:|---:|---:|---:|
| empirical-mid | wags | 80 | 0.00 (all sampled pairs equal) | -0.20 [-0.59, 0.19] | 0.20 [-0.85, 1.25] |
| empirical-mid | taylor | 80 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | 1.04 [-0.94, 3.02] |
| empirical-low | wags | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -2.13 [-4.99, 0.74] |
| empirical-low | taylor | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -2.10 [-4.31, 0.11] |
| empirical-high | wags | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | 1.20 [-0.83, 3.23] |
| empirical-high | taylor | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -0.68 [-4.35, 3.00] |
| cached-model | wags | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -1.80 [-3.37, -0.23] |
| cached-model | taylor | 40 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -0.53 [-3.41, 2.36] |

Low/mid/high fill in unidentified losing bids at 15%, 50%, and 85% of their admissible interval. These are assumptions, not observed bids or guaranteed bounds on performance. Cached-model results are only a sensitivity check: related model families can make a predictor look artificially strong.

## Exploratory response using the middle estimate

After the guarded response made no player-specific interventions, a follow-up used the median price instead of the upper interval endpoint. All cash/value ceilings and the four-coin limit remained. It used new letter bags and frozen prediction models. This is exploratory and does not replace the original protocol.

| Bot | Response | Fresh main bags | Average score | Shared-first rate | Bid raises | Extra holds |
|---|---|---:|---:|---:|---:|---:|
| Wags | Unchanged v3 | 80 | 68.00 | 27.5% | 0 | 0 |
| Wags | Simple middle estimate | 80 | 68.34 | 26.3% | 15 | 0 |
| Wags | Player-specific middle estimate | 80 | 68.29 | 25.0% | 17 | 0 |
| Wags | Blind extra aggression | 80 | 68.35 | 25.0% | 276 | 8 |
| TaylorMason | Unchanged v3 | 80 | 73.53 | 40.0% | 0 | 0 |
| TaylorMason | Simple middle estimate | 80 | 73.80 | 42.5% | 30 | 0 |
| TaylorMason | Player-specific middle estimate | 80 | 73.81 | 41.3% | 70 | 0 |
| TaylorMason | Blind extra aggression | 80 | 75.19 | 46.3% | 327 | 12 |

Wags follow-up paired score changes:
- style-control: 0.29 [-0.41, 0.99] points.
- style-simple: -0.05 [-0.97, 0.87] points.
- style-blind: -0.06 [-1.90, 1.77] points.

TaylorMason follow-up paired score changes:
- style-control: 0.29 [-0.21, 0.79] points.
- style-simple: 0.01 [-0.68, 0.71] points.
- style-blind: -1.38 [-2.95, 0.20] points.

| Follow-up arena | Bot | Bags per policy | Specific minus unchanged score | Specific minus simple score | Specific minus blind score |
|---|---|---:|---:|---:|---:|
| empirical-mid | wags | 80 | 0.29 [-0.41, 0.99] | -0.05 [-0.97, 0.87] | -0.06 [-1.90, 1.77] |
| empirical-mid | taylor | 80 | 0.29 [-0.21, 0.79] | 0.01 [-0.68, 0.71] | -1.38 [-2.95, 0.20] |
| empirical-low | wags | 20 | 0.00 (all sampled pairs equal) | 0.00 (all sampled pairs equal) | -1.20 [-3.45, 1.05] |
| empirical-low | taylor | 20 | 0.30 [-1.32, 1.92] | 0.30 [-1.32, 1.92] | -0.85 [-2.63, 0.93] |
| empirical-high | wags | 20 | -0.75 [-2.22, 0.72] | 0.05 [-2.60, 2.70] | 0.00 [-2.24, 2.24] |
| empirical-high | taylor | 20 | 1.90 [-1.12, 4.92] | 2.05 [-1.01, 5.11] | -1.20 [-6.12, 3.72] |
| cached-model | wags | 20 | 0.45 [-0.43, 1.33] | 0.55 [-0.34, 1.44] | 0.35 [-0.27, 0.97] |
| cached-model | taylor | 20 | 0.15 [-0.14, 0.44] | 1.25 [-1.24, 3.74] | -0.35 [-4.04, 3.34] |

## Method and limits

- Global chronological split: 1080 fitting games, 360 calibration games, 360 final-test games. No game appears in more than one partition. Bot versions are respected; primary market evaluation requires six known real players.
- Primary field metrics use 17,000 target-auction observations in 191 distinct test games. Multiple targets can share an auction; these are not all distinct auctions. Errors are averaged by game before comparison.
- Features use only public information available at auction opening. Family selection and price intervals use calibration games. Current leaderboard outcomes select which leaders to study but are not supplied as predictive features.
- Winning bids are exact when archived. Losing bids are upper bounds at the Vickrey runner-up payment; they are never labeled observed zero. A reserve of one identifies maximum rival bids only within [0,1], scored with interval distance. Winning bids above opening cash remain in test errors.
- All 1800 games passed exact score/balance and nonnegative rack-size checks. 1561 winning observations exceeded opening cash across the audited data, consistent with within-auction word income or revisions.
- The public-data replay is independent of the prediction formula, but its draws come from the same held-out archive used for the historical forecast test. It is a counterfactual approximation, not a second independent real-world validation. Opponents do not revise bids after word plays inside an auction, and network timing is idealized equally.
- Every simulated game checks cash/tile conservation and dictionary legality. Matched comparisons keep bags, seats, tie randomness, and empirical draws fixed. Intervals cover bag variation and do not cover model mismatch. Many comparisons are descriptive; no claim of a globally optimal response is made.
- The tested policy makes modest guarded changes around v3. These results do not rule out stronger probabilistic or direct market-price models. Winning-bid style accuracy alone is insufficient for deployment.

A useful next research direction is to model the collective price to beat directly, using the simple market table as the baseline. Taking the maximum of individual point predictions does not recover a well-calibrated distribution of the maximum competing bid.

Raw data, model artifacts, splits, audits, all game records, and source hashes: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\local-tests\betting-study-2026-10-24T19-39-24-103Z.

## Reproduce without live play

From bot-starter: run the collector once for a fresh public snapshot, followed by the offline steps:

```powershell
node experiments/betting/collect.mjs
node --import tsx experiments/betting/prepare.mjs
node --import tsx --test experiments/betting/response.test.mjs experiments/betting/response-point.test.mjs
node --import tsx experiments/betting/simulate.mjs
node --import tsx experiments/betting/simulate-point.mjs
node experiments/betting/report.mjs
```

The collector is anonymous read-only network access; all subsequent steps operate on saved files. No step starts a live bot or edits its settings.
