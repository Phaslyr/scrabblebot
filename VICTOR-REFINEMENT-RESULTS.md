# VictorMateo refinement results

There is a promising upgrade over original VictorMateo, but the hybrid has not established an advantage over the fixed TaylorMason policy. Separate the scoring-engine improvement from claims that switching modes is superior.

Completed **2,384 local six-player games** in two development iterations, an untouched validation set, and three sensitivity checks. The selected configuration is **modern-original-phase**. No public games were entered and none of the 18 monitored live files changed.

The result is not uniform across rival assumptions: in low, Victor + 5 public-data models, the shared-first change was **-18.75 [-41.08, 3.58] percentage points**, with score change 1.38 [-11.84, 14.59]. Keep the candidate experimental; the main-field improvement does not establish universal superiority.

## Candidate and what changed

Frozen candidate settings: `{"id":"modern-original-phase","engine":"modern","phase":"legacy","attackWeight":0.8,"reserve":30,"exploration":3}`.

Original Victor uses the older scoring engine. The modernization candidates use the same newer word planning and productive bidding as current Wags/TaylorMason. The original-phase variant retains Victor’s old funding and position thresholds. Adaptive variants can enter defense after 30 earned points with attainable cash, preserve a smaller reserve, and use different entry/exit thresholds to avoid constant switching. Productive purchases remain available during defense; baseline exploration and its associated pressure extension are reduced on unproductive tiles. They keep scoring in every phase.

The hold-only branch keeps the original policy and protects the ingredients of a valuable completion during the current auction when the committed bid is substantial. It never holds an available seven-letter word. Fixed TaylorMason/Wags controls use the actual current scoring functions throughout, under Victor’s identity, to test whether a hybrid adds value beyond the newer engine itself.

## Final validation

Each row uses 160 new bags, matched between policies within its field. These bags were not used for selection or tuning. All seats and model lineups rotate. Shared first place counts as a win. Public bot names identify approximate models, not their original code or actual server performance.

| Field | Policy | Average score | Shared-first rate | Highest public-model score |
|---|---|---:|---:|---:|
| Victor + TaylorMason + Wags + 3 models | Original Victor | 45.74 | 2.5% | 80.48 |
| Victor + TaylorMason + Wags + 3 models | Selected Victor | 56.79 | 11.3% | 80.42 |
| Victor + TaylorMason + Wags + 3 models | Fixed TaylorMason policy | 62.73 | 18.8% | 79.56 |
| Victor + TaylorMason + Wags + 3 models | Fixed Wags policy | 56.55 | 11.3% | 80.34 |
| Victor + 5 public-data models | Original Victor | 55.08 | 10.0% | 85.24 |
| Victor + 5 public-data models | Selected Victor | 67.41 | 26.3% | 81.83 |
| Victor + 5 public-data models | Fixed TaylorMason policy | 74.69 | 41.9% | 79.73 |
| Victor + 5 public-data models | Fixed Wags policy | 68.96 | 29.4% | 81.55 |

Victor + TaylorMason + Wags + 3 models: seven-letter-or-longer words per game changed from 0.80 to 1.13; mean spend changed from 138.86 to 144.56 coins. These describe scoring output and cost, rather than proving a specific purchase caused the gain.
Victor + 5 public-data models: seven-letter-or-longer words per game changed from 1.00 to 1.52; mean spend changed from 149.75 to 153.10 coins. These describe scoring output and cost, rather than proving a specific purchase caused the gain.

Paired changes, with approximate 95% intervals:

| Field | Selected Victor versus | Own score change | Shared-first change, percentage points | Highest public-model score change |
|---|---|---:|---:|---:|
| Victor + TaylorMason + Wags + 3 models | Original Victor | 11.04 [8.67, 13.42] | 8.75 [3.15, 14.35] | -0.06 [-3.04, 2.92] |
| Victor + TaylorMason + Wags + 3 models | Fixed TaylorMason policy | -5.94 [-8.46, -3.43] | -7.50 [-14.35, -0.65] | 0.86 [-1.63, 3.35] |
| Victor + TaylorMason + Wags + 3 models | Fixed Wags policy | 0.24 [-0.27, 0.75] | 0.00 [-1.74, 1.74] | 0.08 [-0.48, 0.64] |
| Victor + 5 public-data models | Original Victor | 12.32 [9.99, 14.66] | 16.25 [8.50, 24.00] | -3.41 [-5.87, -0.96] |
| Victor + 5 public-data models | Fixed TaylorMason policy | -7.28 [-9.47, -5.09] | -15.63 [-23.50, -7.75] | 2.09 [-0.30, 4.49] |
| Victor + 5 public-data models | Fixed Wags policy | -1.56 [-2.70, -0.41] | -3.13 [-6.78, 0.53] | 0.28 [-1.07, 1.62] |

A negative rival-score change supports defensive pressure; a positive change means the strongest model scored more. This does not identify a particular denied word or establish causality for an individual purchase.

## Against the actual local Wags and TaylorMason policies

These measurements come from the mixed six-player field; they compare final scores in the same game, not two-player matches. Strictly-beat rates exclude ties.

| Victor policy | Mean score margin versus TaylorMason | Beats TaylorMason | Mean score margin versus Wags | Beats Wags |
|---|---:|---:|---:|---:|
| Original Victor | -28.66 | 9.4% | -14.64 | 25.0% |
| Selected Victor | -11.65 | 35.0% | 0.57 | 46.3% |

## Did the hybrid actually switch modes?

| Field | Victor policy | Games entering defense | Games entering rebuild | Auction decisions in defense | Mean transitions | Long-word score share | Mean final cash |
|---|---|---:|---:|---:|---:|---:|---:|
| Victor + TaylorMason + Wags + 3 models | Original Victor | 3/160 | 3/160 | 0.7% | 0.04 | 61.3% | 6.89 |
| Victor + TaylorMason + Wags + 3 models | Selected Victor | 5/160 | 5/160 | 1.3% | 0.06 | 66.6% | 12.22 |
| Victor + 5 public-data models | Original Victor | 6/160 | 6/160 | 1.7% | 0.07 | 60.6% | 5.33 |
| Victor + 5 public-data models | Selected Victor | 16/160 | 13/160 | 5.2% | 0.20 | 71.7% | 14.31 |

## Two development iterations

Development results select a candidate; they are not independent evidence of improvement. Own score averaged equally across both fields selects among refinements, with lowest public-rival score as the tie-breaker. The fixed TaylorMason policy is a benchmark and is not eligible to become the selected hybrid.

| Iteration | Configuration | Mean score across both fields | Shared-first rate | Highest public-model score |
|---|---|---:|---:|---:|
| 1 | static-taylor | 70.28 | 30.0% | 81.44 |
| 1 | modern-original-phase | 63.45 | 17.5% | 79.79 |
| 1 | modern-adaptive | 61.17 | 10.0% | 82.38 |
| 1 | hold-only | 50.44 | 8.8% | 80.89 |
| 1 | original | 49.29 | 6.3% | 81.80 |
| 2 | static-taylor | 67.05 | 25.0% | 79.20 |
| 2 | modern-original-phase | 63.36 | 16.3% | 81.29 |
| 2 | modern-original-phase-lean | 61.77 | 13.8% | 81.63 |
| 2 | modern-original-phase-patient | 61.70 | 12.5% | 82.54 |

Iteration 1 selected modern-original-phase; iteration 2 selected modern-original-phase. The second pass tested only the parent and two predeclared nearby variants on 40 other bags per field. Candidate settings and all simulation inputs were frozen before final validation.

In iteration 1, the earlier-switching adaptive variant entered defense in 52/80 games and retained 23.90 coins on average; the modernized original-phase variant entered in 6/80 and retained 13.96 coins. More frequent defense did not translate into better development scores. This compares complete configuration packages, including their reserves and pressure settings, rather than isolating phase frequency alone.

## Sensitivity checks

Each row uses 32 additional bags per policy and field. Low/high replace unidentified losing bids with the 15%/85% point in their allowed interval. Planning opponents replace the empirical bid/word model with the newer Wags/TaylorMason scoring functions, retaining the public opponent names and statistics. This is a stress test, not a claim that those public bots use our strategy.

| Rival assumption | Field | Selected − original score | Shared-first change, percentage points | Highest public-model score change |
|---|---|---:|---:|---:|
| low | Victor + TaylorMason + Wags + 3 models | 16.34 [10.66, 22.03] | 12.50 [0.86, 24.14] | -2.59 [-9.27, 4.08] |
| low | Victor + 5 public-data models | 1.38 [-11.84, 14.59] | -18.75 [-41.08, 3.58] | 5.59 [-0.69, 11.88] |
| high | Victor + TaylorMason + Wags + 3 models | 10.63 [7.68, 13.57] | 3.13 [-3.00, 9.25] | 3.66 [-3.66, 10.97] |
| high | Victor + 5 public-data models | 14.28 [9.64, 18.93] | 6.25 [-6.00, 18.50] | -9.28 [-15.40, -3.16] |
| planning | Victor + TaylorMason + Wags + 3 models | 9.25 [1.34, 17.16] | 3.13 [-13.30, 19.55] | -0.13 [-7.79, 7.54] |
| planning | Victor + 5 public-data models | 17.66 [9.60, 25.71] | 21.88 [4.87, 38.88] | -2.78 [-10.09, 4.53] |

## Public evidence and limits

The anonymous public snapshot was collected at 2026-10-24T21:54:11.924Z. All 1000 completed games passed score/balance reconstruction. Leaders were chosen by current win rate with at least 50 current-version games and 20 current-version appearances in the downloaded archive. Stale LetterShark had insufficient recent participation and was excluded by this rule.

| Public model | Current wins/games | Archive games | Modal minimum word length | Heuristic cash-out balance |
|---|---:|---:|---:|---:|
| Nijello | 253/635 (39.8%) | 139 | 7 | 10 |
| postturing | 46/117 (39.3%) | 117 | 7 | 10 |
| Chinese Dante | 292/790 (37.0%) | 134 | 7 | 9 |
| Doppio | 200/672 (29.8%) | 131 | 7 | 11 |
| Ambees | 49/168 (29.2%) | 142 | 7 | 8 |
| Lambi Lambiii | 90/318 (28.3%) | 110 | 7 | 14 |

Public metadata is supplied equally to all policies, including the unchanged controls. Bid samples use public winning bids and upper bounds for losses; weak losing bounds are retained. Per-bot word length and cash-out thresholds come from observed words, with explicit rack-size and endgame fallbacks. Public history does not reveal which unplayed words were available. Initial rival letters and hidden losing bids remain unavailable.

1338 winning bids exceeded reconstructed opening cash, consistent with later bids after scoring; replay fractions are capped to available cash. The arena submits opening bids, permits word plays before settlement, and idealizes network timing. It cannot reproduce later bid revisions or latency. The chosen opponent archive is reused across development and validation; only letter bags and replay draws are fresh. Planning and bid-bound sensitivities probe this model dependence but do not replace real matches.

There are 2,384 runs, not 2,384 independent samples. Each validation comparison uses 160 paired bags per field. Sensitivity uses 32; development uses 40 per field in each pass. Intervals are approximate, exploratory and unadjusted for multiple comparisons. No final-validation or sensitivity result was used to retune the candidate. Tests verified control equivalence, word holds, earned-point phase entry, rebuilding/reset, affordability/final-tile behavior and public-information enrichment. Every arena game checks word legality plus cash and tile conservation.

Artifacts: [protocol](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/victor-refinement/PROTOCOL.md), [candidate implementation](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/experiments/victor-refinement/policy.mjs), [frozen configuration](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/victor-refinement-2026-10-24T21-54-02-464Z/selected-candidate.json), [complete results](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/victor-refinement-2026-10-24T21-54-02-464Z/results.json), [validation games](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/victor-refinement-2026-10-24T21-54-02-464Z/validation-games.json), [collection manifest](C:/Users/edan1/Desktop/calhacks13/scrabblebot/bot-starter/local-tests/victor-refinement-2026-10-24T21-54-02-464Z/manifest.json).

From bot-starter, rerun the same local study with `node --import tsx experiments/victor-refinement/run.mjs`. This uses the saved opponent data and repeats the fixed seed schedule. It overwrites that study’s output files; save a copy first if preserving them is needed. No online runner is imported.
