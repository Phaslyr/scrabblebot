import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {group} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/victor-refinement/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),r=load('results.json'),m=load('manifest.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const s of [...r.sourceHashes,...m.liveHashes,...load('dictionary-inputs.json').hashes])assert.equal(hash(s.file),s.sha256,`Input changed: ${s.file}`);
for(const s of m.sources)assert.equal(hash(join(directory,'data',`${s.table}.json`)),s.sha256);
const stages=[['iteration-1',400,5],['iteration-2',320,4],['validation',1280,4],['sensitivity-low',128,2],['sensitivity-high',128,2],['sensitivity-planning',128,2]],seedsByField=new Map();let total=0;
for(const [stage,count,variants] of stages){const rows=load(`${stage}-games.json`);assert.equal(rows.length,count);total+=rows.length;
  for(const pair of group(rows,g=>`${g.field}:${g.seed}`).values()){
    assert.equal(pair.length,variants);assert.equal(new Set(pair.map(g=>g.config)).size,variants);
    assert.equal(new Set(pair.map(g=>g.players.map(p=>p.name).join('|'))).size,1);
    assert.equal(new Set(pair.map(g=>g.own.seat)).size,1);
    const key=`${pair[0].field}:${pair[0].seed}`;assert.ok(!seedsByField.has(key),'Seed leaked between stages');seedsByField.set(key,stage);
  }
  for(const g of rows){const d=g.diagnostics;assert.equal(d.buildBids+d.defendBids+d.rebuildBids,g.auctions);assert.equal(g.players.length,6);}
}
assert.equal(total,2384);assert.equal(total,r.games);
const artifact={verifiedAt:new Date().toISOString(),games:total,pairedBagGroups:seedsByField.size,liveFilesUnchanged:m.liveHashes.length,dictionaryInputsUnchanged:2,dataSourcesVerified:m.sources.length,selected:r.selected,
  outputs:['results.json','selected-candidate.json','validation-games.json'].map(file=>({file,sha256:hash(join(directory,file))}))};
writeFileSync(join(directory,'verification.json'),JSON.stringify(artifact,null,2));console.log(JSON.stringify(artifact,null,2));
