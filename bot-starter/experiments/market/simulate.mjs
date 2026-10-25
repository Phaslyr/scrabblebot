import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {DEFAULT_BAG} from '../../../spacetimedb/src/letters.ts';
import {loadDictionary} from '../../src/dictionary.ts';
import {prepareDictionary,chooseWord,chooseWordAtLeast} from '../../src/strategy.ts';
import {makeModelAgent,simulateMatch,seededRandom} from '../../src/local-arena.ts';
import {makeResponseAgent} from './response.mjs';
import {mean,interval,group} from './stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/market/latest.json','utf8'));
const models=JSON.parse(readFileSync(join(directory,'models.json'),'utf8'));
const replay=JSON.parse(readFileSync(join(directory,'replay.json'),'utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const dictionary=loadDictionary();prepareDictionary(dictionary);
const bag=DEFAULT_BAG.flatMap(([letter,n])=>Array(n).fill(letter));
const modes=['control','simple','style','direct','blind'],styles=['wags','taylor','victor'];
const worlds=[{name:'empirical-mid',q:0.5,seeds:120},{name:'empirical-low',q:0.15,seeds:24},{name:'empirical-high',q:0.85,seeds:24},{name:'cached-model',seeds:24}];
const oldSummary=JSON.parse(readFileSync('opponents/summary.json','utf8'));
const cached=oldSummary.selected.filter(m=>m.tier==='priority').slice(0,5).map(m=>JSON.parse(readFileSync(`opponents/models/bot-${m.botId}.json`,'utf8')));
const names=models.oldModels.leaders.map(b=>b.name),pools=new Map();
for(const name of names){const rows=replay[name];if(!rows?.length)throw new Error(`Missing replay for ${name}`);
  pools.set(name,{rows,byLetter:group(rows,r=>r.letter),byPhase:group(rows,r=>`${r.letter}:${r.phase}`)});}
function empiricalAgent(name,q,seed,index){let random;const pool=pools.get(name);
  return {name,kind:'model',reset(){random=seededRandom(seed+Math.imul(index+1,104729));},
    bid(ctx){const phase=Math.min(2,Math.floor(ctx.progress*3)),phaseRows=pool.byPhase.get(`${ctx.letter}:${phase}`);
      const source=phaseRows?.length>=5?phaseRows:pool.byLetter.get(ctx.letter)??pool.rows;
      const r=source[Math.floor(random()*source.length)],fraction=r.exact?r.low:r.low+q*(r.high-r.low);
      return Math.max(0,Math.min(Math.floor(ctx.myBalance),Math.round(ctx.myBalance*fraction)));},
    word(ctx){const size=[...ctx.myRack.values()].reduce((a,b)=>a+b,0),flush=ctx.myBalance<=20||ctx.remainingTiles<=3||size>=14;
      return flush?chooseWord(ctx):chooseWordAtLeast(ctx,7);}};
}
const records=[],start=performance.now(),expected=3240;
function record(r){records.push(r);if(records.length%30===0){const progress={games:records.length,total:expected,world:r.world,seconds:(performance.now()-start)/1000};
  console.log(JSON.stringify(progress));writeFileSync(join(directory,'progress.json'),JSON.stringify(progress));}}
console.log(`Offline all-three study: ${expected} games; no online runners imported.`);
for(let wi=0;wi<worlds.length;wi++){const world=worlds[wi];
  for(let n=0;n<world.seeds;n++)for(const style of styles)for(const mode of modes){
    const seed=12000000+wi*10000+n,seat=n%6,target=makeResponseAgent(style,mode,models);
    const rivals=world.name==='cached-model'?cached.map(makeModelAgent):names.map((name,i)=>empiricalAgent(name,world.q,seed,i));
    const agents=[...rivals];agents.splice(seat,0,target);const game=simulateMatch({seed,agents,dictionary,bag});
    record({world:world.name,seed,style,mode,own:{...game.players[seat],topRival:Math.max(...game.players.filter((_,i)=>i!==seat).map(p=>p.score))},diagnostics:{...target.diagnostics},...game});
  }
}
for(let n=0;n<60;n++)for(let rotation=0;rotation<3;rotation++)for(const mode of ['control','direct']){
  const seed=13000000+n,our=styles.map(style=>makeResponseAgent(style,mode,models)),ordered=our.slice(rotation).concat(our.slice(0,rotation));
  const rivals=Array.from({length:3},(_,i)=>empiricalAgent(names[(n+i)%names.length],0.5,seed,i));
  const agents=[...ordered,...rivals],offset=(n+2*rotation)%6;agents.push(...agents.splice(0,offset));
  const game=simulateMatch({seed,agents,dictionary,bag});
  record({world:'mixed',seed,rotation,mode,diagnostics:Object.fromEntries(styles.map((s,i)=>[s,{...our[i].diagnostics}])),...game});
}
const comparisons=[['simple','control'],['style','control'],['direct','control'],['blind','control'],['direct','simple'],['direct','blind']];
const summarize=games=>({games:games.length,score:mean(games.map(g=>g.own.score)),winRate:mean(games.map(g=>Number(g.own.sharedWin))),rank:mean(games.map(g=>g.own.rank)),
  topRival:mean(games.map(g=>g.own.topRival)),spent:mean(games.map(g=>g.own.spent)),longWords:mean(games.map(g=>g.own.longWords)),
  diagnostics:Object.fromEntries(Object.keys(games[0].diagnostics).map(k=>[k,games.reduce((s,g)=>s+g.diagnostics[k],0)]))});
const results=[];
for(const world of worlds)for(const style of styles){const rows=records.filter(g=>g.world===world.name&&g.style===style),pairs=[...group(rows,g=>g.seed).values()].map(a=>Object.fromEntries(a.map(g=>[g.mode,g])));
  const effects=Object.fromEntries(comparisons.map(([mode,base])=>[`${mode}-${base}`,{
    score:interval(pairs.map(p=>p[mode].own.score-p[base].own.score)),wins:interval(pairs.map(p=>Number(p[mode].own.sharedWin)-Number(p[base].own.sharedWin))),
    topRival:interval(pairs.map(p=>p[mode].own.topRival-p[base].own.topRival))}]));
  results.push({world:world.name,style,aggregate:Object.fromEntries(modes.map(mode=>[mode,summarize(rows.filter(g=>g.mode===mode))])),effects});
}
const mixed=[];
for(const style of styles){const rows=records.filter(g=>g.world==='mixed').map(g=>{const own=g.players.find(p=>p.kind===style);return {...g,own:{...own,topRival:Math.max(...g.players.filter(p=>p!==own).map(p=>p.score))},diagnostics:g.diagnostics[style]};});
  const pairs=[...group(rows,g=>g.seed).values()].map(g=>Object.fromEntries(['control','direct'].map(mode=>{const same=g.filter(r=>r.mode===mode);return [mode,{score:mean(same.map(r=>r.own.score)),wins:mean(same.map(r=>Number(r.own.sharedWin))),topRival:mean(same.map(r=>r.own.topRival))}];})));
  mixed.push({style,aggregate:Object.fromEntries(['control','direct'].map(mode=>[mode,summarize(rows.filter(g=>g.mode===mode))])),effects:{score:interval(pairs.map(p=>p.direct.score-p.control.score)),wins:interval(pairs.map(p=>p.direct.wins-p.control.wins)),topRival:interval(pairs.map(p=>p.direct.topRival-p.control.topRival))}});
}
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const changes=manifest.liveHashes.filter(s=>hash(s.file)!==s.sha256);if(changes.length)throw new Error(`Live policy files changed: ${changes.map(s=>s.file).join(', ')}`);
const sources=['experiments/market/simulate.mjs','experiments/market/response.mjs','experiments/market/stats.mjs','experiments/market/PROTOCOL.md',join(directory,'models.json'),join(directory,'replay.json'),...cached.map(m=>`opponents/models/bot-${m.botId}.json`)];
const result={completedAt:new Date().toISOString(),games:records.length,elapsedSeconds:(performance.now()-start)/1000,worlds,results,mixed,liveFilesUnchanged:manifest.liveHashes.length,sources:sources.map(file=>({file,sha256:hash(file)}))};
if(records.length!==expected)throw new Error(`Wrong game count: ${records.length}`);
writeFileSync(join(directory,'games.json'),JSON.stringify(records));writeFileSync(join(directory,'results.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({directory,games:records.length,seconds:result.elapsedSeconds,liveFilesUnchanged:result.liveFilesUnchanged},null,2));
