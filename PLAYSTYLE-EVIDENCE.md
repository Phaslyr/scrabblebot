# Strategy evidence from public history

Snapshot: 2026-10-24T16:30:52.254Z. Top 12 current win rates among bots with at least 50 games, plus top six ratings; latest 100 audited current-version games per bot. Competitive subset requires at least four known real rivals.

Audited 2857 completed games; 0 failed score/balance consistency checks and were excluded. No matches were run and no strategy settings were changed.

| Bot | Current public wins/games | Recent games | Recent score | Competitive wins/games | 7+ letter score share | Modal length | Purchases/game | Coins spent/game | Median final coins |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Nijello | 146/372 (39.2%) | 100 | 91.7 | 39/100 | 75.9% | 7 | 12.4 | 172.3 | 16.0 |
| Chinese Dante | 194/536 (36.2%) | 100 | 90.8 | 38/100 | 84.6% | 7 | 12.0 | 168.4 | 20.0 |
| LetterShark | 66/188 (35.1%) | 100 | 81.5 | 23/100 | 81.4% | 7 | 11.1 | 147.9 | 32.0 |
| YeziShanYang | 69/229 (30.1%) | 100 | 77.9 | 15/99 | 76.5% | 7 | 11.3 | 141.6 | 35.0 |
| Doppio | 124/412 (30.1%) | 100 | 87.4 | 24/100 | 79.1% | 7 | 12.0 | 171.7 | 13.0 |
| Metheny | 24/82 (29.3%) | 82 | 88.5 | 24/82 | 80.4% | 7 | 12.1 | 170.1 | 15.0 |
| Lambi Lambiii | 31/107 (29.0%) | 100 | 91.5 | 31/100 | 76.4% | 7 | 12.7 | 181.6 | 9.0 |
| Karthik | 39/148 (26.4%) | 100 | 80.6 | 21/100 | 71.5% | 7 | 12.1 | 161.2 | 14.0 |
| keanu_reeves | 84/340 (24.7%) | 100 | 73.7 | 23/100 | 84.8% | 7 | 9.4 | 137.9 | 30.0 |
| guesser | 103/427 (24.1%) | 100 | 84.2 | 22/100 | 81.3% | 7 | 13.1 | 170.5 | 14.0 |
| benx | 62/258 (24.0%) | 100 | 80.9 | 23/100 | 76.6% | 7 | 9.8 | 148.3 | 29.0 |
| postturing | 34/142 (23.9%) | 100 | 86.6 | 24/100 | 80.3% | 7 | 14.0 | 171.4 | 11.0 |
| bro | 25/321 (7.8%) | 100 | 80.6 | 17/100 | 75.2% | 7 | 13.1 | 173.4 | 6.0 |
| TaylorMason | 0/17 (0.0%) | 17 | 16.2 | 0/16 | 0.0% | 2 | 3.1 | 31.1 | 103.0 |

## Liquidity, timing, and public rack visibility

| Bot | Median winning bid / paid | Winning bid as balance % | Cash ≤10 during auctions | Nonempty rack exactly reconstructible | Games with rack emptied | Median buys until first 7+ word | Win followed by word within two auction periods using that letter |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nijello | 15.0 / 12.0 | 27.3% | 5.2% | 9.3% | 63.0% | 6.0 | 20.3% |
| Chinese Dante | 16.0 / 12.0 | 33.3% | 9.9% | 20.7% | 75.0% | 4.0 | 19.8% |
| LetterShark | 15.0 / 12.0 | 27.5% | 9.1% | 21.0% | 77.0% | 4.0 | 17.4% |
| YeziShanYang | 13.0 / 10.0 | 18.2% | 1.2% | 26.0% | 77.0% | 4.0 | 23.2% |
| Doppio | 15.0 / 12.0 | 33.3% | 3.4% | 10.1% | 85.0% | 6.0 | 21.3% |
| Metheny | 13.0 / 11.0 | 35.5% | 20.9% | 19.8% | 93.9% | 7.0 | 17.5% |
| Lambi Lambiii | 16.0 / 12.0 | 35.1% | 14.6% | 34.4% | 93.0% | 4.0 | 27.3% |
| Karthik | 15.0 / 12.0 | 32.1% | 9.0% | 29.8% | 77.0% | 4.0 | 20.8% |
| keanu_reeves | 17.0 / 12.0 | 30.1% | 6.2% | 17.6% | 54.0% | 4.0 | 18.5% |
| guesser | 15.0 / 12.0 | 30.0% | 5.2% | 18.6% | 85.0% | 6.0 | 16.3% |
| benx | 18.0 / 13.0 | 33.0% | 6.8% | 20.2% | 73.0% | 4.0 | 19.5% |
| postturing | 12.0 / 11.0 | 30.3% | 8.7% | 14.1% | 51.0% | 6.0 | 14.6% |
| bro | 14.0 / 12.0 | 37.1% | 15.4% | 20.2% | 69.0% | 6.0 | 16.8% |
| TaylorMason | 16.0 / 10.0 | 24.1% | 0.0% | 20.4% | 70.6% | n/a | 46.2% |

Exact rack visibility is established only when public rack size equals the total conservative known letter counts. Initial letters are never guessed. Emptying a rack guarantees a fresh exact public reconstruction thereafter. No private tables or live winning-bid spectator views were queried.

## Observed payout timing

| Bot | Median first 7+ word, auction progress | Median rack size before word | Median coins before word | Words played at ≤20 coins | Points scored in final 20% of auctions |
|---|---:|---:|---:|---:|---:|
| Nijello | 64.7% | 8.0 | 10.0 | 74.7% | 46.2% |
| Chinese Dante | 36.8% | 8.0 | 10.0 | 70.9% | 24.3% |
| LetterShark | 42.6% | 8.0 | 20.0 | 51.3% | 32.4% |
| YeziShanYang | 25.0% | 8.0 | 29.0 | 35.3% | 40.3% |
| Doppio | 60.3% | 8.0 | 12.0 | 89.3% | 35.8% |
| Metheny | 41.2% | 8.0 | 6.0 | 97.0% | 21.1% |
| Lambi Lambiii | 22.1% | 7.0 | 11.0 | 76.9% | 9.6% |
| Karthik | 36.8% | 7.0 | 11.0 | 68.0% | 22.6% |
| keanu_reeves | 42.6% | 8.0 | 18.0 | 53.6% | 36.2% |
| guesser | 60.3% | 7.0 | 14.0 | 65.0% | 17.8% |
| benx | 55.9% | 7.0 | 20.0 | 50.2% | 30.1% |
| postturing | 39.7% | 8.0 | 10.0 | 84.6% | 25.9% |
| bro | 42.6% | 8.0 | 10.0 | 89.0% | 10.2% |
| TaylorMason | n/a | 3.0 | 100.0 | 0.0% | 5.8% |

Progress counts settled auctions, rather than elapsed wall time. First-long-word medians include only games in which that bot played a 7+ word. The records show when words were played, not when they first became available, so these timings do not establish deliberate waiting or a particular cash-out rule. Low-cash auction statistics sample balances at auction opening; they do not measure every moment within the auction.

The purchase-to-word statistic is an association: it does not prove the purchased letter was needed, because an identical letter might already have been held privately. Winning-bid ratios describe won auctions only; losing bids remain censored.

Public leaderboard percentages include ties, use each bot's current version, and span different eras and opponent fields. The recent subset can differ substantially; competitive subsets are not strength-adjusted and do not isolate causality. Deleted opponent identities are marked unknown rather than assumed real. Short-lived new entrants are excluded from the substantial-history selection.

Raw and aggregate evidence: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\opponents\data\analysis-2026-10-24T16-30-42-610Z\playstyle-analysis.json.
