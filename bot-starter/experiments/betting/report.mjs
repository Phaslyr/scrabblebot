import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const {directory}=JSON.parse(readFileSync("experiments/betting/latest.json","utf8"));
const prediction=JSON.parse(readFileSync(join(directory,"prediction-results.json"),"utf8"));
const games=JSON.parse(readFileSync(join(directory,"simulation-results.json"),"utf8"));
const point=existsSync(join(directory,"point-results.json"))?JSON.parse(readFileSync(join(directory,"point-results.json"),"utf8")):null;
const manifest=JSON.parse(readFileSync(join(directory,"manifest.json"),"utf8"));
for(const source of manifest.liveHashes)if(createHash("sha256").update(readFileSync(source.file)).digest("hex")!==source.sha256)throw new Error(`Unexpected live policy change: ${source.file}`);
for(const source of prediction.sources)if(createHash("sha256").update(readFileSync(source.file)).digest("hex")!==source.sha256)throw new Error(`Prediction source changed: ${source.file}`);
for(const source of games.sources)if(createHash("sha256").update(readFileSync(source.file)).digest("hex")!==source.sha256)throw new Error(`Simulation source changed: ${source.file}`);
if(point)for(const source of point.sources)if(createHash("sha256").update(readFileSync(source.file)).digest("hex")!==source.sha256)throw new Error(`Follow-up source changed: ${source.file}`);
const f=n=>n.toFixed(2),pct=n=>(100*n).toFixed(1)+"%",ci=x=>x.interval95?(x.interval95[0]===x.interval95[1]?`${f(x.mean)} (all sampled pairs equal)`:`${f(x.mean)} [${f(x.interval95[0])}, ${f(x.interval95[1])}]`):`${f(x.mean)} (insufficient bags)`;
const labels={pooled:"Pooled letter/balance bidder", "identity-median":"Per-bot letter/balance bidder","identity-features":"Per-bot selected feature/median model","market-letter":"Simple letter/phase/liquidity market table"};
const primary=games.results.filter(r=>r.world==="empirical-mid");
const pointPrimary=point?.results.filter(r=>r.world==="empirical-mid")??[];
const totalWins=prediction.botMetrics.reduce((s,b)=>s+b.exactWins,0);
const weighted=kind=>prediction.botMetrics.reduce((s,b)=>s+b.exactWins*b.models[kind].winningBidMAE,0)/totalWins;
const baseline=prediction.fieldMetrics[prediction.simpleKind],style=prediction.fieldMetrics["identity-features"];
const strongGameplay=primary.some(r=>["style-control","style-simple","style-blind"].every(k=>r.effects[k].score.interval95?.[0]>0)&&r.effects["style-control"].wins.mean>=0);
const summary={predictiveGate:prediction.predictiveGate,strongGameplay,liveFilesUnchanged:manifest.liveHashes.length,
  totalLocalGames:games.games+(point?.games??0),
  publicMaximumRivalMAE:{simple:baseline.intervalMAE,style:style.intervalMAE},publicWinningBidMAE:{pooled:weighted("pooled"),style:weighted("identity-features")},
  primary:primary.map(r=>({bot:r.style,control:r.aggregate.control,simple:r.aggregate.simple,style:r.aggregate.style,blind:r.aggregate.blind,effects:r.effects})),
  pointFollowUp:pointPrimary.map(r=>({bot:r.style,control:r.aggregate.control,simple:r.aggregate.simple,style:r.aggregate.style,blind:r.aggregate.blind,effects:r.effects})),
  conclusion:prediction.predictiveGate&&strongGameplay?"Promising offline evidence; public validation still needed before adoption.":"Do not integrate this player-specific predictor yet. Predictive and gameplay evidence do not meet the predeclared adoption checks."};
writeFileSync(join(directory,"summary.json"),JSON.stringify(summary,null,2));
const rows=["# Is bid-style prediction worth using?","",summary.conclusion,"",
`The experiment audited ${prediction.audit.valid} public completed matches, held out newer whole games, and ran ${summary.totalLocalGames.toLocaleString()} offline six-player response games (${games.games.toLocaleString()} guarded; ${(point?.games??0).toLocaleString()} exploratory follow-up). All ${manifest.liveHashes.length} hashed live policy/configuration files are unchanged. No bot credentials, registrations, or public match entry were used.`,"",
"## What can be predicted","",
`Across ${totalWins.toLocaleString()} observed winning bids by the five leaders in the final test partition, player-specific models reduced weighted error from ${f(weighted("pooled"))} to ${f(weighted("identity-features"))} coins. This is a selected subset of bids; it does not establish accuracy on hidden losing bids.`,"",
"| Bot | Train / calibration / test games | Exact test wins | Generic winning-bid error | Player-specific error | Conflicts with informative losing bounds |",
"|---|---:|---:|---:|---:|---:|",
...prediction.botMetrics.map(b=>`| ${b.name} | ${b.partitions.train}/${b.partitions.calibration}/${b.partitions.test} | ${b.exactWins} | ${f(b.models.pooled.winningBidMAE)} | ${f(b.models["identity-features"].winningBidMAE)} | ${pct(b.models["identity-features"].losingBoundConflict)} |`),"",
"The actionable quantity in a second-price auction is the highest rival bid: it determines our payment if we beat the field, subject to the one-coin reserve. That quantity can often be reconstructed from public archives without knowing each losing bid.","",
"| Forecast | Highest-rival-bid error, coins | Central 80% interval coverage | Average interval width, coins |",
"|---|---:|---:|---:|",
...Object.entries(prediction.fieldMetrics).map(([key,m])=>`| ${labels[key]} | ${f(m.intervalMAE)} | ${pct(m.coverage)} | ${f(m.meanBandWidth)} |`),"",
`The simple baseline was selected on calibration games: ${labels[prediction.simpleKind]}. Player-specific minus simple error is **${ci(prediction.pairedDifference)} coins**, paired by ${prediction.pairedDifference.independentGames} distinct test games. Positive means worse player-specific forecasts. The intended predictive gate was at least 10% lower error and at least 75% coverage; passed: **${prediction.predictiveGate}**.`,"",
"## Did responding improve games?","",
"The main arena independently samples held-out public bid intervals. Hidden losing bids use their midpoint; low/high assumptions and cached older models are reported separately. Word choice remains a heuristic, not a recovered private strategy.","",
"The two forecast responses use identical guards. They may raise a valuable bid by at most four coins within a cash/value ceiling, or retain a valuable completion when the forecast supports a low-cost win. The blind control allows those same actions without a forecast. It tests whether any gain comes from extra aggression rather than prediction. Unchanged controls were checked against the actual current Wags/TaylorMason factories.","",
"| Bot | Response | Main games | Average score | Shared-first rate | Bid raises | Extra holds |",
"|---|---|---:|---:|---:|---:|---:|",
...primary.flatMap(r=>Object.entries(r.aggregate).map(([mode,a])=>`| ${r.style==="wags"?"Wags":"TaylorMason"} | ${{control:"Unchanged v3",simple:"Simple price forecast",style:"Player-specific forecast",blind:"Blind extra aggression"}[mode]} | ${a.games} | ${f(a.score)} | ${pct(a.winRate)} | ${a.bidRaises} | ${a.holdExtensions} |`)),"",
"The player-specific guarded response made zero additional bids or holds across all four arenas, so it produced identical outcomes. This is an actionability failure under the chosen guardrails. It does not show that every prediction-based policy has zero effect. Equal sampled pairs are reported without a misleading zero-width confidence claim.","",
"Paired score changes and approximate 95% intervals in the main arena:","",
...primary.flatMap(r=>[`${r.style==="wags"?"Wags":"TaylorMason"}:`,
  ...["style-control","style-simple","style-blind"].map(k=>`- ${k}: ${ci(r.effects[k].score)} points; shared-first change ${pct(r.effects[k].wins.mean)}.`),""]),
"## Sensitivity checks","",
"| Arena | Bot | Bags per response | Player-specific minus unchanged score | Player-specific minus simple score | Player-specific minus blind score |",
"|---|---|---:|---:|---:|---:|",
...games.results.map(r=>`| ${r.world} | ${r.style} | ${r.aggregate.control.games} | ${ci(r.effects["style-control"].score)} | ${ci(r.effects["style-simple"].score)} | ${ci(r.effects["style-blind"].score)} |`),"",
"Low/mid/high fill in unidentified losing bids at 15%, 50%, and 85% of their admissible interval. These are assumptions, not observed bids or guaranteed bounds on performance. Cached-model results are only a sensitivity check: related model families can make a predictor look artificially strong.","",
"## Method and limits","",
`- Global chronological split: ${prediction.split.trainGames} fitting games, ${prediction.split.calibrationGames} calibration games, ${prediction.split.testGames} final-test games. No game appears in more than one partition. Bot versions are respected; primary market evaluation requires six known real players.`,
`- Primary field metrics use ${style.testAuctions.toLocaleString()} target-auction observations in ${style.testGames} distinct test games. Multiple targets can share an auction; these are not all distinct auctions. Errors are averaged by game before comparison.`,
"- Features use only public information available at auction opening. Family selection and price intervals use calibration games. Current leaderboard outcomes select which leaders to study but are not supplied as predictive features.",
"- Winning bids are exact when archived. Losing bids are upper bounds at the Vickrey runner-up payment; they are never labeled observed zero. A reserve of one identifies maximum rival bids only within [0,1], scored with interval distance. Winning bids above opening cash remain in test errors.",
`- All ${prediction.audit.valid} games passed exact score/balance and nonnegative rack-size checks. ${prediction.audit.lateWinningBids} winning observations exceeded opening cash across the audited data, consistent with within-auction word income or revisions.`,
"- The public-data replay is independent of the prediction formula, but its draws come from the same held-out archive used for the historical forecast test. It is a counterfactual approximation, not a second independent real-world validation. Opponents do not revise bids after word plays inside an auction, and network timing is idealized equally.",
"- Every simulated game checks cash/tile conservation and dictionary legality. Matched comparisons keep bags, seats, tie randomness, and empirical draws fixed. Intervals cover bag variation and do not cover model mismatch. Many comparisons are descriptive; no claim of a globally optimal response is made.",
"- The tested policy makes modest guarded changes around v3. These results do not rule out stronger probabilistic or direct market-price models. Winning-bid style accuracy alone is insufficient for deployment.","",
"A useful next research direction is to model the collective price to beat directly, using the simple market table as the baseline. Taking the maximum of individual point predictions does not recover a well-calibrated distribution of the maximum competing bid.","",
`Raw data, model artifacts, splits, audits, all game records, and source hashes: ${directory}.`,"",
"## Reproduce without live play","",
"From bot-starter: run the collector once for a fresh public snapshot, followed by the offline steps:","",
"```powershell","node experiments/betting/collect.mjs","node --import tsx experiments/betting/prepare.mjs","node --import tsx --test experiments/betting/response.test.mjs experiments/betting/response-point.test.mjs","node --import tsx experiments/betting/simulate.mjs","node --import tsx experiments/betting/simulate-point.mjs","node experiments/betting/report.mjs","```","",
"The collector is anonymous read-only network access; all subsequent steps operate on saved files. No step starts a live bot or edits its settings.",""];
if(point){const extra=["## Exploratory response using the middle estimate","",
  "After the guarded response made no player-specific interventions, a follow-up used the median price instead of the upper interval endpoint. All cash/value ceilings and the four-coin limit remained. It used new letter bags and frozen prediction models. This is exploratory and does not replace the original protocol.","",
  "| Bot | Response | Fresh main bags | Average score | Shared-first rate | Bid raises | Extra holds |","|---|---|---:|---:|---:|---:|---:|",
  ...pointPrimary.flatMap(r=>Object.entries(r.aggregate).map(([mode,a])=>`| ${r.style==="wags"?"Wags":"TaylorMason"} | ${{control:"Unchanged v3",simple:"Simple middle estimate",style:"Player-specific middle estimate",blind:"Blind extra aggression"}[mode]} | ${a.games} | ${f(a.score)} | ${pct(a.winRate)} | ${a.bidRaises} | ${a.holdExtensions} |`)),"",
  ...pointPrimary.flatMap(r=>[`${r.style==="wags"?"Wags":"TaylorMason"} follow-up paired score changes:`,
    ...["style-control","style-simple","style-blind"].map(k=>`- ${k}: ${ci(r.effects[k].score)} points.`),""]),
  "| Follow-up arena | Bot | Bags per policy | Specific minus unchanged score | Specific minus simple score | Specific minus blind score |","|---|---|---:|---:|---:|---:|",
  ...point.results.map(r=>`| ${r.world} | ${r.style} | ${r.aggregate.control.games} | ${ci(r.effects["style-control"].score)} | ${ci(r.effects["style-simple"].score)} | ${ci(r.effects["style-blind"].score)} |`),""];
  rows.splice(rows.indexOf("## Method and limits"),0,...extra);
}
writeFileSync(resolve("../BETTING-PREDICTION-RESULTS.md"),rows.join("\n"));
console.log(JSON.stringify(summary,null,2));
