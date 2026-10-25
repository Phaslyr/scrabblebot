# TaylorMason: online defensive training results

Completed 12 eligible, fully observed online games, each against five real rivals in this run. Excluded 1 recorded partial games, the initial diagnostic run, and a game interrupted by a lost connection.

| Setting (defense weight) | Games | Our average score | Average highest real rival | Defense-motivated wins | Coins spent on those wins |
|---|---:|---:|---:|---:|---:|
| baseline (0) | 2 | 20.0 | 116.0 | 0 | 0 |
| cautious (0.4) | 2 | 10.5 | 155.0 | 0 | 0 |
| assertive (0.8) | 4 | 12.3 | 124.8 | 2 | 18 |
| pressure (1.6) | 4 | 26.0 | 119.5 | 35 | 399 |

Exploratory selected defensive setting: **pressure**, weight **1.6**. It is saved for the normal Start-Bot launcher.

The selected setting averaged 26.0 points versus the baseline's 20.0, while its strongest rivals averaged 119.5 versus 116.0. The overall rival-score comparison does not show suppression. Match wins: 0/12. More defensive purchases have not yet established a competitive advantage.

Selection uses exploration games only and maximizes 0.5 × our score − the highest real rival's score. Each eligible candidate needs at least two exploration games. Validation games do not select the winner.

Selected setting's fresh validation: 2 games, our average 24.5, average highest rival 108.5.

Decision computation p95: 8.8 ms across 815 recorded evaluation decisions. The implementation's 16 tests and TypeScript build pass.

## What the numbers mean

Defense-motivated wins are purchases where the defensive rule raised our bid above the baseline. They show that the bot acquired letters it identified as threats. They do not establish that the baseline would have lost those auctions, or prove how many points a rival would otherwise have scored.

Opponent starting racks remain private. The bot uses conservative counts reconstructed only from public purchases and word plays, targets valuable visible completions, and reserves 20 coins for extra defensive bids. This misses threats involving unknown starting letters.

The field and tile draws change between games. This small sequential online sample cannot establish causal score suppression or a reliable win-rate improvement. Treat the selected profile as exploratory. An earlier diagnostic run that skipped auctions due a client/server clock comparison was excluded entirely; that timing check was removed before these evaluation sessions.

## Individual evaluation games

| Match | Setting | Phase | Our score | Highest real rival | Rank | Defense-motivated wins | Defense spend |
|---|---|---|---:|---:|---|---:|---:|
| 1240 | baseline | exploration | 22 | 94 | 6/6 | 0 | 0 |
| 1245 | cautious | exploration | 16 | 192 | 6/6 | 0 | 0 |
| 1250 | assertive | exploration | 26 | 146 | 5/6 | 0 | 0 |
| 1255 | assertive | exploration | 11 | 108 | 6/6 | 1 | 8 |
| 1260 | cautious | exploration | 5 | 118 | 6/6 | 0 | 0 |
| 1265 | baseline | exploration | 18 | 138 | 6/6 | 0 | 0 |
| 1270 | assertive | validation | 6 | 117 | 6/6 | 1 | 10 |
| 1275 | assertive | validation | 6 | 128 | 6/6 | 0 | 0 |
| 1288 | pressure | exploration | 25 | 120 | 5/6 | 7 | 96 |
| 1293 | pressure | exploration | 30 | 141 | 5/6 | 10 | 106 |
| 1298 | pressure | validation | 25 | 123 | 5/6 | 8 | 96 |
| 1319 | pressure | validation | 24 | 94 | 6/6 | 10 | 101 |

## Reproduce and inspect

Start-Bot.cmd runs the saved defensive setting. Start-Training.cmd runs a finite comparison batch and saves reports under bot-starter/training/. It stops automatically after the requested full matches. The completed runs are now stopped.

- Raw match results: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\training\2026-10-24T10-30-17-282Z\results.json
- Raw match results: C:\Users\edan1\Desktop\calhacks13\scrabblebot\bot-starter\training\2026-10-24T10-42-29-786Z\results.json
