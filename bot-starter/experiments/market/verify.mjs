import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {group} from './stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/market/latest.json','utf8'));
const load=name=>JSON.parse(readFileSync(join(directory,name),'utf8'));
const result=load('results.json'),games=load('games.json'),manifest=load('manifest.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
assert.equal(games.length,3240);assert.equal(result.games,games.length);
const replacement=games.filter(g=>g.world!=='mixed'),mixed=games.filter(g=>g.world==='mixed');
assert.equal(replacement.length,2880);assert.equal(mixed.length,360);
for(const rows of group(replacement,g=>`${g.world}:${g.style}:${g.seed}`).values()){
  assert.equal(rows.length,5);assert.equal(new Set(rows.map(g=>g.mode)).size,5);
  assert.equal(new Set(rows.map(g=>g.own.seat)).size,1);
  assert.equal(new Set(rows.map(g=>g.players.map(p=>p.name).join('|'))).size,1);
}
assert.equal(group(replacement,g=>`${g.world}:${g.style}:${g.seed}`).size,576);
for(const rows of group(mixed,g=>g.seed).values()){
  assert.equal(rows.length,6);assert.equal(new Set(rows.map(g=>`${g.rotation}:${g.mode}`)).size,6);
  for(const pair of group(rows,g=>g.rotation).values())assert.equal(new Set(pair.map(g=>g.players.map(p=>p.name).join('|'))).size,1);
}
assert.equal(group(mixed,g=>g.seed).size,60);
for(const g of replacement){assert.ok(g.diagnostics.extraBidCoins<=4*g.diagnostics.bidRaises);
  if(g.mode==='control'){assert.equal(g.diagnostics.bidRaises,0);assert.equal(g.diagnostics.holdExtensions,0);}}
for(const s of manifest.sources)assert.equal(hash(join(directory,'data',`${s.table}.json`)),s.sha256);
for(const s of manifest.liveHashes)assert.equal(hash(s.file),s.sha256,`Live file changed: ${s.file}`);
for(const s of result.sources)assert.equal(hash(s.file),s.sha256,`Experiment input changed: ${s.file}`);
for(const s of load('prediction-sources.json'))assert.equal(hash(s.file),s.sha256,`Prediction input changed: ${s.file}`);
const verified={verifiedAt:new Date().toISOString(),games:games.length,pairedReplacementGroups:576,mixedBags:60,liveFilesUnchanged:manifest.liveHashes.length,
  dataSourcesVerified:manifest.sources.length,experimentInputsVerified:result.sources.length,
  artifacts:['results.json','prediction-results.json','games.json','models.json','replay.json'].map(file=>({file,sha256:hash(join(directory,file))}))};
writeFileSync(join(directory,'verification.json'),JSON.stringify(verified,null,2));console.log(JSON.stringify(verified,null,2));
