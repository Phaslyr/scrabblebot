import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {TAYLOR_OFFENSE_VARIANTS} from '../../src/taylor-policy.ts';
import {mean,interval,group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/taylor-offense/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const configs=[{id:'legacy-pressure'},...TAYLOR_OFFENSE_VARIANTS],hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['src/taylor-policy.ts','src/taylor-priors.ts','experiments/taylor-offense/arena.mjs','experiments/taylor-offense/arena-core.ts','experiments/taylor-offense/worker.mjs','experiments/taylor-offense/run.mjs','experiments/taylor-offense/PROTOCOL.md','src/value-agent.ts','src/value-planning.ts',join(directory,'opponents.json'),join(directory,'word-priors.json'),'../spacetimedb/wordlist.txt'];
const sourceHashes=files.map(file=>({file,sha256:hash(file)}));
const inputs={frozenAt:new Date().toISOString(),configs,workers:4,developmentBags:32,validationBags:128,expectedGames:1600,sourceHashes,legacyHashes:manifest.liveHashes};
writeFileSync(join(directory,'inputs.json'),JSON.stringify(inputs,null,2));
const workers=[],start=performance.now();let completed=0;
function check(){if(existsSync('.bot-TaylorMason.lock'))throw new Error('Online TaylorMason must remain stopped');for(const s of [...sourceHashes,...manifest.liveHashes])if(hash(s.file)!==s.sha256)throw new Error(`Changed input: ${s.file}`);}
function aggregate(rows){return {games:rows.length,score:mean(rows.map(g=>g.own.score)),wins:mean(rows.map(g=>Number(g.own.sharedWin))),margin:mean(rows.map(g=>g.own.score-g.own.topRival)),topRival:mean(rows.map(g=>g.own.topRival)),purchases:mean(rows.map(g=>g.own.purchases)),spent:mean(rows.map(g=>g.own.spent)),cash:mean(rows.map(g=>g.own.balance)),longWords:mean(rows.map(g=>g.own.longWords)),longWordValue:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.longWords,0)),longScoreShare:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.score,0)),diagnostics:Object.fromEntries(Object.keys(rows[0].diagnostics).map(k=>[k,rows.reduce((s,g)=>s+g.diagnostics[k],0)])),defense:Object.fromEntries(['pressureWins','ownershipChanges','baselineAlreadyWins'].map(k=>[k,rows.reduce((s,g)=>s+g.defense[k],0)]))};}
function summarize(rows){return ['empirical','planning'].map(field=>{const g=rows.filter(g=>g.field===field),pairs=[...group(g,g=>g.seed).values()].map(a=>Object.fromEntries(a.map(g=>[g.config,g])));
  const comparisons=configs.flatMap(a=>['legacy-pressure','offense-only','offense-spend-six'].filter(b=>b!==a.id).map(b=>[a.id,b]));
  return {field,aggregate:Object.fromEntries(configs.map(c=>[c.id,aggregate(g.filter(r=>r.config===c.id))])),effects:Object.fromEntries(comparisons.map(([a,b])=>[`${a}-${b}`,{score:interval(pairs.map(p=>p[a].own.score-p[b].own.score)),margin:interval(pairs.map(p=>p[a].own.score-p[a].own.topRival-p[b].own.score+p[b].own.topRival)),wins:interval(pairs.map(p=>Number(p[a].own.sharedWin)-Number(p[b].own.sharedWin)))}]))};});}
async function stage(name,bags,base){check();const tasks=[];for(const [fi,field] of ['empirical','planning'].entries())for(let n=0;n<bags;n++)tasks.push({id:tasks.length,stage:name,field,world:'mid',seed:base+fi*10000+n,n,configs});
  let next=0,done=0;const rows=[];
  return new Promise((resolve,reject)=>{const fail=e=>{for(const w of workers)w.terminate();reject(e);},send=w=>{if(next<tasks.length)w.postMessage(tasks[next++]);};
    for(const w of workers){w.removeAllListeners('message');w.removeAllListeners('error');w.on('error',fail);w.on('message',m=>{if(m.error)return fail(new Error(m.error));if(m.ready)return;rows.push(...m.records);completed+=m.records.length;done++;
      if(done%8===0||done===tasks.length){const p={stage:name,tasks:done,totalTasks:tasks.length,games:completed,expectedGames:1600,seconds:(performance.now()-start)/1000};writeFileSync(join(directory,'progress.json'),JSON.stringify(p));console.log(JSON.stringify(p));}
      if(done===tasks.length){rows.sort((a,b)=>a.field.localeCompare(b.field)||a.seed-b.seed||a.config.localeCompare(b.config));writeFileSync(join(directory,`${name}-games.json`),JSON.stringify(rows));resolve(rows);}else send(w);
    });send(w);}
  });
}
try{
  check();for(let i=0;i<4;i++){const worker=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:{directory},execArgv:['--import','tsx'],resourceLimits:{maxOldGenerationSizeMb:512}});await new Promise((resolve,reject)=>{worker.once('error',reject);worker.once('message',m=>m.ready?resolve():reject(new Error('Worker startup failed')));});workers.push(worker);}
  const development=summarize(await stage('development',32,37000000));
  const ranking=TAYLOR_OFFENSE_VARIANTS.map((config,index)=>({config,index,score:mean(development.map(s=>s.aggregate[config.id].score)),margin:mean(development.map(s=>s.aggregate[config.id].margin))})).sort((a,b)=>b.score-a.score||b.margin-a.margin||a.index-b.index);
  const selected=ranking[0].config;writeFileSync(join(directory,'selected.json'),JSON.stringify({frozenAt:new Date().toISOString(),selected,ranking,development,sourceHashes},null,2));console.log(`FROZEN SELECTION: ${JSON.stringify(selected)}`);
  const validation=summarize(await stage('validation',128,38000000));check();if(completed!==1600)throw new Error('Wrong game count');
  const result={completedAt:new Date().toISOString(),games:completed,seconds:(performance.now()-start)/1000,selected,development,validation,sourceHashes,legacyHashes:manifest.liveHashes,onlineBotStopped:!existsSync('.bot-TaylorMason.lock')};
  writeFileSync(join(directory,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({games:completed,selected,seconds:result.seconds}));
}finally{await Promise.all(workers.map(worker=>worker.terminate()));}
