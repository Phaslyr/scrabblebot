import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {mean,group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/taylor-offense/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),r=load('results.json'),manifest=load('manifest.json'),inputs=load('inputs.json'),priors=load('word-priors.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const s of [...r.sourceHashes,...manifest.liveHashes])assert.equal(hash(s.file),s.sha256,`Changed study input ${s.file}`);
for(const s of manifest.sources)assert.equal(hash(join(directory,'data',`${s.table}.json`)),s.sha256);
assert.equal(existsSync('.bot-TaylorMason.lock'),false);assert.equal(r.games,1600);
const seen=new Set();let games=0;
for(const [stage,count,bags] of [['development',320,32],['validation',1280,128]]){
  const rows=load(`${stage}-games.json`);assert.equal(rows.length,count);games+=rows.length;
  for(const pair of group(rows,g=>`${g.field}:${g.seed}`).values()){
    assert.equal(pair.length,5);assert.equal(new Set(pair.map(g=>g.config)).size,5);assert.equal(new Set(pair.map(g=>g.own.seat)).size,1);
    assert.equal(new Set(pair.map(g=>g.players.map(p=>p.name).join('|'))).size,1);const key=`${pair[0].field}:${pair[0].seed}`;assert.ok(!seen.has(key));seen.add(key);
  }
  for(const g of rows){assert.equal(g.players.length,6);assert.equal(g.own.score,g.players[g.own.seat].score);assert.equal(g.own.topRival,Math.max(...g.players.filter(p=>p.seat!==g.own.seat).map(p=>p.score)));
    if(g.config!=='legacy-pressure'){assert.equal(g.defense.pressureWins,0);assert.equal(g.defense.ownershipChanges,0);}
  }
  for(const s of r[stage])for(const [id,a] of Object.entries(s.aggregate)){const exact=rows.filter(g=>g.field===s.field&&g.config===id);assert.equal(exact.length,bags);assert.equal(mean(exact.map(g=>g.own.score)),a.score);assert.equal(mean(exact.map(g=>Number(g.own.sharedWin))),a.wins);}
}
assert.equal(games,1600);assert.ok(priors.words.every(w=>w.games>=3&&w.bots>=2&&w.reward>=30));
assert.deepEqual(r.selected,load('selected.json').selected);assert.ok(inputs.configs.some(c=>c.id===r.selected.id));
const verification={verifiedAt:new Date().toISOString(),localGames:games,pairedBagGroups:seen.size,wordFamilies:priors.words.length,trainingGames:priors.trainingGames,sourceHashesMatched:true,preIntegrationLegacyFilesUnchanged:manifest.liveHashes.length,traceFiles:readdirSync(join(directory,'traces')).length,onlineBotStopped:true,resultsHash:hash(join(directory,'results.json'))};
writeFileSync(join(directory,'verification.json'),JSON.stringify(verification,null,2));console.log(JSON.stringify(verification,null,2));
