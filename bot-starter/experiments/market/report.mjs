import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const {directory}=JSON.parse(readFileSync('experiments/market/latest.json','utf8'));
const result=JSON.parse(readFileSync(join(directory,'results.json'),'utf8'));
const prediction=JSON.parse(readFileSync(join(directory,'prediction-results.json'),'utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const names={wags:'Wags',taylor:'TaylorMason',victor:'VictorMateo'},modes={control:'Unchanged',simple:'Simple market table',style:'Player-specific forecast',direct:'Direct market learner',blind:'Extra aggression alone'};
const f=(x,n=2)=>x.toFixed(n),pct=x=>`${f(x*100,1)}%`,effect=(e,n=2)=>e.interval95.every(x=>x===0)?`${f(e.mean,n)} (all sampled pairs equal)`:`${f(e.mean,n)} [${e.interval95.map(x=>f(x,n)).join(', ')}]`;
const main=result.results.filter(r=>r.world==='empirical-mid');
const supported=main.filter(r=>['direct-control','direct-simple','direct-blind'].every(k=>r.effects[k].score.interval95[0]>0));
const conclusion=supported.length?`The direct forecast is a candidate for further testing in ${supported.map(r=>names[r.style]).join(', ')}; the other bots do not show a clear score advantage over all controls.`:'Keep the live policies unchanged. This experiment does not establish that the direct forecast improves score over unchanged play, the simple table, and extra aggression alone for any of the three bots.';
const lines=[
'# All-three bid-prediction experiment', '',conclusion,'',
`Completed ${result.games.toLocaleString()} offline six-player games. Fresh prediction validation used ${prediction.freshMatches} newer completed public matches (${manifest.minimum}–${manifest.maximum}); all passed the final score/balance audit. No public match was entered. All ${result.liveFilesUnchanged} hashed live policy/configuration files remained unchanged.`, '',
'## What the results suggest','',
'Wags and TaylorMason show no clear score improvement from the new predictor. VictorMateo improves against the unchanged control, but the simple table produces identical own-score results on every paired replacement game in all four arenas. Extra aggression alone scores higher than the learned forecast in the main VictorMateo comparison. These results do not support paying for the more complex prediction model.','',
'VictorMateo’s main direct response makes only two extra bids and 21 extra word holds. That makes word timing a promising explanation for its gain, although a hold-only comparison would be needed to isolate the cause. VictorMateo also enters defense in just 9 of 120 main games; its current build/defend transition deserves attention before treating this hybrid as an improvement over the newer Wags/TaylorMason policies. Those are follow-up hypotheses, not changes made here.','',
'## Prediction on newer public games','',
`There were ${prediction.observations.toLocaleString()} auction observations in ${prediction.marketGames} games. One target seat was selected per auction using a rotation independent of bids and outcomes. The target is the highest rival bid, rather than each rival’s hidden bid. Error is distance to the observed price interval; coverage means the forecast interval intersects the observed target interval.`, '',
'| Forecast | Mean price error, coins | Central 80% band coverage | Mean band width |',
'|---|---:|---:|---:|',
...['simple','style','direct'].map(k=>`| ${modes[k]} | ${f(prediction.metrics[k].error.mean)} | ${pct(prediction.metrics[k].coverage)} | ${f(prediction.metrics[k].width)} |`),'',
`Direct minus simple price error: **${effect(prediction.differences['direct-simple'])} coins**, a ${pct((prediction.metrics.simple.error.mean-prediction.metrics.direct.error.mean)/prediction.metrics.simple.error.mean)} reduction. The gain is small even though it is consistent across these game-level comparisons.`, '',
`The simple table and new learner used ${prediction.split.trainRows.toLocaleString()} observations from old matches through ${prediction.split.trainMaximum}. Selection and calibration used ${prediction.split.calRows.toLocaleString()} observations through ${prediction.split.calibrationMaximum}. Those old games were previously studied and are not a fresh final test. Context-only and identity-augmented learners were compared at 0/10/20/40/80 stumps; calibration selected **${prediction.selected.name}, ${prediction.selected.trees} stumps** before the fresh holdout was loaded. Adding player identities did not improve selection error. The previous player-specific model’s weights stayed frozen, with its market-level output recalibrated on the same calibration partition.`, '',
'## Main gameplay comparison','',
'Each row uses 120 new letter bags, matched across policies. Each target faces approximate rivals built from newer public bid records for Nijello, Chinese Dante, Metheny, Doppio, and Lambi Lambiii. Shared-first counts tied top scores as wins. These are simulated rates, not public-server win rates.','',
'| Bot | Response | Average score | Shared-first rate | Bid raises | Extra holds |',
'|---|---|---:|---:|---:|---:|',
...main.flatMap(r=>Object.entries(r.aggregate).map(([mode,a])=>`| ${names[r.style]} | ${modes[mode]} | ${f(a.score)} | ${pct(a.winRate)} | ${a.diagnostics.bidRaises} | ${a.diagnostics.holdExtensions} |`)),'',
'Paired score differences with approximate 95% intervals, using 120 bags per bot:','',
'| Bot | Direct − unchanged | Direct − simple | Direct − extra aggression |',
'|---|---:|---:|---:|',
...main.map(r=>`| ${names[r.style]} | ${effect(r.effects['direct-control'].score)} | ${effect(r.effects['direct-simple'].score)} | ${effect(r.effects['direct-blind'].score)} |`),'',
'Changes in shared-first rate and the highest rival’s score (direct minus unchanged):','',
'| Bot | Shared-first change, percentage points | Highest rival score change |',
'|---|---:|---:|',
...main.map(r=>{const e=r.effects['direct-control'];return `| ${names[r.style]} | ${effect({mean:e.wins.mean*100,interval95:e.wins.interval95.map(x=>x*100)},1)} | ${effect(e.topRival)} |`;}),'',
'## All three in the same game','',
'All three bots share the field with three empirical rivals, with no private information exchanged. These are separate games from the replacement comparison: 60 new bags × three seat rotations × two policies = 360 games. For uncertainty, average the three rotations within each bag before comparing the two policies. All three policies change together here, so a gain is a field-level effect rather than an isolated bot effect.','',
'| Bot | Unchanged score / shared-first | Direct score / shared-first | Paired score change, 60 bags |',
'|---|---:|---:|---:|',
...result.mixed.map(r=>`| ${names[r.style]} | ${f(r.aggregate.control.score)} / ${pct(r.aggregate.control.winRate)} | ${f(r.aggregate.direct.score)} / ${pct(r.aggregate.direct.winRate)} | ${effect(r.effects.score)} |`),'',
'## Sensitivity to the rival model','',
'Each sensitivity uses 24 new bags per bot and response. Low/mid/high fill hidden losing bids at 15%/50%/85% of their allowed interval. They are assumptions, not actual recovered bids or bounds on performance. All losing-bid intervals are retained, including weak bounds; this is stricter than the earlier experiment’s replay filtering. Cached older public-opponent models are a separate sensitivity and can favor related prediction formulas.','',
'| Arena | Bot | Direct − unchanged score | Direct − simple score | Direct − extra aggression score |',
'|---|---|---:|---:|---:|',
...result.results.filter(r=>r.world!=='empirical-mid').map(r=>`| ${r.world} | ${names[r.style]} | ${effect(r.effects['direct-control'].score)} | ${effect(r.effects['direct-simple'].score)} | ${effect(r.effects['direct-blind'].score)} |`),'',
'## VictorMateo and response limits','',
'VictorMateo uses its current stateful build/defend/rebuild controller, rather than substituting the newer Wags/TaylorMason strategy. The controller resets for every game. The response retains its phase-dependent cash reserve, with a small budget extension for productive tiles. Response endgame ceilings follow the current policies; this differs from the previous follow-up wrapper’s fixed normal fraction and is shared by all experimental responses here. Exact control equivalence, mode/reset behavior, public feature isolation, acquisition guards, and word-holding guards passed five targeted tests.','',
'| VictorMateo main response | Games entering defense | Games entering rebuild | Build / defend / rebuild auction decisions |',
'|---|---:|---:|---:|',
...Object.entries(main.find(r=>r.style==='victor').aggregate).map(([k,a])=>{const d=a.diagnostics;return `| ${modes[k]} | ${d.everDefended}/${a.games} | ${d.everRebuilt}/${a.games} | ${d.buildBids} / ${d.defendBids} / ${d.rebuildBids} |`;}),'',
'Forecast responses may raise an already productive bid by at most four coins, within cash and value ceilings, or extend a short-word hold when buying the next letter could complete a more valuable word. They never withhold an available seven-letter word. The aggression control allows the same actions without a forecast. A prediction result alone does not justify removing these limits.','',
'## Limits and reproducibility','',
`Initial rival letters and losing bids remain hidden. Rival bidding is sampled from public interval records; word selection is a common heuristic, not the original bots’ code. ${prediction.freshAudit.lateWins} observed winning bids exceeded reconstructed opening cash, consistent with bots earning or bidding later during an auction; replay fractions are capped at the available budget. The local arena idealizes auction timing and cannot reproduce network behavior or later bid revisions.`, '',
'The 3,240 runs include matched variants, not 3,240 independent observations. Main uncertainty uses 120 independent letter bags per bot, sensitivity uses 24, and mixed-game uncertainty uses 60. Public forecast uncertainty is grouped by game; changing bot versions and correlations between nearby games can make those intervals optimistic. Intervals are exploratory and unadjusted for multiple comparisons. All-equal sampled pairs are described as such rather than evidence of zero population uncertainty. No forecast or response setting was retuned after fresh holdout or gameplay outcomes.','',
`Artifacts: [protocol](${resolve('experiments/market/PROTOCOL.md').replaceAll('\\','/')}), [response details](${resolve('experiments/market/IMPLEMENTATION-NOTES.md').replaceAll('\\','/')}), [prediction results](${join(directory,'prediction-results.json').replaceAll('\\','/')}), [gameplay results](${join(directory,'results.json').replaceAll('\\','/')}), [all games](${join(directory,'games.json').replaceAll('\\','/')}), [read-only collection manifest](${join(directory,'manifest.json').replaceAll('\\','/')}). Source/model hashes are saved with the results.`, '',
'To rerun the frozen local gameplay experiment from bot-starter: `node --import tsx experiments/market/simulate.mjs`. Recollecting/retraining is a separate action and changes the validation dataset.',''];
const file=resolve('../ALL-THREE-EXPERIMENT-RESULTS.md');writeFileSync(file,lines.join('\n'));
console.log(JSON.stringify({file,conclusion,main:main.map(r=>({bot:names[r.style],control:r.aggregate.control,direct:r.aggregate.direct,effect:r.effects['direct-control']})),mixed:result.mixed},null,2));
