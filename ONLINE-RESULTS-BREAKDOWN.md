# Clean online test breakdown

TaylorMason completed eight full matches before the stop request. The batch ended automatically at 23:12:09 UTC on October 24, 2026; the stop request was recorded at 23:17 UTC. The bot remains stopped.

This report excludes the clean session’s one partial match and all four startup integration sessions. The eight full matches used scoring-pressure-v3, fixed defense weight 1.6, the corrected remaining-bag adapter, and the repaired live subscription. Every full match had five real rivals.

## Results

| Match | Our score | Finish | Winner | Winning score | Gap |
|---|---:|---:|---|---:|---:|
| 12761 | 53 | 5/6 | SookraBot | 120 | 67 |
| 12770 | 89 | 2/6 | SookraBot | 98 | 9 |
| 12779 | 58 | 3/6 | Lionel | 136 | 78 |
| 12788 | 46 | 4/6 | LUCENT | 121 | 75 |
| 12797 | 51 | 5/6 | Menice | 123 | 72 |
| 12806 | 52 | 5/6 | LetterSharkUltra | 121 | 69 |
| 12816 | 71 | 5/6 | swanbot | 85 | 14 |
| 12826 | 83 | 3/6 | Nijello | 102 | 19 |

Wins: 0/8. Average score: 62.9. Average finish: 4.0/6. Top-three finishes: 3/8. Average winning score: 113.3, leaving an average 50.4-point gap. Three games were within 20 points; the other five were at least 67 points behind.

Eight games cannot establish a reliable long-term win rate. These results nevertheless give no support for carrying the earlier simulated win rates into the real competition.

## Where the points went

| Measure | TaylorMason | Match winners |
|---|---:|---:|
| Average score | 62.9 | 113.3 |
| Words per game | 4.13 | 3.00 |
| Seven-letter-or-longer words per game | 1.25 | 2.00 |
| Points per seven-letter-or-longer word | 32.4 | 49.1 |
| Score share from seven-letter-or-longer words | 64.4% | 86.8% |
| Letters purchased per game | 14.13 | 14.25 |
| Coins spent per game | 148.1 | 190.0 |

Winner word logs account for every point in all eight winning scores. We bought almost the same number of letters and played more words, but winners made more high-value long words. Our long-word scoring deficit was 57.8 points per game; our extra shorter-word scoring recovered only 7.4 points of that deficit. The evidence points toward acquisition and word quality, rather than simply buying more letters. It does not prove that any individual short word destroyed a better unplayed opportunity; private racks were not fully recorded.

Examples: Menice scored 81 with CAZIQUE and 42 with FORGERY; LUCENT scored 66 with CAPSIZED and 33 with YOUNGER. Our ten long words averaged only 32.4 points each.

## What defense actually changed

There were 28 purchases labelled defensive, costing 287 coins in total. That is the full purchase price of those tiles, not extra spending caused by raising our bid.

Holding recorded rival bids fixed in these second-price auctions:

- 23 purchases would still have been won with the offensive baseline bid.
- 2 required the raised bid to beat the recorded rival price.
- 3 would have become ties at the baseline; their outcomes are uncertain.

The two clear ownership changes were N in match 12816 (baseline 12, bid 21, price 16) and E in match 12826 (baseline 3, bid 9, price 8). Those changes do not establish that a rival’s word was prevented. The logs do not support treating 28 defensive purchases as 28 successful blocks, or treating all 287 coins as wasted defensive spending.

## Runtime and outlook

The runner evaluated all 544 full-match auctions. Average decision time was 9.6 ms; the 95th percentile was 35.5 ms, and the maximum was 139.7 ms. There were two Auction closed bid errors in the clean session and no word-submission errors. Most decisions were timely; timing alone is not a convincing explanation for the repeated scoring gap.

The corrected setup works, but our local opponent models were too optimistic as a guide to real competitiveness. Several observed winners—SookraBot, LUCENT, Lionel, Menice, LetterSharkUltra and swanbot—were outside the latest six-model refinement pool. TaylorMason remains our strongest locally tested policy, but this batch does not establish it as competitive with the live leaders.

The next useful research direction is higher-value long-word planning and premium-letter acquisition, plus a defense metric based on actual ownership changes. That is a recommendation only: no new experiments, policy changes, or online matches were started for this analysis.

Original evidence: bot-starter/runs/TaylorMason/2026-10-24T23-02-06-768Z/results.json and events.jsonl. Detailed computed tables are saved beside them as BREAKDOWN.json, WORD-BREAKDOWN.json and PURCHASE-BREAKDOWN.json.
