# Wags and TaylorMason: local match comparison

## Findings

Completed 2,000 local matches in two 1,000-game batches. The detailed tables and intervals below use the fresh confirmation batch. The first batch used a simpler seed generator; a consecutive-seed coverage check prompted the move to a mixed generator and a separate confirmation run. The two batches are not pooled in the confidence intervals. Both used unchanged Wags and TaylorMason strategies.

- In the confirmation's 400 six-player games containing both bots, Wags averaged **28.6 points** versus TaylorMason's **19.8**. The paired difference was **+8.8 points**, with an approximate 95% interval of **+7.9 to +9.8** across 200 independent letter bags.
- Wags played **7.5 words/game** versus **3.5**, and bought **14.9 letters/game** versus **6.7**. Its average word length was **2.35 letters**, versus **2.78** for TaylorMason.
- Both struggled against the models: shared-first rates were **0.5%** for Wags and **0.25%** for TaylorMason. Average ranks were **4.98/6** and **5.69/6**.
- In direct two-player duels, Wags won **196/200**, TaylorMason **4/200**, with no ties. The initial batch also favored Wags, **187/200**. Duels have different economics from six-player games.
- In 200 paired replacements against all five models, Wags increased the target bot's score by **7.9 points** on average. The highest modeled rival scored **4.5 points less** with Wags than with TaylorMason (approximate 95% interval: **2.5 to 6.4 points less**). This is a counterfactual result inside this simulator; it does not establish suppression of actual public-server bots.
- All **37 tests** and the TypeScript build pass. No online games were entered, neither bot's policy was tuned or deployed, and no bot credentials were used.

The primary conclusion is that Wags's aggressive acquisition and quick short-word cashing outperform the current TaylorMason policy in this arena. Neither policy is consistently winning the six-player simulations. Approximate opponent behavior is the largest limit on extrapolating these findings to online play.

Initial batch: `bot-starter/local-tests/2026-10-24T12-56-46-308Z/`. Confirmation: `bot-starter/local-tests/2026-10-24T13-00-30-054Z/`. Complete results from both are preserved.

## Confirmation batch details

1000 deterministic local games completed across three scenarios. No network, account tokens, or public match entry was used. Neither live strategy nor its saved parameters was tuned by this evaluation.

TaylorMason uses the saved defensive weight 1.6. Wags uses its aggressive purchasing and short-word policy. Model opponents: Nijello, Chinese Dante, LetterShark, YeziShanYang, Doppio.

## Six-player games with both bots

400 games on 200 independent tile bags, with Wags and TaylorMason swapping starting positions for each bag. Four of the five priority models fill the remaining seats, with the omitted model rotated.

| Bot | Games | Avg score | Shared-first win rate | Avg rank | Avg spend | Words/game | Avg word length |
|---|---:|---:|---:|---:|---:|---:|---:|
| Wags | 400 | 28.6 | 0.5% | 5.0 | 123.4 | 7.5 | 2.3 |
| TaylorMason | 400 | 19.8 | 0.3% | 5.7 | 65.1 | 3.5 | 2.8 |

Paired Wags − TaylorMason score difference, averaged within each seed before calculating the interval: **8.8 [7.9, 9.8]**.

## Replacement comparison against five models

400 games: 200 matched pairs, replacing only the target bot in the same starting seat and keeping the letter bag and opponent roster fixed.

| Bot | Games | Avg score | Shared-first win rate | Avg rank | Avg spend | Words/game | Avg word length |
|---|---:|---:|---:|---:|---:|---:|---:|
| Wags | 200 | 28.7 | 0.0% | 5.7 | 118.8 | 7.3 | 2.4 |
| TaylorMason | 200 | 20.9 | 0.0% | 5.9 | 59.1 | 3.8 | 2.8 |

Paired target-score difference Wags − TaylorMason: **7.9 [6.7, 9.1]**.
Highest modeled rival score with Wags − highest modeled rival score with TaylorMason: **-4.5 [-6.4, -2.5]**. Negative values mean the modeled field scored less with Wags; positive values favor TaylorMason's suppression.

## Two-player duels

200 games, 100 independent tile bags with seats swapped. Strict wins: Wags 196, TaylorMason 4; ties 0. Two-player economics differ from the six-player competition format.

## Rules, checks, and limitations

Uses the source game's standard 98-tile distribution, five private starting tiles per player, 100 starting coins, Vickrey payment with reserve 1, randomized tie ordering, dictionary validation, and integer-rounded word rewards. Wins include shared first-place finishes. Every match checks cash and tile conservation. Only a player's own rack and public score/balance/retained purchases are supplied to its strategy; initial opponent letters and sealed bids are hidden.

Opening bids are submitted before words are cashed during the auction. Existing words can be played repeatedly within the auction window; the final awarded tile cannot be cashed after match end. RPC latency and client timing differences are idealized equally for all policies. No timer or lobby delay is simulated.

The public-data opponents are approximate behavior models. Several have poor losing-bid fidelity, and their own multiplayer strength has not been validated. These results compare policies inside this simulator, not their actual online win rates. The approximate 95% normal intervals describe variation across independent local seeds and do not cover model mismatch or network timing uncertainty.

Local duration: 83.1 seconds. Complete per-game data: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\local-tests\2026-10-24T13-00-30-054Z\matches.json. Aggregate data and source hashes: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\local-tests\2026-10-24T13-00-30-054Z\results.json.

Reproduce this batch from bot-starter: `npm.cmd run test:local -- --seeds 200 --seed-offset 1000000`. It never connects online. The shuffle uses a mixed seeded generator so consecutive seed inputs do not constrain the first shuffle draw to a narrow range.
