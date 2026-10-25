import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {OVERLAY_VARIANTS} from '../../src/value-overlay.ts';
import {mean,interval,group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['src/value-overlay.ts','src/value-planning.ts','src/value-agent.ts','experiments/value-planning/arena-v2.mjs','experiments/value-planning/arena-core.ts','experiments/value-planning/worker-v2.mjs','experiments/value-planning/run-v2.mjs','experiments/value-planning/FOLLOW-UP.md',join(directory,'opponents.json'),'../spacetimedb/wordlist.txt'];
const sourceHashes=files.map(file=>({file,sha256:hash(file)}));writeFileSync(join(directory,'followup-inputs.json'),JSON.stringify({frozenAt:new Date().toISOString(),basis:'First-pass development only; no first-pass validation outcomes consulted',sourceHashes},null,2));
console.log('Follow-up queued until the first frozen study finishes.');while(!existsSync(join(directory,'results.json')))await new Promise(resolve=>setTimeout(resolve,1000));
const workers=[],start=performance.now();let completed=0;
function check(){if(existsSync('.bot-TaylorMason.lock'))throw new Error('Online bot must remain stopped');for(const s of [...sourceHashes,...manifest.liveHashes])if(hash(s.file)!==s.sha256)throw new Error(`Changed input: ${s.file}`);}
async function stage(name,bags,base){check();const tasks=[];for(const [fi,field] of ['empirical','planning'].entries())for(let n=0;n<bags;n++)tasks.push({id:tasks.length,stage:name,field,world:'mid',seed:base+fi*10000+n,n,configs:OVERLAY_VARIANTS});
  let next=0,done=0;const rows=[];return new Promise((resolve,reject)=>{const fail=e=>{for(const w of workers)w.terminate();reject(e);},send=w=>{if(next<tasks.length)w.postMessage(tasks[next++]);};
    for(const w of workers){w.removeAllListeners('message');w.removeAllListeners('error');w.on('error',fail);w.on('message',m=>{if(m.error)return fail(new Error(m.error));if(m.ready)return;rows.push(...m.records);completed+=m.records.length;done++;
      if(done%4===0||done===tasks.length){const p={stage:name,tasks:done,totalTasks:tasks.length,games:completed,expectedGames:960,seconds:(performance.now()-start)/1000};writeFileSync(join(directory,'followup-progress.json'),JSON.stringify(p));console.log(JSON.stringify(p));}
      if(done===tasks.length){rows.sort((a,b)=>a.field.localeCompare(b.field)||a.seed-b.seed||a.config.localeCompare(b.config));writeFileSync(join(directory,`${name}-games.json`),JSON.stringify(rows));resolve(rows);}else send(w);
    });send(w);}});}
function aggregate(rows){return {games:rows.length,score:mean(rows.map(g=>g.own.score)),wins:mean(rows.map(g=>Number(g.own.sharedWin))),margin:mean(rows.map(g=>g.own.score-g.own.topRival)),topRival:mean(rows.map(g=>g.own.topRival)),
  purchases:mean(rows.map(g=>g.own.purchases)),spent:mean(rows.map(g=>g.own.spent)),cash:mean(rows.map(g=>g.own.balance)),longWords:mean(rows.map(g=>g.own.longWords)),longWordValue:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.longWords,0)),
  diagnostics:Object.fromEntries(Object.keys(rows[0].diagnostics).map(k=>[k,rows.reduce((s,g)=>s+g.diagnostics[k],0)])),defense:Object.fromEntries(['pressureWins','pressurePaid','ownershipChanges','ownershipPayments','baselineAlreadyWins','baselineTies'].map(k=>[k,rows.reduce((s,g)=>s+g.defense[k],0)]))};}
function summarize(rows){return ['empirical','planning'].map(field=>{const g=rows.filter(g=>g.field===field),pairs=[...group(g,g=>g.seed).values()].map(a=>Object.fromEntries(a.map(g=>[g.config,g])));
  const comparisons=[['premium-bids','current-taylor'],['premium-joint','current-taylor'],['matched-extra','current-taylor'],['premium-bids','matched-extra'],['premium-joint','matched-extra'],['premium-joint','premium-bids']];
  return {field,aggregate:Object.fromEntries(OVERLAY_VARIANTS.map(c=>[c.id,aggregate(g.filter(r=>r.config===c.id))])),effects:Object.fromEntries(comparisons.map(([a,b])=>[`${a}-${b}`,{
    score:interval(pairs.map(p=>p[a].own.score-p[b].own.score)),margin:interval(pairs.map(p=>p[a].own.score-p[a].own.topRival-p[b].own.score+p[b].own.topRival)),
    wins:interval(pairs.map(p=>Number(p[a].own.sharedWin)-Number(p[b].own.sharedWin))),topRival:interval(pairs.map(p=>p[a].own.topRival-p[b].own.topRival))}]))};});}
try{check();for(let i=0;i<4;i++){const w=new Worker(new URL('./worker-v2.mjs',import.meta.url),{workerData:{directory},execArgv:['--import','tsx'],resourceLimits:{maxOldGenerationSizeMb:512}});await new Promise((resolve,reject)=>{w.once('error',reject);w.once('message',m=>m.ready?resolve():reject(new Error('Worker startup failed')));});workers.push(w);}
  const development=await stage('followup-development',24,35000000),summary=summarize(development);
  const candidates=['premium-bids','premium-joint'].map(id=>({config:OVERLAY_VARIANTS.find(c=>c.id===id),margin:mean(summary.map(s=>s.aggregate[id].margin))})).sort((a,b)=>b.margin-a.margin);
  const selected=candidates[0].config;writeFileSync(join(directory,'followup-selected.json'),JSON.stringify({frozenAt:new Date().toISOString(),selected,development:summary,sourceHashes},null,2));console.log(`FROZEN FOLLOW-UP: ${JSON.stringify(selected)}`);
  const final=await stage('followup-validation',96,36000000);check();if(completed!==960)throw new Error(`Wrong follow-up count: ${completed}`);
  const result={completedAt:new Date().toISOString(),games:completed,seconds:(performance.now()-start)/1000,workers:4,selected,development:summary,validation:summarize(final),sourceHashes,liveFilesUnchanged:manifest.liveHashes.length,onlineBotStopped:!existsSync('.bot-TaylorMason.lock')};
  writeFileSync(join(directory,'followup-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({games:completed,seconds:result.seconds,selected,validation:result.validation},null,2));
}finally{await Promise.all(workers.map(w=>w.terminate()));}
