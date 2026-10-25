import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {group,mean,compare} from './stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/median-study/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),r=load('results.json'),manifest=load('manifest.json'),data=load('opponents.json'),paths=load('price-paths.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
assert.equal(existsSync('.bot-TaylorMason.lock'),false);
for(const s of [...r.sourceHashes,...r.liveHashes])assert.equal(hash(s.file),s.sha256,`Changed file ${s.file}`);
for(const s of manifest.sources)assert.equal(hash(join(directory,'data',`${s.table}.json`)),s.sha256);
const fit=new Set(data.fitIds),hold=new Set(data.holdoutIds),excluded=new Set(data.excludedDiagnosticIds);
for(const id of fit){assert.ok(!hold.has(id));assert.ok(!excluded.has(id));}for(const id of hold)assert.ok(!excluded.has(id));
assert.equal(paths.length,256);assert.equal(new Set(paths.map(p=>p.matchId)).size,256);for(const p of paths){assert.ok(hold.has(p.matchId));assert.equal(p.initialPool.length,30);assert.equal(p.auctions.length,68);}
const variants=r.selection.configs.length,stages=[['development',768,12],['refinement',320,5],['validation',768*variants,variants],['price-validation',256*variants,variants],['transport-stress',384,2]];
let games=0;const used=new Set();
for(const [stage,count,configs]of stages){const rows=load(`${stage}-games.json`);assert.equal(rows.length,count);games+=rows.length;
 for(const pair of group(rows,g=>`${g.field}:${g.seed}`).values()){assert.equal(pair.length,configs);assert.equal(new Set(pair.map(g=>g.config)).size,configs);const key=`${pair[0].field}:${pair[0].seed}`;assert.ok(!used.has(key));used.add(key);
  if(pair[0].field!=='price-taking'){assert.equal(new Set(pair.map(g=>g.own.seat)).size,1);assert.equal(new Set(pair.map(g=>g.players.map(p=>p.name).join('|'))).size,1);}
 }
 for(const g of rows){assert.equal(g.own.balance,100+g.own.score-g.own.spent);assert.ok(g.own.premiumPurchases<=g.own.purchases);if(g.field!=='price-taking'){assert.equal(g.own.score,g.players[g.own.seat].score);assert.equal(g.defense.pressureWins,0);assert.equal(g.defense.ownershipChanges,0);}else{assert.equal(g.own.sharedWin,undefined);assert.ok(hold.has(g.caseId));}}
}
assert.equal(games,r.games);assert.deepEqual(compare(load('validation-games.json'),r.selection.pairs),r.effects);
for(const s of r.validation)for(const [id,a]of Object.entries(s.aggregate)){const rows=load('validation-games.json').filter(g=>g.field===s.field&&g.config===id);assert.equal(rows.length,384);assert.equal(mean(rows.map(g=>g.own.score)),a.score);assert.equal(mean(rows.map(g=>Number(g.own.sharedWin))),a.wins);}
const verification={verifiedAt:new Date().toISOString(),games,pairedGroups:used.size,validationBagsPerField:384,pricePaths:256,fitGames:fit.size,holdoutGames:hold.size,diagnosticGamesExcluded:manifest.matchIds.length-fit.size-hold.size,correctedFamilySize:r.effects.length,traceFiles:readdirSync(join(directory,'traces')).length,liveFilesUnchanged:r.liveHashes.length,sourceHashesMatched:true,onlineBotStopped:true,resultsHash:hash(join(directory,'results.json'))};
writeFileSync(join(directory,'verification.json'),JSON.stringify(verification,null,2));console.log(JSON.stringify(verification,null,2));
