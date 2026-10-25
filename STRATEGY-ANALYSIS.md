# What is working, and how Wags and TaylorMason could counter it

Public snapshot: October 24, 2026, approximately 9:30 AM Pacific. This was analysis only: no matches were entered or simulated, neither bot's strategy was changed, and the existing opponent models were not refitted.

The main pattern is **large word payouts that fund further purchases**. Every one of the 13 leading bots selected for review most often played seven-letter words. Between **71.5% and 84.8% of their points** came from words of seven or more letters.

## Evidence and scope

The review used anonymous public records for 2,857 completed matches. All passed exact reconstruction of final scores and balances from word rewards and auction payments, with no negative reconstructed rack sizes. Behavior statistics use each bot's latest 100 completed games in its current recorded version, or all available games if fewer. Selection combines the top 12 current-version win rates among bots with at least 50 games and the top six ratings in that group, yielding 13 distinct contenders. TaylorMason is included separately for context.

Full per-bot tables and definitions are in [PLAYSTYLE-EVIDENCE.md](PLAYSTYLE-EVIDENCE.md). The [aggregate JSON](bot-starter/opponents/playstyle-analysis.json) records the snapshot, queries, collection times, and source hashes. The review also covers Karthik, keanu_reeves, guesser, benx, postturing, and bro beyond the seven below.

| Bot | Public current-version wins/games | Recent average score | Points from 7+ letters | Observed distinction |
|---|---:|---:|---:|---|
| Nijello | 146/372, 39.2% | 91.7 | 75.9% | First long word at median 65% of auctions; 46% of points in final fifth |
| Chinese Dante | 194/536, 36.2% | 90.8 | 84.6% | Strong concentration in long words; recent wins 38/100 |
| LetterShark | 66/188, 35.1% | 81.5 | 81.4% | Recent wins 23/100, below its historical percentage |
| YeziShanYang | 69/229, 30.1% | 77.9 | 76.5% | Only 1.2% of auction openings at 10 coins or less |
| Doppio | 124/412, 30.1% | 87.4 | 79.1% | Later first long payout, median 60% of auctions |
| Metheny | 24/82, 29.3% | 88.5 | 80.4% | Highest rating in snapshot; low cash at 20.9% of auction openings |
| Lambi Lambiii | 31/107, 29.0% | 91.5 | 76.4% | Earlier first long payout, median 22%; highest spending among these seven |

These are observed outcomes, not recovered source code. Win percentages include shared first places and reflect different eras and opponent fields. Recent samples are not strength-adjusted and do not establish a precise ordering of skill. Metheny's behavior sample has 82 games; the other six have 100. First-long-word timing includes only games with a long word and does not establish when that word first became available.

## Why the patterns work

**Long words improve both scoring and buying power.** The [scoring rules](https://github.com/clockworklabs/scrabblebot/blob/main/spacetimedb/src/letters.ts) give 2–3 letters a 1x multiplier, four 1.5x, five 2x, six 2.5x, and seven or more 3x. The [word submission rules](https://github.com/clockworklabs/scrabblebot/blob/main/spacetimedb/src/game.ts) add the reward to both score and cash. A good word finances the next acquisition cycle. Seven is where the multiplier stops increasing; longer words can still add base points.

A dictionary-checked example shows the opportunity cost of always preferring short words. The letters `TACTICSAX` can produce `TACTICS` (33) plus `AX` (9), totaling **42**. Splitting the same letters into `AX` (9), `ACTS` (9), and `TIC` (5) gives **23**. This is a scoring example, not a new match or an estimate of a bot's improvement. Short words can still be right when cash is urgent, the short word is particularly valuable, or time is running out.

**Several contenders cash words when funds are low.** Median cash immediately before a word was 10 for Nijello and Chinese Dante, 6 for Metheny, and 11 for Lambi. Metheny played 97% of its words at 20 coins or less; Doppio 89%. This is consistent with replenishing spending money, although public history cannot identify their actual trigger rules.

**Current score can conceal a late threat.** Nijello and Doppio have later payout patterns than Lambi. Targeting only the current score leader can miss an opponent accumulating a large future payout. Lambi's earlier payouts can finance competition earlier in the game.

**Cash is actively deployed.** Median final balances among the seven contenders range from 9 to 35 coins. Their median winning bids are 13–16, while median actual payments are 10–12. All reviewed recent games used the second-price rule: the winner generally pays the runner-up's bid, with a reserve when uncontested. Payments are not winning bid amounts, and these medians are not universal bid targets.

## Counters worth trying

### 1. Improve Wags's return on its purchases

Preserve aggressive buying, but let Wags keep a strong five-to-seven-letter plan instead of automatically consuming those letters in a short word. Evaluate the total reward of multiple words from the rack, rather than only immediate reward per tile. Allow short cash-outs when liquidity, remaining auctions, or the short word's value justify them.

This is the highest-priority hypothesis. In the [existing local confirmation tests](LOCAL-TEST-RESULTS.md), Wags bought 14.9 letters per game but averaged 28.6 points with 2.35-letter words. Its acquisition activity is substantial; the scoring rules provide a concrete reason to investigate how those letters are used. Public and local scores come from different fields and are not directly interchangeable benchmarks.

### 2. Aim TaylorMason's defense at likely future payouts

Track each rival's total rack size, known letters, cash, and observed payout pattern. Estimate future threat alongside current score. Raise a defensive bid mainly when the letter completes a valuable opposing plan and buying it does not destroy our own scoring opportunity.

TaylorMason currently tracks conservative known letters and weights threats partly by displayed score. It misses completions involving private starting letters and can underweight opponents before large payouts. Blocking one letter may delay a payout or force another plan; it does not guarantee permanent denial of the whole reward. A costly block can also help the other four rivals more than us.

### 3. Exploit periods when an opponent's rack becomes fully known

Public rack size is starting rack size plus purchases minus letters played. Public purchases and words also give conservative lower bounds on letter counts. When those counts sum to the full rack size, the entire rack is known. Emptying the rack guarantees this condition for subsequent purchases and plays.

Lambi's nonempty rack was exactly reconstructible at **34.4% of sampled auction openings**, versus Chinese Dante's 20.7% and Nijello's 9.3%. These are useful windows for precise completion-based defense. Earlier, retain uncertainty and spend less confidently. TaylorMason tracks the lower bounds but does not explicitly track when they constitute a complete rack.

### 4. Contest useful letters during low-cash windows

Metheny had 10 coins or less at 20.9% of auction openings, Lambi at 14.6%, and Nijello at 5.2%. Those are promising opportunities to buy letters we value while a rival has limited funds. Cashing our own available word before a contested auction could preserve our advantage. Rivals can also earn cash during an auction, so opening cash is not a guaranteed ceiling throughout it.

In second-price auctions, a losing bid can raise the winner's payment if it becomes the runner-up. That could disrupt the cash cycle, but sealed rival bids are unknown and the bid may instead win an unwanted tile. Keep bids within an amount we can justify paying.

### 5. Account for unplayed points and unused cash near the end

Against late scorers, estimate rack value before the score jumps. Release unnecessary reserves as opportunities run out, and submit playable words before match end. The source ends the match immediately after the final tile settles; an external bot cannot rely on playing that final purchased tile afterward.

TaylorMason ended the prior six-player local confirmation games with 54.6 coins on average. Its 20-coin defensive reserve and low exploration bids merit review together with its scoring policy. Spending excess cash on arbitrary denial is not an established improvement.

## Suggested evaluation, not performed

Compare unchanged Wags with an aggressive-buying variant that considers word retention and total rack reward. Separately compare unchanged TaylorMason with exact-rack detection and future-payout threat estimates. Keep changes separate initially. Measure our score, wins, and the strongest rival's score; word count alone is a poor target.

Refresh the opponent library before treating that comparison as representative of the current server. The existing five models omit Metheny and Lambi, and their documented losing-bid conflicts limit fidelity. Use matched independent bags, seat swaps, and a separate holdout after tuning. The previous local result that Wags lowered the strongest modeled rival's score by about 4.5 points relative to TaylorMason supports investigating acquisition pressure, but does not prove suppression of real public bots.

Recommended order: **Wags's word-value decisions first, TaylorMason's completion defense second, and opponent-specific timing adjustments third.** The evidence supports these as hypotheses; their improvement remains untested.
