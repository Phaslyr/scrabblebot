import {makeWagsAgent,makeTaylorAgent,seededRandom,simulateMatch} from '../../src/local-arena.ts';
import {chooseWord,chooseWordAtLeast} from '../../src/strategy.ts';
import {scoringBid,chooseScoringWord} from '../../src/scoring-v3.ts';
import {makeCandidate} from './policy.mjs';
import {group} from '../market/stats.mjs';
export function prepareOpponents(data){return new Map(data.leaders.map(b=>{const rows=data.replay[b.name];return [b.name,{...b,rows,byLetter:group(rows,r=>r.letter),byPhase:group(rows,r=>`${r.letter}:${r.phase}`)}];}));}
function rival(model,world,seed,index){let random;return {name:model.name,kind:'model',reset(){random=seededRandom(seed+Math.imul(index+1,104729));},
  bid(ctx){if(world==='planning')return scoringBid(ctx,ctx.opponents,index%2?'wags':'taylor',index%2?1:1.6).amount;
    const phase=Math.min(2,Math.floor(ctx.progress*3)),phaseRows=model.byPhase.get(`${ctx.letter}:${phase}`),source=phaseRows?.length>=5?phaseRows:model.byLetter.get(ctx.letter)??model.rows;
    const r=source[Math.floor(random()*source.length)],q=world==='low'?0.15:world==='high'?0.85:0.5;
    const fraction=r.exact?r.low:r.low+q*(r.high-r.low);return Math.max(0,Math.min(Math.floor(ctx.myBalance),Math.round(ctx.myBalance*fraction)));},
  word(ctx){if(world==='planning')return chooseScoringWord(ctx,index%2?'wags':'taylor');
    const settings=model.word,size=[...ctx.myRack.values()].reduce((a,b)=>a+b,0),flush=ctx.myBalance<=settings.cashOutBalance||ctx.remainingTiles<=settings.flushRemaining||size>=settings.rackLimit;
    return flush?chooseWord(ctx):chooseWordAtLeast(ctx,settings.minimumLength);}};}
export function enrich(agent,publicStats){const view=ctx=>({...ctx,opponents:ctx.opponents.map(o=>({...o,...publicStats[o.name]}))});
  return {...agent,bid:ctx=>agent.bid(view(ctx)),word:ctx=>agent.word(view(ctx))};}
export function playTask(task,data,pools,dictionary,bag){const {field,seed,n,world,configs}=task,models=data.leaders.map(b=>pools.get(b.name));
  const count=field==='mixed'?3:5,chosen=Array.from({length:count},(_,i)=>models[(n+i)%models.length]);
  const records=[];
  for(const config of configs){const target=makeCandidate(config),opponents=chosen.map((m,i)=>rival(m,world,seed,i));
    const agents=field==='mixed'?[target,makeTaylorAgent(1.6),makeWagsAgent(),...opponents]:[target,...opponents];
    const offset=n%6;agents.push(...agents.splice(0,offset));const game=simulateMatch({seed,agents:agents.map(a=>enrich(a,data.publicStats)),dictionary,bag});
    const own=game.players.find(p=>p.kind==='victor'),others=game.players.filter(p=>p!==own),publicRivals=others.filter(p=>p.kind==='model');
    records.push({stage:task.stage,field,world,seed,n,config:config.id,own:{...own,topRival:Math.max(...others.map(p=>p.score)),topPublicRival:Math.max(...publicRivals.map(p=>p.score))},
      diagnostics:{...target.diagnostics},...game});
  }
  return records;
}
