import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {archive} from './data.mjs';
import {makeTable,tablePoint,fitBoosted,directPoint,distance,calibrate,band} from './learner.mjs';
import {predictBid} from '../../src/public-opponents.ts';
import {mean,interval,group} from './stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/market/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const oldManifest=JSON.parse(readFileSync(join(manifest.previous,'manifest.json'),'utf8'));
const oldModels=JSON.parse(readFileSync(join(manifest.previous,'forecast-models.json'),'utf8'));
const old=archive(manifest.previous,new Set(oldManifest.matchIds));
const cut=oldManifest.matchIds[Math.floor(oldManifest.matchIds.length*0.8)-1];
const train=old.rows.filter(r=>r.matchId<=cut),cal=old.rows.filter(r=>r.matchId>cut);
if(!train.length||!cal.length||old.audit.excluded.length)throw new Error('Archive reconstruction failed.');
console.log(JSON.stringify({trainRows:train.length,calRows:cal.length,oldAudit:old.audit}));
const table=makeTable(train),counts=new Map();
for(const r of train)for(const s of r.rivals)counts.set(s.botId,(counts.get(s.botId)??0)+1);
const identities=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,16).map(([id])=>id);
const candidates=[];let chosen;
for(const [name,ids] of [['context',[]],['identity',identities]]){
  const fitted={...fitBoosted(train,table,ids),table};
  for(const trees of [0,10,20,40,80]){
    const model={...fitted,trees:fitted.trees.slice(0,trees)},calibration=calibrate(cal,r=>directPoint(model,r));
    const error=mean([...group(cal,r=>r.matchId).values()].map(rows=>mean(rows.map(r=>distance(r,band(directPoint(model,r),calibration).point)))));
    const entry={name,trees:model.trees.length,error};candidates.push(entry);
    if(!chosen||error<chosen.error)chosen={...entry,model,calibration};
  }
  console.log(`${name} fitted and calibration-scored`);
}
const rawStyle=r=>Math.max(0,...r.rivals.map(s=>{const item=oldModels.identity[s.botId],fit=item?item[item.selected]:oldModels.pooled;
  return predictBid(fit,{...s,letter:r.letter,progress:r.progress,firstPrice:false});}));
const simpleCalibration=calibrate(cal,r=>tablePoint(table,r));
const styleCalibration=calibrate(cal,rawStyle);
const models={frozenAt:new Date().toISOString(),trainingMaximum:cut,calibrationMaximum:oldManifest.maximum,
  table,simpleCalibration,direct:chosen.model,directCalibration:chosen.calibration,selected:{name:chosen.name,trees:chosen.trees},
  candidates,oldModels,styleCalibration,nameToId:{...oldModels.nameToId,...Object.fromEntries([...old.bots].map(([id,b])=>[b.name,id]))}};
// Freeze selection before loading or scoring any of the fresh games.
writeFileSync(join(directory,'models.json'),JSON.stringify(models));
console.log(JSON.stringify({selected:models.selected,candidates}));
const fresh=archive(directory,new Set(manifest.matchIds));
if(fresh.audit.excluded.length)throw new Error('Fresh archive reconstruction failed.');
models.nameToId={...models.nameToId,...Object.fromEntries([...fresh.bots].map(([id,b])=>[b.name,id]))};
writeFileSync(join(directory,'models.json'),JSON.stringify(models));
const predictors={simple:r=>band(tablePoint(table,r),simpleCalibration),style:r=>band(rawStyle(r),styleCalibration),direct:r=>band(directPoint(chosen.model,r),chosen.calibration)};
const byGame=[...group(fresh.rows,r=>r.matchId)].map(([matchId,rows])=>({matchId,observations:rows.length,
  ...Object.fromEntries(Object.entries(predictors).map(([name,predict])=>[name,{error:mean(rows.map(r=>distance(r,predict(r).point))),
    coverage:mean(rows.map(r=>{const p=predict(r);return Number(p.low<=r.high&&p.high>=r.low);})),width:mean(rows.map(r=>{const p=predict(r);return p.high-p.low;}))}]))}));
const prediction={freshMatches:manifest.matchIds.length,marketGames:byGame.length,observations:fresh.rows.length,oldAudit:old.audit,freshAudit:fresh.audit,
  split:{trainMaximum:cut,calibrationMaximum:oldManifest.maximum,testMinimum:manifest.minimum,testMaximum:manifest.maximum,trainRows:train.length,calRows:cal.length},selected:models.selected,candidates,
  metrics:Object.fromEntries(Object.keys(predictors).map(k=>[k,{error:interval(byGame.map(g=>g[k].error)),coverage:mean(byGame.map(g=>g[k].coverage)),width:mean(byGame.map(g=>g[k].width))}])),
  differences:Object.fromEntries(['simple','style'].map(k=>[`direct-${k}`,interval(byGame.map(g=>g.direct.error-g[k].error))])),byGame};
const replay=Object.fromEntries(oldModels.leaders.map(({id,name})=>[name,fresh.bids.filter(r=>r.botId===id)]));
for(const [name,rows] of Object.entries(replay))if(rows.length<100)throw new Error(`Insufficient fresh replay for ${name}: ${rows.length}`);
writeFileSync(join(directory,'replay.json'),JSON.stringify(replay));
writeFileSync(join(directory,'prediction-results.json'),JSON.stringify(prediction,null,2));
writeFileSync(join(directory,'prediction-sources.json'),JSON.stringify(['experiments/market/data.mjs','experiments/market/learner.mjs','experiments/market/prepare.mjs',join(directory,'models.json')].map(file=>({file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')})),null,2));
console.log(JSON.stringify({directory,selected:prediction.selected,freshAudit:fresh.audit,marketGames:byGame.length,observations:fresh.rows.length,metrics:prediction.metrics,differences:prediction.differences,replay:Object.fromEntries(Object.entries(replay).map(([k,r])=>[k,r.length]))},null,2));
