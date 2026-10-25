import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {VALUE_CONTROL,VALUE_VARIANTS} from '../../src/value-agent.ts';
import {mean,interval,group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8')),data=JSON.parse(readFileSync(join(directory,'opponents.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['src/value-planning.ts','src/value-agent.ts','experiments/value-planning/arena.mjs','experiments/value-planning/arena-core.ts','experiments/value-planning/worker.mjs','experiments/value-planning/run.mjs','experiments/value-planning/PROTOCOL.md','../spacetimedb/wordlist.txt','../spacetimedb/src/letters.ts',join(directory,'opponents.json')];
const sourceHashes=files.map(file=>({file,sha256:hash(file)}));writeFileSync(join(directory,'inputs.json'),JSON.stringify({frozenAt:new Date().toISOString(),sourceHashes},null,2));
const workers=[],start=performance.now();let completed=0,expected=1360;
function check(){if(existsSync('.bot-TaylorMason.lock'))throw new Error('Online bot lock appeared; local study requires it stopped.');for(const s of [...sourceHashes,...manifest.liveHashes])if(hash(s.file)!==s.sha256)throw new Error(`Changed study input: ${s.file}`);}
async function stage(name,configs,bags,world,base){check();const tasks=[];for(const [fi,field] of ['empirical','planning'].entries())for(let n=0;n<bags;n++)tasks.push({id:tasks.length,stage:name,field,world,seed:base+fi*10000+n,n,configs});
  let next=0,done=0;const rows=[];return new Promise((resolve,reject)=>{
    const fail=e=>{for(const w of workers)w.terminate();reject(e);},send=w=>{if(next<tasks.length)w.postMessage(tasks[next++]);};
    for(const w of workers){w.removeAllListeners('message');w.removeAllListeners('error');w.on('error',fail);w.on('message',m=>{if(m.error)return fail(new Error(m.error));if(m.ready)return;
      rows.push(...m.records);completed+=m.records.length;done++;
      if(done%4===0||done===tasks.length){const p={stage:name,tasks:done,totalTasks:tasks.length,games:completed,expectedGames:expected,seconds:(performance.now()-start)/1000};writeFileSync(join(directory,'progress.json'),JSON.stringify(p));console.log(JSON.stringify(p));}
      if(done===tasks.length){rows.sort((a,b)=>a.field.localeCompare(b.field)||a.seed-b.seed||a.config.localeCompare(b.config));writeFileSync(join(directory,`${name}-games.json`),JSON.stringify(rows));resolve(rows);}else send(w);
    });send(w);}
  });}
function ranking(rows,configs){return configs.map(config=>{const g=rows.filter(r=>r.config===config.id);return {config,margin:mean(g.map(g=>g.own.score-g.own.topRival)),score:mean(g.map(g=>g.own.score)),wins:mean(g.map(g=>Number(g.own.sharedWin)))};}).sort((a,b)=>b.margin-a.margin||b.score-a.score);}
function aggregate(rows){return {games:rows.length,score:mean(rows.map(g=>g.own.score)),wins:mean(rows.map(g=>Number(g.own.sharedWin))),margin:mean(rows.map(g=>g.own.score-g.own.topRival)),rank:mean(rows.map(g=>g.own.rank)),
  topRival:mean(rows.map(g=>g.own.topRival)),topPublicRival:mean(rows.map(g=>g.own.topPublicRival)),spent:mean(rows.map(g=>g.own.spent)),cash:mean(rows.map(g=>g.own.balance)),purchases:mean(rows.map(g=>g.own.purchases)),
  longWords:mean(rows.map(g=>g.own.longWords)),longWordValue:rows.reduce((s,g)=>s+g.own.longScore,0)/Math.max(1,rows.reduce((s,g)=>s+g.own.longWords,0)),
  diagnostics:Object.fromEntries(Object.keys(rows[0].diagnostics).map(k=>[k,rows.reduce((s,g)=>s+g.diagnostics[k],0)])),
  defense:Object.fromEntries(['pressureWins','pressurePaid','ownershipChanges','ownershipPayments','baselineAlreadyWins','baselineTies'].map(k=>[k,rows.reduce((s,g)=>s+g.defense[k],0)]))};}
function summarize(rows,configs,selected){return ['empirical','planning'].map(field=>{const g=rows.filter(r=>r.field===field),pairs=[...group(g,r=>r.seed).values()].map(a=>Object.fromEntries(a.map(g=>[g.config,g])));
  return {field,aggregate:Object.fromEntries(configs.map(c=>[c.id,aggregate(g.filter(r=>r.config===c.id))])),effects:Object.fromEntries(configs.filter(c=>c.id!==selected.id).map(c=>[`${selected.id}-${c.id}`,{
    score:interval(pairs.map(p=>p[selected.id].own.score-p[c.id].own.score)),margin:interval(pairs.map(p=>p[selected.id].own.score-p[selected.id].own.topRival-p[c.id].own.score+p[c.id].own.topRival)),
    wins:interval(pairs.map(p=>Number(p[selected.id].own.sharedWin)-Number(p[c.id].own.sharedWin))),topRival:interval(pairs.map(p=>p[selected.id].own.topRival-p[c.id].own.topRival))}]))};});}
try{
  for(let i=0;i<2;i++){const w=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:{directory},execArgv:['--import','tsx'],resourceLimits:{maxOldGenerationSizeMb:512}});await new Promise((resolve,reject)=>{w.once('error',reject);w.once('message',m=>m.ready?resolve():reject(new Error('Worker startup failed')));});workers.push(w);}
  const development=await stage('development',VALUE_VARIANTS,32,'mid',31000000),rank=ranking(development,VALUE_VARIANTS.filter(c=>c.id!==VALUE_CONTROL.id)),parent=rank[0].config;
  writeFileSync(join(directory,'development-selection.json'),JSON.stringify({selected:parent,ranking:ranking(development,VALUE_VARIANTS)},null,2));console.log(`SCORING SELECTION: ${JSON.stringify(parent)}`);
  const defenseConfigs=[parent,{...parent,id:`${parent.id}-off`,defense:'off'},{...parent,id:`${parent.id}-selective`,defense:'selective'}];
  const defenseRows=await stage('defense',defenseConfigs,24,'mid',32000000),defenseRank=ranking(defenseRows,defenseConfigs),selected=defenseRank[0].config;
  writeFileSync(join(directory,'defense-selection.json'),JSON.stringify({selected,ranking:defenseRank},null,2));
  const validationConfigs=[...new Map([VALUE_CONTROL,parent,selected].map(c=>[c.id,c])).values()];expected=256+144+validationConfigs.length*128*2+192;
  writeFileSync(join(directory,'selected-candidate.json'),JSON.stringify({frozenAt:new Date().toISOString(),scoring:parent,selected,validationConfigs,sourceHashes},null,2));console.log(`FROZEN CANDIDATE: ${JSON.stringify(selected)}`);
  const validationRows=await stage('validation',validationConfigs,128,'mid',33000000),validation=summarize(validationRows,validationConfigs,selected),sensitivity=[];
  for(const [i,world] of ['low','high'].entries()){const rows=await stage(`sensitivity-${world}`,[VALUE_CONTROL,selected],24,world,34000000+i*100000);sensitivity.push({world,results:summarize(rows,[VALUE_CONTROL,selected],selected)});}
  check();if(completed!==expected)throw new Error(`Unexpected game count: ${completed}`);
  const result={completedAt:new Date().toISOString(),games:completed,seconds:(performance.now()-start)/1000,directory,scoring:parent,selected,development:ranking(development,VALUE_VARIANTS),defenseDevelopment:defenseRank,validation,sensitivity,
    leaders:data.leaders,publicAudit:data.audit,liveFilesUnchanged:manifest.liveHashes.length,sourceHashes,onlineBotStopped:!existsSync('.bot-TaylorMason.lock')};
  writeFileSync(join(directory,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({games:completed,seconds:result.seconds,selected,validation},null,2));
}finally{await Promise.all(workers.map(w=>w.terminate()));}
