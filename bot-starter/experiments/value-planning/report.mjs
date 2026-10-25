import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),first=load('results.json'),r=load('followup-results.json'),replay=load('replay-results.json'),replay2=load('replay-followup-results.json'),data=load('opponents.json'),verification=load('verification.json');
const f=(x,n=2)=>x.toFixed(n),pct=x=>`${f(x*100,1)}%`,effect=e=>e.interval95.every(x=>x===0)?`${f(e.mean)} (all pairs equal)`:`${f(e.mean)} [${e.interval95.map(x=>f(x)).join(', ')}]`;
const names={'current-taylor':'Unchanged TaylorMason','premium-bids':'Premium acquisition overlay','premium-joint':'Premium overlay + current-tile hold','matched-extra':'Matched extra-spending control','bids-only':'Initial goal-directed bidder','goals-only':'Initial word-policy replacement',joint:'Initial joint replacement'};
const fields={empirical:'Five public-data opponents',planning:'TaylorMason + Wags + three premium-goal planners'};
const selected=r.selected.id,beatsControls=r.validation.every(v=>[`${selected}-current-taylor`,`${selected}-matched-extra`].every(k=>v.effects[k].score.interval95[0]>0&&v.effects[k].margin.interval95[0]>0));
const conclusion=beatsControls?'A promising local candidate emerged: the frozen premium refinement improved score and winning margin over unchanged play and matched extra spending in both validation fields. It remains unvalidated online.':'Keep the current production policy. The new goal-based refinements did not establish a consistent advantage over unchanged TaylorMason and matched extra spending in both validation fields.';
const link=file=>join(directory,file).replaceAll('\\','/');
const parity=replay.summaries.reduce((s,g)=>s+g.unchangedBidMatches,0);
const lines=['# Value-oriented planning: local development results','',conclusion,'',
`Completed **${verification.localGames.toLocaleString()} local games** across the initial study and a separate development-led follow-up. The eight known live games were replayed diagnostically at 544 opening positions; they were not counted as fresh matches. All ${verification.policyFilesUnchanged} monitored production policy/configuration files are unchanged. The online bot remains stopped.`, '',
'## What was implemented','',
'- Own-rack, balance, goal, missing letters, estimated cost/probability, alternative playable words, bids, proposed cash-outs and decision reasons in representative local traces and all eight diagnostic replays.','- Goals ranked by real payout, acquisition cost, estimated remaining opportunities, liquidity and the score sacrificed by reserving ingredients; five-/six-letter premium words are eligible alongside longer words.','- Goal-directed bidding tested independently from changed word timing, then combined.','- Refreshed public-data opponents covering all seven observed winners, plus additional current leaders; a separate field uses current Wags/TaylorMason and independently ranked premium-goal planners.','- Defense disabled/selective/current comparisons and settlement-based ownership metrics, with true synthetic rival bids available only to the evaluator after decisions.','',
'## Initial replacement study','',
'The first development pass used 32 bags per field. It compared each component separately and jointly against the unchanged policy. These are tuning results, not final validation.','',
'| Policy | Mean score across fields | Winning margin | Shared-first rate |',
'|---|---:|---:|---:|',
...first.development.map(x=>`| ${names[x.config.id]??x.config.id} | ${f(x.score)} | ${f(x.margin)} | ${pct(x.wins)} |`),'',
'The initial new bidder retained 78.6 coins per game, versus 12.2 for the control, in development. It underinvested rather than merely choosing better tiles. The word-policy replacement also produced fewer long words. A follow-up was therefore preregistered from these development logs, before consulting the first study’s validation outcomes. The first study continued unchanged.','',
'First-study fresh validation, 128 bags per policy and field:','',
'| Field | Initial bidder score / shared-first | Unchanged score / shared-first | Paired score change |',
'|---|---:|---:|---:|',
...first.validation.map(v=>{const c=v.aggregate['current-taylor'],a=v.aggregate[first.selected.id],e=v.effects[`${first.selected.id}-current-taylor`];return `| ${fields[v.field]} | ${f(a.score)} / ${pct(a.wins)} | ${f(c.score)} / ${pct(c.wins)} | ${effect(e.score)} |`;}),'',
'## Conservative integration follow-up','',
'The follow-up preserves the current acquisition baseline, caps extra own-value bidding at six coins, and keeps existing defense. One variant adds only a current-auction hold for a known gain of at least 18 points when the committed bid covers the estimated market threshold. The spending control permits the same extension using the original value signal. Both use the same budget caps. This tests whether a goal model adds value beyond spending more.','',
`The premium candidate selected on 24 development bags per field was **${names[selected]}**. All four policies then ran on 96 fresh bags per field; no policy or setting was retuned afterward.`, '',
'| Field | Policy | Average score | Shared-first | 7+ words/game | Points per 7+ word | Final cash |',
'|---|---|---:|---:|---:|---:|---:|',
...r.validation.flatMap(v=>Object.entries(v.aggregate).map(([id,a])=>`| ${fields[v.field]} | ${names[id]} | ${f(a.score)} | ${pct(a.wins)} | ${f(a.longWords)} | ${f(a.longWordValue)} | ${f(a.cash)} |`)),'',
'Paired effects with approximate 95% intervals:','',
'| Field | Comparison | Score change | Winning-margin change | Shared-first change, percentage points |',
'|---|---|---:|---:|---:|',
...r.validation.flatMap(v=>[`${selected}-current-taylor`,`${selected}-matched-extra`,'premium-joint-premium-bids'].map(key=>{const e=v.effects[key];return `| ${fields[v.field]} | ${key} | ${effect(e.score)} | ${effect(e.margin)} | ${effect({mean:e.wins.mean*100,interval95:e.wins.interval95.map(x=>x*100)})} |`;})),'',
'A positive change in winning margin means our score improved relative to the highest rival. This remains an approximate local benchmark; a simulated win rate is not a server forecast.','',
`The selected premium overlay changed own score by ${r.validation.map(v=>`${f(v.effects[`${selected}-current-taylor`].score.mean)} points in ${fields[v.field]}`).join(' and ')}. Only the public-model field’s score interval excluded zero; neither field established a win-rate increase. The matched extra-spending control had the largest winning-margin improvement in both fields, so these results do not establish that the new goal model adds value beyond a larger bid allowance.`, '',
`The new current-tile hold activated ${r.validation.reduce((n,v)=>n+v.aggregate['premium-joint'].diagnostics.completionHolds,0)} times in final validation. Its outcomes were identical to the premium-bid variant. This gives no evidence about the benefit of holding when it activates; the trigger needs targeted coverage before further claims.`, '',
'Recommended next development: retain the current word policy and acquisition floor, investigate the small extra-bidding allowance, improve opponent-model calibration against observed live scores, and use the new traces to study premium-word completion. Treat both small score gains and the spending-control margin gain as exploratory until independently replicated. No policy is automatically promoted.','',
'## Defense and actual ownership changes','',
'Initial defense development, 24 bags per field:','',
'| Defense setting | Mean score | Winning margin | Shared-first |',
'|---|---:|---:|---:|',
...first.defenseDevelopment.map(x=>`| ${x.config.defense} | ${f(x.score)} | ${f(x.margin)} | ${pct(x.wins)} |`),'',
'The following counts come from final follow-up games. Raised own-value/premium bids are part of the baseline and are not labelled defensive.','',
'| Field | Policy | Pressure-labelled purchases | Purchases changing ownership | Already won at baseline | Payments on ownership-changing purchases |',
'|---|---|---:|---:|---:|---:|',
...r.validation.flatMap(v=>['current-taylor',selected].map(id=>{const d=v.aggregate[id].defense;return `| ${fields[v.field]} | ${names[id]} | ${d.pressureWins} | ${d.ownershipChanges} | ${d.baselineAlreadyWins} | ${d.ownershipPayments} |`;})),'',
'Ownership is recomputed with the same rival bids and seeded tie-breaks but our defensive increase removed. These are conditional auction effects, not proof of denied words or final points. Payments are full prices for newly acquired tiles, not automatically wasted or incremental defensive costs. These counts omit increases in a rival’s purchase price when our raised bid loses; whole-game score and margin comparisons include those economic effects.','',
'## Eight live-game diagnostic replays','',
`All eight own initial racks were uniquely reconstructed from letter deficits, with five required letters each. All word plays, final scores and cash balances passed replay audits. The unchanged bidder matched ${parity}/${replay.positions} recorded opening bids; historical opponent reputation rows were not logged, so shadow decisions use current public reputation and are not a bit-for-bit recreation of every live input.`, '',
'| Game | Exact own initial rack | Audited positions | Unchanged bid matches |',
'|---|---|---:|---:|',
...replay.summaries.map(g=>`| ${g.match} | ${g.initialRack} | ${g.positions} | ${g.unchangedBidMatches} |`),'',
'The replay evaluates alternative decisions against the observed state at each opening. Hypothetical choices do not propagate to later racks, rival behavior or scores. Archived highest bids are used only after a shadow decision to classify that one auction’s price comparison. No counterfactual match win rates or final scores are reported. The eight games were excluded from public price/opponent fitting and never used as final validation. Both original and follow-up traces are saved.','',
'## Benchmark coverage and limits','',
`The public collection contains 1,000 completed games; excluding the eight diagnostic cases leaves ${data.trainingGames} training games, all passing score/balance reconstruction. Public models retain exact winning bids and censored losing-bid intervals, rather than inventing hidden losing bids.`, '',
'| Opponent model | Archive games | Observed mean score | Premium payout reference |',
'|---|---:|---:|---:|',
...data.leaders.map(b=>`| ${b.name} | ${b.recentGames} | ${f(b.actualMeanScore)} | ${b.word.minimumReward} |`),'',
'Public models sample bid intervals and use explicit word-timing fallbacks. Planning rivals use a separate payout/missing-letter ranking and public payout references; they do not share the candidate’s completion-probability or net-value formula. Their private synthetic racks belong only to those model agents. Neither family reproduces the original bots’ code. Public observed means come from different opponent fields and are descriptive rather than strength-adjusted calibration targets.','',
'Initial bidder sensitivities, 24 bags per policy and field:','',
'| Hidden-bid assumption | Field | Score change vs unchanged | Winning-margin change |',
'|---|---|---:|---:|',
...first.sensitivity.flatMap(s=>s.results.map(v=>{const e=v.effects[`${first.selected.id}-current-taylor`];return `| ${s.world} | ${fields[v.field]} | ${effect(e.score)} | ${effect(e.margin)} |`;})),'',
'The candidate’s availability and cost calculations are bounded heuristics, not calibrated probabilities or guaranteed prices. Goal search keeps payout-oriented and common-letter beams and does not find every possible plan. The arena idealizes auction/network timing. All variants see only their own rack and public rival state; no current rival bids or future tile order reach the policy.','',
`The ${verification.localGames.toLocaleString()} runs include paired variants, not that many independent samples. Initial validation uses 128 bags per field; follow-up validation uses 96. Development uses 32/24 bags, and first-pass sensitivity uses 24. Confidence intervals are exploratory, unadjusted for multiple comparisons. The same frozen public archive is reused; fresh bags and independent planner rivals test some generalization but do not replace authorized live evaluation.`, '',
`Verification: 12 focused tests and the TypeScript build passed. Tracing preserves outcomes, the unchanged control and instrumented arena reproduce the originals, every game checks word/cash/tile legality, all saved source hashes remain unchanged, and the online lock is absent. There are ${verification.traceFiles} representative trace files plus the two diagnostic trace sets.`, '',
`Artifacts: [protocol](${resolve('experiments/value-planning/PROTOCOL.md').replaceAll('\\','/')}), [follow-up design](${resolve('experiments/value-planning/FOLLOW-UP.md').replaceAll('\\','/')}), [first results](${link('results.json')}), [follow-up results](${link('followup-results.json')}), [diagnostic summary](${link('replay-followup-results.json')}), [trace directory](${link('traces')}), [verification](${link('verification.json')}).`, '',
'No production policy, account, launcher, or online test was changed or started by this study.',''];
const file=resolve('../VALUE-PLANNING-RESULTS.md');writeFileSync(file,lines.join('\n'));
const config=r.selected;writeFileSync('experiments/value-planning/research-candidate.mjs',`// Experimental only. Consult VALUE-PLANNING-RESULTS.md before adoption.\nimport {makeOverlayAgent} from '../../src/value-overlay.ts';\nexport const configuration=${JSON.stringify(config,null,2)};\nexport const frozenMarket=${JSON.stringify(data.market)};\nexport const makeResearchCandidate=(trace)=>makeOverlayAgent(configuration,frozenMarket,trace);\n`);
console.log(JSON.stringify({file,conclusion,games:verification.localGames,selected:r.selected},null,2));
