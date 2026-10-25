import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const {directory}=JSON.parse(readFileSync('experiments/victor-refinement/latest.json','utf8'));
const load=file=>JSON.parse(readFileSync(join(directory,file),'utf8'));
const r=load('results.json'),m=load('manifest.json'),one=load('iteration-1-selection.json'),two=load('iteration-2-selection.json'),selected=r.selected.id;
const development=load('iteration-1-games.json');
const developmentSummary=id=>{const rows=development.filter(g=>g.config===id);return {games:rows.length,defense:rows.reduce((s,g)=>s+g.diagnostics.everDefended,0),cash:rows.reduce((s,g)=>s+g.own.balance,0)/rows.length};};
const f=(x,n=2)=>x.toFixed(n),pct=x=>`${f(x*100,1)}%`,fieldName={mixed:'Victor + TaylorMason + Wags + 3 models',leaders:'Victor + 5 public-data models'};
const label=id=>id==='original'?'Original Victor':id==='static-taylor'?'Fixed TaylorMason policy':id==='static-wags'?'Fixed Wags policy':id===selected?'Selected Victor':id;
const effect=e=>e.interval95.every(x=>x===0)?`${f(e.mean)} (all paired values equal)`:`${f(e.mean)} [${e.interval95.map(x=>f(x)).join(', ')}]`;
const pp=e=>effect({mean:e.mean*100,interval95:e.interval95.map(x=>x*100)});
const vsOriginal=r.validation.map(v=>v.effects[`${selected}-original`]);
const vsTaylor=r.validation.map(v=>v.effects[`${selected}-static-taylor`]);
const clearUpgrade=vsOriginal.every(e=>e.score.interval95[0]>0&&e.wins.mean>=0),hybridEdge=vsTaylor.every(e=>e.score.interval95[0]>0&&e.wins.mean>=0);
const conclusion=clearUpgrade?(hybridEdge?'A promising VictorMateo refinement emerged: it improves on original Victor and the fixed TaylorMason control in both validation fields. Keep it experimental until public validation.':'There is a promising upgrade over original VictorMateo, but the hybrid has not established an advantage over the fixed TaylorMason policy. Separate the scoring-engine improvement from claims that switching modes is superior.'):'The refinements did not establish a consistent improvement over original VictorMateo in both validation fields. Do not adopt a candidate on the tuning results alone.';
const negativeSensitivities=r.sensitivity.flatMap(s=>s.results.map(v=>({world:s.world,field:v.field,e:v.effects[`${selected}-original`]}))).filter(s=>s.e.wins.mean<0);
const links=file=>join(directory,file).replaceAll('\\','/');
const lines=['# VictorMateo refinement results','',conclusion,'',
`Completed **${r.games.toLocaleString()} local six-player games** in two development iterations, an untouched validation set, and three sensitivity checks. The selected configuration is **${selected}**. No public games were entered and none of the ${r.liveFilesUnchanged} monitored live files changed.`, '',
...negativeSensitivities.map(s=>`The result is not uniform across rival assumptions: in ${s.world}, ${fieldName[s.field]}, the shared-first change was **${pp(s.e.wins)} percentage points**, with score change ${effect(s.e.score)}. Keep the candidate experimental; the main-field improvement does not establish universal superiority.`), '',
'## Candidate and what changed','',
`Frozen candidate settings: \`${JSON.stringify(r.selected)}\`.`, '',
'Original Victor uses the older scoring engine. The modernization candidates use the same newer word planning and productive bidding as current Wags/TaylorMason. The original-phase variant retains Victor’s old funding and position thresholds. Adaptive variants can enter defense after 30 earned points with attainable cash, preserve a smaller reserve, and use different entry/exit thresholds to avoid constant switching. Productive purchases remain available during defense; baseline exploration and its associated pressure extension are reduced on unproductive tiles. They keep scoring in every phase.','',
'The hold-only branch keeps the original policy and protects the ingredients of a valuable completion during the current auction when the committed bid is substantial. It never holds an available seven-letter word. Fixed TaylorMason/Wags controls use the actual current scoring functions throughout, under Victor’s identity, to test whether a hybrid adds value beyond the newer engine itself.','',
'## Final validation','',
'Each row uses 160 new bags, matched between policies within its field. These bags were not used for selection or tuning. All seats and model lineups rotate. Shared first place counts as a win. Public bot names identify approximate models, not their original code or actual server performance.','',
'| Field | Policy | Average score | Shared-first rate | Highest public-model score |',
'|---|---|---:|---:|---:|',
...r.validation.flatMap(v=>Object.entries(v.aggregate).map(([id,a])=>`| ${fieldName[v.field]} | ${label(id)} | ${f(a.score)} | ${pct(a.winRate)} | ${f(a.topPublicRival)} |`)), '',
...r.validation.map(v=>{const old=v.aggregate.original,best=v.aggregate[selected];return `${fieldName[v.field]}: seven-letter-or-longer words per game changed from ${f(old.longWords)} to ${f(best.longWords)}; mean spend changed from ${f(old.spent)} to ${f(best.spent)} coins. These describe scoring output and cost, rather than proving a specific purchase caused the gain.`;}), '',
'Paired changes, with approximate 95% intervals:','',
'| Field | Selected Victor versus | Own score change | Shared-first change, percentage points | Highest public-model score change |',
'|---|---|---:|---:|---:|',
...r.validation.flatMap(v=>['original','static-taylor','static-wags'].map(id=>{const e=v.effects[`${selected}-${id}`];return `| ${fieldName[v.field]} | ${label(id)} | ${effect(e.score)} | ${pp(e.wins)} | ${effect(e.topPublicRival)} |`;})), '',
'A negative rival-score change supports defensive pressure; a positive change means the strongest model scored more. This does not identify a particular denied word or establish causality for an individual purchase.','',
'## Against the actual local Wags and TaylorMason policies','',
'These measurements come from the mixed six-player field; they compare final scores in the same game, not two-player matches. Strictly-beat rates exclude ties.','',
'| Victor policy | Mean score margin versus TaylorMason | Beats TaylorMason | Mean score margin versus Wags | Beats Wags |',
'|---|---:|---:|---:|---:|',
...['original',selected].map(id=>{const a=r.validation.find(v=>v.field==='mixed').aggregate[id];return `| ${label(id)} | ${f(a.against.TaylorMason.scoreMargin)} | ${pct(a.against.TaylorMason.strictlyBeatRate)} | ${f(a.against.Wags.scoreMargin)} | ${pct(a.against.Wags.strictlyBeatRate)} |`;}), '',
'## Did the hybrid actually switch modes?','',
'| Field | Victor policy | Games entering defense | Games entering rebuild | Auction decisions in defense | Mean transitions | Long-word score share | Mean final cash |',
'|---|---|---:|---:|---:|---:|---:|---:|',
...r.validation.flatMap(v=>['original',selected].map(id=>{const a=v.aggregate[id],d=a.diagnostics,total=d.buildBids+d.defendBids+d.rebuildBids;return `| ${fieldName[v.field]} | ${label(id)} | ${d.everDefended}/${a.games} | ${d.everRebuilt}/${a.games} | ${pct(d.defendBids/total)} | ${f(d.transitions/a.games)} | ${pct(a.longScoreShare)} | ${f(a.balance)} |`;})), '',
'## Two development iterations','',
'Development results select a candidate; they are not independent evidence of improvement. Own score averaged equally across both fields selects among refinements, with lowest public-rival score as the tie-breaker. The fixed TaylorMason policy is a benchmark and is not eligible to become the selected hybrid.','',
'| Iteration | Configuration | Mean score across both fields | Shared-first rate | Highest public-model score |',
'|---|---|---:|---:|---:|',
...[one,two].flatMap((s,i)=>s.all.map(a=>`| ${i+1} | ${a.config.id} | ${f(a.score)} | ${pct(a.winRate)} | ${f(a.topPublicRival)} |`)), '',
`Iteration 1 selected ${one.selected.id}; iteration 2 selected ${selected}. The second pass tested only the parent and two predeclared nearby variants on 40 other bags per field. Candidate settings and all simulation inputs were frozen before final validation.`, '',
`In iteration 1, the earlier-switching adaptive variant entered defense in ${developmentSummary('modern-adaptive').defense}/${developmentSummary('modern-adaptive').games} games and retained ${f(developmentSummary('modern-adaptive').cash)} coins on average; the modernized original-phase variant entered in ${developmentSummary('modern-original-phase').defense}/${developmentSummary('modern-original-phase').games} and retained ${f(developmentSummary('modern-original-phase').cash)} coins. More frequent defense did not translate into better development scores. This compares complete configuration packages, including their reserves and pressure settings, rather than isolating phase frequency alone.`, '',
'## Sensitivity checks','',
'Each row uses 32 additional bags per policy and field. Low/high replace unidentified losing bids with the 15%/85% point in their allowed interval. Planning opponents replace the empirical bid/word model with the newer Wags/TaylorMason scoring functions, retaining the public opponent names and statistics. This is a stress test, not a claim that those public bots use our strategy.','',
'| Rival assumption | Field | Selected − original score | Shared-first change, percentage points | Highest public-model score change |',
'|---|---|---:|---:|---:|',
...r.sensitivity.flatMap(s=>s.results.map(v=>{const e=v.effects[`${selected}-original`];return `| ${s.world} | ${fieldName[v.field]} | ${effect(e.score)} | ${pp(e.wins)} | ${effect(e.topPublicRival)} |`;})), '',
'## Public evidence and limits','',
`The anonymous public snapshot was collected at ${m.collectedAt}. All ${r.publicAudit.valid} completed games passed score/balance reconstruction. Leaders were chosen by current win rate with at least 50 current-version games and 20 current-version appearances in the downloaded archive. Stale LetterShark had insufficient recent participation and was excluded by this rule.`, '',
'| Public model | Current wins/games | Archive games | Modal minimum word length | Heuristic cash-out balance |',
'|---|---:|---:|---:|---:|',
...r.leaders.map(b=>`| ${b.name} | ${b.wins}/${b.games} (${pct(b.winRate)}) | ${b.recentGames} | ${b.word.minimumLength} | ${b.word.cashOutBalance} |`), '',
'Public metadata is supplied equally to all policies, including the unchanged controls. Bid samples use public winning bids and upper bounds for losses; weak losing bounds are retained. Per-bot word length and cash-out thresholds come from observed words, with explicit rack-size and endgame fallbacks. Public history does not reveal which unplayed words were available. Initial rival letters and hidden losing bids remain unavailable.','',
`${r.publicAudit.lateWins} winning bids exceeded reconstructed opening cash, consistent with later bids after scoring; replay fractions are capped to available cash. The arena submits opening bids, permits word plays before settlement, and idealizes network timing. It cannot reproduce later bid revisions or latency. The chosen opponent archive is reused across development and validation; only letter bags and replay draws are fresh. Planning and bid-bound sensitivities probe this model dependence but do not replace real matches.`, '',
'There are 2,384 runs, not 2,384 independent samples. Each validation comparison uses 160 paired bags per field. Sensitivity uses 32; development uses 40 per field in each pass. Intervals are approximate, exploratory and unadjusted for multiple comparisons. No final-validation or sensitivity result was used to retune the candidate. Tests verified control equivalence, word holds, earned-point phase entry, rebuilding/reset, affordability/final-tile behavior and public-information enrichment. Every arena game checks word legality plus cash and tile conservation.','',
`Artifacts: [protocol](${resolve('experiments/victor-refinement/PROTOCOL.md').replaceAll('\\','/')}), [candidate implementation](${resolve('experiments/victor-refinement/policy.mjs').replaceAll('\\','/')}), [frozen configuration](${links('selected-candidate.json')}), [complete results](${links('results.json')}), [validation games](${links('validation-games.json')}), [collection manifest](${links('manifest.json')}).`,'',
'From bot-starter, rerun the same local study with `node --import tsx experiments/victor-refinement/run.mjs`. This uses the saved opponent data and repeats the fixed seed schedule. It overwrites that study’s output files; save a copy first if preserving them is needed. No online runner is imported.',''];
const file=resolve('../VICTOR-REFINEMENT-RESULTS.md');writeFileSync(file,lines.join('\n'));console.log(JSON.stringify({file,conclusion,selected:r.selected,validation:r.validation},null,2));
writeFileSync('experiments/victor-refinement/candidate.mjs',`// Frozen offline candidate from ${r.completedAt}. No online entry point.\nimport {makeCandidate} from './policy.mjs';\nexport const configuration=${JSON.stringify(r.selected,null,2)};\nexport const makeVictorMateoCandidate=()=>makeCandidate(configuration);\n`);
