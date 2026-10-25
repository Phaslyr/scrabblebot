import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {MEDIAN_VARIANTS,MEDIAN_CENTER} from '../../src/median-policy.ts';
import {mean,compare} from './stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/median-study/latest.json','utf8'));
if(existsSync(join(directory,'inputs.json')))throw new Error('A run already owns this snapshot; preserve it rather than overwriting');
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['src/median-policy.ts','src/taylor.ts','src/taylor-policy.ts','src/taylor-settings.ts','src/taylor-priors.ts','src/value-planning.ts','experiments/median-study/arena.mjs','experiments/median-study/arena-core.ts','experiments/median-study/price-arena.mjs','experiments/median-study/worker.mjs','experiments/median-study/run.mjs','experiments/median-study/stats.mjs','experiments/median-study/PROTOCOL.md',join(directory,'opponents.json'),join(directory,'price-paths.json'),'../spacetimedb/wordlist.txt','../spacetimedb/src/letters.ts'];
const sourceHashes=files.map(file=>({file,sha256:hash(file)}));
writeFileSync(join(directory,'inputs.json'),JSON.stringify({frozenAt:new Date().toISOString(),variants:MEDIAN_VARIANTS,workers:4,sourceHashes,liveHashes:manifest.liveHashes,node:process.version},null,2));
const workers=[],start=performance.now();let completed=0;
function check(){if(existsSync('.bot-TaylorMason.lock'))throw new Error('An online runner appeared; local study must remain isolated');for(const s of [...sourceHashes,...manifest.liveHashes])if(hash(s.file)!==s.sha256)throw new Error(`Changed study source ${s.file}`);}
const fingerprint=c=>JSON.stringify(Object.fromEntries(Object.entries(c).filter(([key])=>key!=='id').map(([key,v])=>[key,typeof v==='number'?Math.round(v*1e6)/1e6:v])));
function normalize(c){return Object.fromEntries(Object.entries(c).map(([k,v])=>[k,typeof v==='number'?Math.round(v*1e6)/1e6:v]));}
function dedup(configs){const seen=new Map(),refs={},unique=[];for(const c of configs){const key=fingerprint(c);if(seen.has(key)){refs[c.id]=seen.get(key);continue;}seen.set(key,c.id);refs[c.id]=c.id;unique.push(c);}return {configs:unique,refs};}
function aggregate(rows){return {games:rows.length,score:mean(rows.map(g=>g.own.score)),wins:rows[0].field==='price-taking'?null:mean(rows.map(g=>Number(g.own.sharedWin))),margin:rows[0].field==='price-taking'?null:mean(rows.map(g=>g.own.score-g.own.topRival)),topRival:rows[0].field==='price-taking'?null:mean(rows.map(g=>g.own.topRival)),cash:mean(rows.map(g=>g.own.balance)),purchases:mean(rows.map(g=>g.own.purchases)),spent:mean(rows.map(g=>g.own.spent)),premiumPurchases:mean(rows.map(g=>g.own.premiumPurchases)),longWords:mean(rows.map(g=>g.own.longWords)),longWordValue:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.longWords,0)),diagnostics:Object.fromEntries(Object.keys(rows[0].diagnostics).map(k=>[k,rows.reduce((s,g)=>s+g.diagnostics[k],0)]))};}
function summarize(rows){return [...new Set(rows.map(g=>g.field))].map(field=>{const rs=rows.filter(g=>g.field===field);return {field,aggregate:Object.fromEntries([...new Set(rs.map(g=>g.config))].map(id=>[id,aggregate(rs.filter(g=>g.config===id))]))};});}
function rank(summary,configs){return configs.map(config=>({config,margin:mean(summary.map(f=>f.aggregate[config.id].margin)),score:mean(summary.map(f=>f.aggregate[config.id].score))})).sort((a,b)=>b.margin-a.margin||b.score-a.score);}
async function stage(name,bags,base,configs,kind='full',dropRate=0){check();const tasks=[];for(const [fi,field]of (kind==='price'?['price-taking']:['empirical','planning']).entries())for(let n=0;n<bags;n++)tasks.push({id:tasks.length,stage:name,field,seed:base+fi*10000+n,n,configs,world:'mid',dropRate});
 let next=0,done=0;const rows=[];return new Promise((resolve,reject)=>{const fail=e=>{for(const w of workers)w.terminate();reject(e);},send=w=>{if(next<tasks.length)w.postMessage(tasks[next++]);};
  for(const w of workers){w.removeAllListeners('message');w.removeAllListeners('error');w.on('error',fail);w.on('message',m=>{if(m.error)return fail(new Error(m.error));if(m.ready)return;rows.push(...m.records);completed+=m.records.length;done++;
   if(done%8===0||done===tasks.length){const progress={stage:name,tasks:done,totalTasks:tasks.length,games:completed,seconds:(performance.now()-start)/1000};writeFileSync(join(directory,'progress.json'),JSON.stringify(progress));console.log(JSON.stringify(progress));}
   if(done===tasks.length){rows.sort((a,b)=>a.field.localeCompare(b.field)||a.seed-b.seed||a.config.localeCompare(b.config));writeFileSync(join(directory,`${name}-games.json`),JSON.stringify(rows));resolve(rows);}else send(w);
  });send(w);}
 });
}
function neighbor(parent,id,key,delta){return normalize({...parent,id,[key]:parent[key]+delta});}
try{
 check();for(let i=0;i<4;i++){const w=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:{directory},execArgv:['--import','tsx'],resourceLimits:{maxOldGenerationSizeMb:512}});await new Promise((resolve,reject)=>{w.once('error',reject);w.once('message',m=>m.ready?resolve():reject(new Error('Worker startup failed')));});workers.push(w);}
 const development=summarize(await stage('development',32,39000000,MEDIAN_VARIANTS)),ranking=rank(development,MEDIAN_VARIANTS.filter(c=>c.id!=='current-v4')),parent=ranking[0].config;
 writeFileSync(join(directory,'development-selection.json'),JSON.stringify({selected:parent,ranking,development,frozenAt:new Date().toISOString()},null,2));console.log(`DEVELOPMENT WINNER: ${JSON.stringify(parent)}`);
 const firstKey=parent.bids?'bidScale':'payoutOffset',firstDelta=parent.bids?.05:1,secondKey=parent.words?'cashOffset':'valueScale',secondDelta=parent.words?1:.05;
 const refinement=dedup([{...parent,id:'refine-parent'},neighbor(parent,'refine-first-low',firstKey,-firstDelta),neighbor(parent,'refine-first-high',firstKey,firstDelta),neighbor(parent,'refine-second-low',secondKey,-secondDelta),neighbor(parent,'refine-second-high',secondKey,secondDelta)]).configs;
 const refinementSummary=summarize(await stage('refinement',32,40000000,refinement)),refinementRanking=rank(refinementSummary,refinement),selected=refinementRanking[0].config;
 const key=selected.bids?'bidScale':'payoutOffset',delta=selected.bids?.05:1;
 const final=dedup([MEDIAN_VARIANTS[0],MEDIAN_CENTER,{...selected,id:'selected'},neighbor(selected,'selected-low',key,-delta),neighbor(selected,'selected-high',key,delta)]);
 const reference={current:final.refs['current-v4'],center:final.refs['median-center'],selected:final.refs.selected,lower:final.refs['selected-low'],upper:final.refs['selected-high']};
 const pairs=[...new Map([[reference.selected,reference.current],[reference.center,reference.current],[reference.selected,reference.center],[reference.lower,reference.selected],[reference.upper,reference.selected]].filter(([a,b])=>a!==b).map(p=>[p.join('|'),p])).values()];
 const selection={frozenAt:new Date().toISOString(),selected,reference,configs:final.configs,pairs,refinement:refinementSummary,refinementRanking,sourceHashes};writeFileSync(join(directory,'selected.json'),JSON.stringify(selection,null,2));console.log(`FROZEN FINAL: ${JSON.stringify({selected,reference,configs:final.configs.length})}`);
 const validationRows=await stage('validation',384,41000000,final.configs),validation=summarize(validationRows),effects=compare(validationRows,pairs);
 const priceRows=await stage('price-validation',256,43000000,final.configs,'price'),priceValidation=summarize(priceRows),pricePairs=pairs.filter(([a,b])=>[reference.current,reference.center,reference.selected].includes(a)&&[reference.current,reference.center,reference.selected].includes(b)),priceEffects=compare(priceRows,pricePairs,['score']);
 const stressConfigs=final.configs.filter(c=>[reference.current,reference.selected].includes(c.id));
 const stressRows=await stage('transport-stress',96,42000000,stressConfigs,'full',.15),stress=summarize(stressRows),stressEffects=compare(stressRows,[[reference.selected,reference.current]]);
 check();const expected=1088+1024*final.configs.length+192*stressConfigs.length;if(completed!==expected)throw new Error(`Count mismatch ${completed} / ${expected}`);
 const results={completedAt:new Date().toISOString(),games:completed,seconds:(performance.now()-start)/1000,development,ranking,refinement:refinementSummary,refinementRanking,selection,validation,effects,priceValidation,priceEffects,stress,stressEffects,sourceHashes,liveHashes:manifest.liveHashes,onlineBotStopped:true};
 writeFileSync(join(directory,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({games:completed,seconds:results.seconds,selected,reference}));
}finally{await Promise.all(workers.map(w=>w.terminate()));}
