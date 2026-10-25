import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {group,mean} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),r=load('results.json'),v2=load('followup-results.json'),m=load('manifest.json'),data=load('opponents.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
assert.equal(existsSync('.bot-TaylorMason.lock'),false);
for(const s of [...r.sourceHashes,...v2.sourceHashes,...m.liveHashes])assert.equal(hash(s.file),s.sha256,`Changed input: ${s.file}`);
for(const s of m.sources)assert.equal(hash(join(directory,'data',`${s.table}.json`)),s.sha256);
const diagnosticIds=new Set(data.diagnosticIds);for(const rows of Object.values(data.replay))assert.ok(rows.every(row=>!diagnosticIds.has(row.matchId)));
const stages=[['development',256,4],['defense',144,3],['validation',r.games-592,(r.games-592)/256],['sensitivity-low',96,2],['sensitivity-high',96,2],['followup-development',192,4],['followup-validation',768,4]];
const used=new Set();let total=0;
for(const [stage,count,variants] of stages){const rows=load(`${stage}-games.json`);assert.equal(rows.length,count);total+=rows.length;
  for(const pair of group(rows,g=>`${g.field}:${g.seed}`).values()){
    assert.equal(pair.length,variants);assert.equal(new Set(pair.map(g=>g.config)).size,variants);assert.equal(new Set(pair.map(g=>g.own.seat)).size,1);
    assert.equal(new Set(pair.map(g=>g.players.map(p=>p.name).join('|'))).size,1);const key=`${pair[0].field}:${pair[0].seed}`;assert.ok(!used.has(key),'Letter bag reused across stages');used.add(key);
  }
  for(const g of rows){assert.equal(g.players.length,6);assert.equal(g.defense.pressureWins,g.defense.ownershipChanges+g.defense.baselineAlreadyWins);
    assert.ok(g.defense.ownershipPayments<=g.defense.pressurePaid);assert.equal(g.own.score,g.players[g.own.seat].score);assert.equal(g.own.topRival,Math.max(...g.players.filter(p=>p.seat!==g.own.seat).map(p=>p.score)));}
  if(stage==='validation'||stage==='followup-validation'){const summary=stage==='validation'?r.validation:v2.validation;
    for(const s of summary)for(const [id,a] of Object.entries(s.aggregate)){const exact=rows.filter(g=>g.field===s.field&&g.config===id);assert.equal(exact.length,a.games);assert.equal(mean(exact.map(g=>g.own.score)),a.score);assert.equal(mean(exact.map(g=>Number(g.own.sharedWin))),a.wins);}
  }
}
assert.equal(total,r.games+v2.games);assert.equal(v2.games,960);
for(const file of ['replay-results.json','replay-followup-results.json']){const replay=load(file);assert.equal(replay.games,8);assert.equal(replay.positions,544);assert.ok(replay.summaries.every(s=>s.initialRackExact&&s.scoreAudit&&s.balanceAudit));}
const verification={verifiedAt:new Date().toISOString(),localGames:total,pairedBagGroups:used.size,diagnosticGames:8,observedDiagnosticPositions:544,policyFilesUnchanged:m.liveHashes.length,publicTrainingGames:data.trainingGames,
  traceFiles:readdirSync(join(directory,'traces')).length,onlineBotStopped:true,outputs:['results.json','followup-results.json','replay-results.json','replay-followup-results.json'].map(file=>({file,sha256:hash(join(directory,file))}))};
writeFileSync(join(directory,'verification.json'),JSON.stringify(verification,null,2));console.log(JSON.stringify(verification,null,2));
