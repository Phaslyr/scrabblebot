# TaylorMason: review of the stopped offense-only online run

TaylorMason is stopped and automatic monitoring has been deleted. This review changes no strategy and starts no games.

## Performance

The final sample contains **50 completed games marked full**, excluding 11 recorded partial games. Every included game had five real rivals and no simulated seats. The policy stayed `taylor-offense-v4/public-six`, with zero defensive bids.

| Metric | TaylorMason | Match winners |
|---|---:|---:|
| Wins | 1/50 (2%) | — |
| Average score | 55.94 | 103.20 |
| Average rank | 4.74/6 | — |
| Seven-plus-letter words per game | 1.52 | 1.74 |
| Average points per seven-plus-letter word | 30.87 | 48.10 |
| Letters purchased per game | 11.74 | 13.96 |
| J/Q/X/Z tiles purchased across these games | 0 | 33 |

Own word rewards reconcile exactly to recorded scores. Winner word logs also reconcile to final winner scores in all 50 games. Winner statistics include TaylorMason's one win and do not establish a causal benefit for particular purchases.

TaylorMason spent 127.38 coins/game and finished with 28.56 coins on average. Seven-plus-letter words provided 83.9% of its points. The problem is not that it still spams short words: longer words now dominate scoring, but their rewards are too low.

The old eight-game defensive-policy batch averaged 62.88 points, rank 4.00, and 32.40 points per long word, with no wins. These separate, small observational batches used different bags and opponents. They do not isolate either defense removal or the word preferences. The current live results do not establish an improvement over the old policy, despite favorable local tests.

## Reliability and the remaining strategic gap

The campaign recorded **321 “Auction closed” bid rejections** across all logs, including partial games, plus four word submissions rejected after a match ended. There were two logged connection closures; the first was automatically restarted, while the second preceded the user's stop request. Errors do not include match IDs, so campaign-wide counts should not be described as errors in the 50-game sample alone.

The 50 full games have 2,986 logged opening decisions, of which 208 had nonpositive local deadline estimates. Local clock differences can affect those estimates. A match being marked full does not guarantee every auction update or bid was received on time. Calculation itself was relatively fast: the 48-game checkpoint measured approximately 26 ms at the 95th percentile and 169 ms maximum, so the first investigation should target event delivery, queuing and bid acknowledgement rather than assuming the planner is too slow.

A descriptive subset of **27 games** had 68 opening decisions, no nonpositive local deadline estimates, and no logged error between match start/end. Those games averaged **60.63 points**, rank **4.63/6**, versus **99.74** for winners, with one win. This subset is selected after the fact and is not an unbiased control group, but the substantial remaining gap means connection problems alone are an insufficient working explanation.

## What the purchase evidence says

For the 119 logged J/Q/X/Z auction decisions in full games, our median bid was **9**, while the median actual winning payment was **30**. We won none. Actual payment is not the winner's sealed bid; exceeding 30 would not guarantee winning or profitability.

In the 27-game subset with complete opening logs and no recorded timing errors, there were 76 such decisions: median own bid **7**, median payment **30**, and still no wins. None of these cases showed a losing own bid above the actual payment. This strongly motivates studying acquisition valuation in addition to fixing delivery, rather than attributing the missing premium purchases entirely to networking.

The recorded current policy made 359 positive acquisition increases across the 50 games. Only 23 were associated with the current letter being missing from the selected public-word goal. None of the ten preferred anagram families was played. That is evidence of narrow coverage, not proof the preference is harmful: those words were sparsely repeated even in the public fitting data. Most of the behavior comes from the general planner and letter preferences, rather than pursuing those particular words.

## Recommended experiments, in order

1. **Make delivery measurable and reliable.** Log match ID, auction ID, update arrival, calculation start/end, bid-send and acknowledgement for every bid/error. Reconcile expected auction IDs against observed decisions and accepted submissions. Investigate stale subscriptions or event backlogs and test a reconnect policy against a stalled stream. Keep scoring settings fixed while evaluating this work so transport changes are identifiable. Do not simply skip bids based on an uncalibrated local clock.

2. **Revalue useful premium-letter access earlier.** Evaluate how acquiring a premium tile opens several plausible high-paying words after future common-letter purchases, rather than requiring an almost complete word first. Test a bounded acquisition allowance against the observed price distribution and keep a separate increased-spending control. A 30-coin clearing price is evidence about competition, not a universal target bid; require realistic rack utility, alternative outlets and sufficient funds. Keep defense disabled.

3. **Prioritize payout quality within the existing planner.** Seven letters is a multiplier threshold, not a guarantee of a valuable word. Our 30.9-point long words lag the winners' 48.1-point words. Test a small, conditional preference for materially higher-paying completions, including valuable five/six-letter words. Retain spare-letter income, urgent cash-outs and endgame liquidation. Avoid replacing the entire word policy or broadly holding words longer: earlier local replacements regressed badly.

4. **Broaden the public prior beyond ten spellings.** Generalize across compatible letter combinations, anagram families and multiple high-value dictionary completions. Retain the entire dictionary and shrink sparse observations. Test word-family guidance separately from letter preference and a larger bid allowance; the preceding local study did not establish that word history beat extra spending alone.

5. **Calibrate the local benchmark against this run.** The selected policy's local win rates of roughly 42–45% did not transfer to these online games. Require modeled opponents to reproduce observed scoring, premium-letter prices, purchases and word-payout distributions, then validate on held-out histories. Use the 50 games diagnostically, not as both tuning data and final proof. A later authorized online comparison should alternate fixed variants across the same period, with predeclared scoring and reliability measures.

The next useful target is a dependable client that can contest worthwhile premium tiles and produce substantially higher-paying words. More unchanged online volume alone will not resolve the mechanism behind the gap.

Sources: [complete game-level review](TAYLOR-ONLINE-REVIEW.json), [premium-auction analysis](TAYLOR-PREMIUM-AUCTION-REVIEW.json), [48-game checkpoint](bot-starter/runs/TaylorMason/2026-10-25T02-34-48-367Z/ONLINE-CHECKPOINT-0048.json), and the two campaign run directories recorded in `bot-starter/runs/taylor-offense-online-active.json`.
