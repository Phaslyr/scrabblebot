import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {INITIAL,ORIGINAL,STATIC_TAYLOR,STATIC_WAGS,children} from './policy.mjs';
import {mean,interval,group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/victor-refinement/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8')),opponents=JSON.parse(readFileSync(join(directory,'opponents.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['experiments/victor-refinement/policy.mjs','experiments/victor-refinement/arena.mjs','experiments/victor-refinement/worker.mjs','experiments/victor-refinement/run.mjs','experiments/victor-refinement/PROTOCOL.md',join(directory,'opponents.json'),
  'src/local-arena.ts','src/strategy.ts','src/planning.ts','src/scoring-v3.ts','src/competition.ts','src/victor.ts'];
const sourceHashes=files.map(file=>({file,sha256:hash(file)}));writeFileSync(join(directory,'inputs.json'),JSON.stringify({frozenAt:new Date().toISOString(),sourceHashes},null,2));
const start=performance.now(),all=[],workers=[];let completed=0;
function checkHashes(){for(const s of [...sourceHashes,...manifest.liveHashes])if(hash(s.file)!==s.sha256)throw new Error(`Input changed: ${s.file}`);}
async function stage(name,configs,bags,world,base){checkHashes();const tasks=[];
  for(const [fi,field] of ['mixed','leaders'].entries())for(let n=0;n<bags;n++)tasks.push({id:tasks.length,stage:name,field,world,seed:base+fi*10000+n,n,configs});
  const rows=[];let next=0,done=0;
  return await new Promise((resolve,reject)=>{
    const send=w=>{if(next<tasks.length)w.postMessage(tasks[next++]);};
    const fail=error=>{for(const w of workers)w.terminate();reject(error);};
    for(const w of workers){w.removeAllListeners('message');w.removeAllListeners('error');w.on('error',fail);
      w.on('message',message=>{if(message.error){fail(new Error(message.error));return;}if(message.ready)return;
        rows.push(...message.records);completed+=message.records.length;done++;
        if(done%4===0||done===tasks.length){const p={stage:name,tasks:done,totalTasks:tasks.length,games:completed,expectedGames:2384,seconds:(performance.now()-start)/1000};
          console.log(JSON.stringify(p));writeFileSync(join(directory,'progress.json'),JSON.stringify(p));}
        if(done===tasks.length){rows.sort((a,b)=>a.field.localeCompare(b.field)||a.seed-b.seed||a.config.localeCompare(b.config));
          writeFileSync(join(directory,`${name}-games.json`),JSON.stringify(rows));all.push(...rows);resolve(rows);}else send(w);
      });send(w);
    }
  });
}
function ranking(rows,configs){return configs.map(config=>{const games=rows.filter(r=>r.config===config.id);return {config,score:mean(games.map(g=>g.own.score)),winRate:mean(games.map(g=>Number(g.own.sharedWin))),topPublicRival:mean(games.map(g=>g.own.topPublicRival))};}).sort((a,b)=>b.score-a.score||a.topPublicRival-b.topPublicRival);}
function aggregate(rows){const fields=['score','balance','spent','purchases','longWords','shortWords'];
  return {games:rows.length,...Object.fromEntries(fields.map(k=>[k,mean(rows.map(g=>g.own[k]))])),winRate:mean(rows.map(g=>Number(g.own.sharedWin))),
    longScoreShare:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.score,0)),
    topRival:mean(rows.map(g=>g.own.topRival)),topPublicRival:mean(rows.map(g=>g.own.topPublicRival)),
    against:Object.fromEntries(['TaylorMason','Wags'].flatMap(name=>{const subset=rows.filter(g=>g.players.some(p=>p.name===name));
      return subset.length?[[name,{scoreMargin:mean(subset.map(g=>g.own.score-g.players.find(p=>p.name===name).score)),strictlyBeatRate:mean(subset.map(g=>Number(g.own.score>g.players.find(p=>p.name===name).score)))}]]:[];})),
    diagnostics:Object.fromEntries(Object.keys(rows[0].diagnostics).map(k=>[k,rows.reduce((s,g)=>s+g.diagnostics[k],0)]))};}
function summarize(rows,configs,selected){return ['mixed','leaders'].map(field=>{const games=rows.filter(g=>g.field===field),pairs=[...group(games,g=>g.seed).values()].map(a=>Object.fromEntries(a.map(g=>[g.config,g])));
  return {field,aggregate:Object.fromEntries(configs.map(c=>[c.id,aggregate(games.filter(g=>g.config===c.id))])),
    effects:Object.fromEntries(configs.filter(c=>c.id!==selected.id).map(c=>[`${selected.id}-${c.id}`,{
      score:interval(pairs.map(p=>p[selected.id].own.score-p[c.id].own.score)),wins:interval(pairs.map(p=>Number(p[selected.id].own.sharedWin)-Number(p[c.id].own.sharedWin))),
      topRival:interval(pairs.map(p=>p[selected.id].own.topRival-p[c.id].own.topRival)),topPublicRival:interval(pairs.map(p=>p[selected.id].own.topPublicRival-p[c.id].own.topPublicRival))}]))};});}
try{
  for(let i=0;i<2;i++){const w=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:{directory},execArgv:['--import','tsx'],resourceLimits:{maxOldGenerationSizeMb:512}});
    await new Promise((resolve,reject)=>{w.once('error',reject);w.once('message',m=>m.ready?resolve():reject(new Error('Worker failed to initialize')));});workers.push(w);}
  const first=await stage('iteration-1',INITIAL,40,'mid',21000000),rank1=ranking(first,INITIAL.filter(c=>!['original','static-taylor'].includes(c.id))),parent=rank1[0].config;
  writeFileSync(join(directory,'iteration-1-selection.json'),JSON.stringify({rank:rank1,all:ranking(first,INITIAL),selected:parent},null,2));console.log(`ITERATION 1 SELECTED: ${JSON.stringify(rank1)}`);
  const eligible=[parent,...children(parent)],secondConfigs=[...eligible,STATIC_TAYLOR];
  const second=await stage('iteration-2',secondConfigs,40,'mid',22000000),rank2=ranking(second,eligible),selected=rank2[0].config;
  writeFileSync(join(directory,'iteration-2-selection.json'),JSON.stringify({rank:rank2,all:ranking(second,secondConfigs),selected},null,2));
  const frozen={frozenAt:new Date().toISOString(),selected,sourceHashes,opponents:opponents.leaders.map(({histogram,...b})=>b)};
  writeFileSync(join(directory,'selected-candidate.json'),JSON.stringify(frozen,null,2));console.log(`FROZEN CANDIDATE: ${JSON.stringify(selected)}`);
  const finalConfigs=[ORIGINAL,selected,STATIC_TAYLOR,STATIC_WAGS];
  const final=await stage('validation',finalConfigs,160,'mid',23000000),validation=summarize(final,finalConfigs,selected),sensitivity=[];
  for(const [index,world] of ['low','high','planning'].entries()){
    const rows=await stage(`sensitivity-${world}`,[ORIGINAL,selected],32,world,24000000+index*100000);
    sensitivity.push({world,results:summarize(rows,[ORIGINAL,selected],selected)});
  }
  checkHashes();if(completed!==2384)throw new Error(`Wrong total: ${completed}`);
  const result={completedAt:new Date().toISOString(),directory,games:completed,seconds:(performance.now()-start)/1000,workers:2,selected,iteration1:rank1,iteration2:rank2,validation,sensitivity,
    publicAudit:opponents.audit,leaders:opponents.leaders.map(({histogram,...b})=>b),liveFilesUnchanged:manifest.liveHashes.length,sourceHashes};
  writeFileSync(join(directory,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({games:completed,seconds:result.seconds,selected,validation,liveFilesUnchanged:result.liveFilesUnchanged},null,2));
}finally{await Promise.all(workers.map(w=>w.terminate()));}
