// Experimental policies only. Never imports an online runner or edits a bot.
import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {DEFAULT_BAG} from "../../../spacetimedb/src/letters.ts";
import {loadDictionary} from "../../src/dictionary.ts";
import {prepareDictionary,chooseWord,chooseWordAtLeast} from "../../src/strategy.ts";
import {makeModelAgent,simulateMatch,seededRandom} from "../../src/local-arena.ts";
import {makeResponseAgent} from "./response-point.mjs";

const {directory}=JSON.parse(readFileSync("experiments/betting/latest.json","utf8"));
const models=JSON.parse(readFileSync(join(directory,"forecast-models.json"),"utf8"));
const replay=JSON.parse(readFileSync(join(directory,"replay.json"),"utf8"));
const manifest=JSON.parse(readFileSync(join(directory,"manifest.json"),"utf8"));
const dictionary=loadDictionary();prepareDictionary(dictionary);
const bag=DEFAULT_BAG.flatMap(([letter,n])=>Array(n).fill(letter));
const modes=["control","simple","style","blind"];
const worlds=[{name:"empirical-mid",q:0.5,seeds:80},{name:"empirical-low",q:0.15,seeds:20},
  {name:"empirical-high",q:0.85,seeds:20},{name:"cached-model",seeds:20}];
const expected=worlds.reduce((n,w)=>n+w.seeds*2*modes.length,0);
const oldSummary=JSON.parse(readFileSync("opponents/summary.json","utf8"));
const cached=oldSummary.selected.filter(m=>m.tier==="priority").slice(0,5).map(m=>JSON.parse(readFileSync(`opponents/models/bot-${m.botId}.json`,"utf8")));
const empiricalNames=models.leaders.map(b=>b.name);
const pools=new Map();
for(const name of empiricalNames){const rows=replay[name];if(!rows?.length)throw new Error(`No held-out replay for ${name}`);
  const byLetter=new Map(),byPhase=new Map();for(const r of rows){if(!byLetter.has(r.letter))byLetter.set(r.letter,[]);byLetter.get(r.letter).push(r);
    const key=`${r.letter}:${r.phase}`;if(!byPhase.has(key))byPhase.set(key,[]);byPhase.get(key).push(r);}
  pools.set(name,{rows,byLetter,byPhase});
}
function empiricalAgent(name,q,seed,index){let random=seededRandom(seed+Math.imul(index+1,104729));const pool=pools.get(name);
  return {name,kind:"model",reset(){random=seededRandom(seed+Math.imul(index+1,104729));},
    bid(ctx){const phase=Math.min(2,Math.floor(ctx.progress*3)),phaseRows=pool.byPhase.get(`${ctx.letter}:${phase}`);
      const source=phaseRows?.length>=5?phaseRows:pool.byLetter.get(ctx.letter)??pool.rows;
      const record=source[Math.floor(random()*source.length)],fraction=record.exact?record.low:record.low+q*(record.high-record.low);
      return Math.max(0,Math.min(Math.floor(ctx.myBalance),Math.round(ctx.myBalance*fraction)));},
    word(ctx){const size=[...ctx.myRack.values()].reduce((a,b)=>a+b,0),flush=ctx.myBalance<=20||ctx.remainingTiles<=3||size>=14;
      return flush?chooseWord(ctx):chooseWordAtLeast(ctx,7);},
  };
}
const records=[],start=performance.now();
console.log(`Offline response ablation: ${expected} games; held-out empirical bid intervals plus cached-model sensitivity.`);
for(let worldIndex=0;worldIndex<worlds.length;worldIndex++){
  const world=worlds[worldIndex];
  for(let n=0;n<world.seeds;n++)for(const style of ["wags","taylor"])for(const mode of modes){
    const seed=10000000+worldIndex*10000+n,seat=n%6;
    const rivals=world.name==="cached-model"?cached.map(makeModelAgent):empiricalNames.map((name,i)=>empiricalAgent(name,world.q,seed,i));
    const target=makeResponseAgent(style,mode,models),agents=[...rivals];agents.splice(seat,0,target);
    const game=simulateMatch({seed,agents,dictionary,bag}),own=game.players[seat],top=Math.max(...game.players.filter((_,i)=>i!==seat).map(p=>p.score));
    records.push({world:world.name,seed,style,mode,own:{...own,topRival:top},diagnostics:{...target.diagnostics},...game});
    if(records.length%40===0){console.log(`${records.length}/${expected} (${((performance.now()-start)/1000).toFixed(1)}s)`);
      writeFileSync(join(directory,"point-progress.json"),JSON.stringify({games:records.length,total:expected,world:world.name,seconds:(performance.now()-start)/1000}));}
  }
}
const mean=a=>a.reduce((n,x)=>n+x,0)/Math.max(1,a.length);
function interval(a){const average=mean(a),v=a.reduce((n,x)=>n+(x-average)**2,0)/Math.max(1,a.length-1),d=a.length>1?1.96*Math.sqrt(v/a.length):null;
  return {mean:average,interval95:d===null?null:[average-d,average+d],independentBags:a.length};}
const results=[];
for(const world of worlds)for(const style of ["wags","taylor"]){const rows=records.filter(g=>g.world===world.name&&g.style===style),bySeed=new Map();
  for(const row of rows){if(!bySeed.has(row.seed))bySeed.set(row.seed,{});bySeed.get(row.seed)[row.mode]=row;}
  const aggregate=Object.fromEntries(modes.map(mode=>{const games=rows.filter(r=>r.mode===mode);return [mode,{games:games.length,score:mean(games.map(g=>g.own.score)),winRate:mean(games.map(g=>Number(g.own.sharedWin))),rank:mean(games.map(g=>g.own.rank)),topRival:mean(games.map(g=>g.own.topRival)),spent:mean(games.map(g=>g.own.spent)),bidRaises:games.reduce((s,g)=>s+g.diagnostics.bidRaises,0),holdExtensions:games.reduce((s,g)=>s+g.diagnostics.holdExtensions,0)}];}));
  const effects={};
  for(const [mode,base]of [["simple","control"],["style","control"],["blind","control"],["style","simple"],["style","blind"]]){
    const pairs=[...bySeed.values()];effects[`${mode}-${base}`]={score:interval(pairs.map(p=>p[mode].own.score-p[base].own.score)),
      wins:interval(pairs.map(p=>Number(p[mode].own.sharedWin)-Number(p[base].own.sharedWin))),
      topRival:interval(pairs.map(p=>p[mode].own.topRival-p[base].own.topRival))};
  }
  results.push({world:world.name,style,aggregate,effects});
}
const changes=manifest.liveHashes.filter(s=>createHash("sha256").update(readFileSync(s.file)).digest("hex")!==s.sha256);
if(changes.length)throw new Error(`Live policy files changed: ${changes.map(s=>s.file).join(", ")}`);
const sources=["experiments/betting/simulate-point.mjs","experiments/betting/response-point.mjs","experiments/betting/market.mjs",join(directory,"forecast-models.json"),join(directory,"replay.json"),...cached.map(m=>`opponents/models/bot-${m.botId}.json`)];
const result={completedAt:new Date().toISOString(),games:records.length,elapsedSeconds:(performance.now()-start)/1000,worlds,results,liveFilesUnchanged:manifest.liveHashes.length,
  sources:sources.map(file=>({file,sha256:createHash("sha256").update(readFileSync(file)).digest("hex")}))};
writeFileSync(join(directory,"point-results.json"),JSON.stringify(result,null,2));
writeFileSync(join(directory,"point-games.json"),JSON.stringify(records));
console.log(JSON.stringify({directory,games:result.games,seconds:result.elapsedSeconds,results:results.map(r=>({world:r.world,style:r.style,aggregate:r.aggregate,styleChange:r.effects["style-control"]}))},null,2));
