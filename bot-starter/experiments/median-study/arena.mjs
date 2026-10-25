import {appendFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {makeTaylorAgent,makeWagsAgent,seededRandom} from '../../src/local-arena.ts';
import {simulateMatch,settleAuction} from './arena-core.ts';
import {makeMedianAgent} from '../../src/median-policy.ts';
import {makeValueAgent} from '../../src/value-agent.ts';
import {rawValueFrontier,priceFor} from '../../src/value-planning.ts';
import {chooseWord,chooseWordAtLeast,wordReward} from '../../src/strategy.ts';
import {group} from '../market/stats.mjs';
export function preparePools(data){return new Map(data.leaders.map(b=>{const rows=data.replay[b.name];return [b.name,{...b,scale:data.opponentScale,rows,byLetter:group(rows,r=>r.letter),byPhase:group(rows,r=>`${r.letter}:${r.phase}`)}];}));}
function empirical(model,world,seed,index){let random;return {name:model.name,kind:'model',reset(){random=seededRandom(seed+Math.imul(index+1,104729));},
  bid(ctx){const phaseRows=model.byPhase.get(`${ctx.letter}:${Math.min(2,Math.floor(ctx.progress*3))}`),source=phaseRows?.length>=5?phaseRows:model.byLetter.get(ctx.letter)??model.rows;
    const r=source[Math.floor(random()*source.length)],q=world==='low'?.15:world==='high'?.85:.5,fraction=r.exact?r.low:r.low+q*(r.high-r.low);
    return Math.max(0,Math.min(Math.floor(ctx.myBalance),Math.round(ctx.myBalance*fraction*model.scale)));},
  word(ctx){const size=[...ctx.myRack.values()].reduce((a,b)=>a+b,0),s=model.word,word=chooseWord(ctx);return ctx.myBalance<=s.cashOutBalance||ctx.remainingTiles<=s.flushRemaining||size>=s.rackLimit||word&&wordReward(word)>=s.minimumReward?word:null;}};}
// Independent premium-goal ranking, without the candidate's completion
// probabilities, net-value frontier, or cash/hold decision rules.
function premiumRival(model,market){let round=0,lastWord=0;
  function plan(ctx){const raw=rawValueFrontier(ctx),goals=raw.near.map(g=>{const cost=g.missingLetters.reduce((s,c)=>s+priceFor(market,c,ctx.progress).paid,0);
    return {...g,rank:g.entry.reward/(g.missing+1)**1.1*(g.entry.reward>=model.word.minimumReward?1:.75)-.15*cost};}).sort((a,b)=>b.rank-a.rank||a.entry.word.localeCompare(b.entry.word));
    return {...raw,goal:goals[0],value:Math.max(raw.base.score,goals[0]?.rank??0)};}
  return {name:model.name,kind:'model',reset(){round=0;lastWord=0;},bid(ctx){round++;if(ctx.remainingTiles<=0)return 0;const before=plan(ctx),rack=new Map(ctx.myRack);rack.set(ctx.letter,(rack.get(ctx.letter)??0)+1);const after=plan({...ctx,myRack:rack});
    const immediate=Math.max(0,after.base.score-before.base.score),marginal=Math.max(0,after.value-before.value),price=priceFor(market,ctx.letter,ctx.progress),ending=ctx.remainingTiles<=8;
    let explore=before.base.size<8?Math.max(3,Math.round(price.paid*.65)):0;if((ctx.myRack.get(ctx.letter)??0)>=2)explore=Math.min(2,explore);
    const advances=before.goal?.missingLetters.includes(ctx.letter),goalCap=advances?Math.floor(before.goal.entry.reward/(before.goal.missing+1)*.9):0;
    const target=advances&&price.top+1<=goalCap?price.top+1:0,cap=Math.min(Math.floor(ctx.myBalance*(ending?.95:.75)),ctx.myBalance-(ending?0:Math.min(4,Math.floor(ctx.myBalance*.1))));
    return Math.max(0,Math.min(cap,Math.max(ending&&immediate===0?0:explore,Math.ceil(Math.max(immediate*.95,marginal*1.8)),target)));},
    word(ctx){const p=plan(ctx),word=p.base.words.slice().sort((a,b)=>wordReward(b)-wordReward(a))[0];if(!word)return null;
      if(ctx.myBalance<=model.word.cashOutBalance||ctx.remainingTiles<=3||p.base.size>=14||round-lastWord>=12){lastWord=round;return word;}
      if(wordReward(word)>=model.word.minimumReward){lastWord=round;return word;}
      if(p.goal&&p.goal.missing<=2&&p.goal.entry.reward>wordReward(word)+12&&ctx.remainingTiles>10){
        for(const candidate of p.base.words){const rest=Array.from({length:26},(_,i)=>(ctx.myRack.get(String.fromCharCode(65+i))??0)-p.goal.held[i]);let fits=true;for(const c of candidate)if(--rest[c.charCodeAt(0)-65]<0){fits=false;break;}if(fits){lastWord=round;return candidate;}}return null;
      }
      if(word.length>=7||wordReward(word)>=15){lastWord=round;return word;}return null;}};
}
function enrich(agent,stats){const view=c=>({...c,opponents:c.opponents.map(o=>({...o,...stats[o.name]}))});return {...agent,bid:c=>agent.bid(view(c)),word:c=>agent.word(view(c))};}
export function playTask(task,data,pools,dictionary,bag,directory){const records=[],models=data.leaders.map(b=>pools.get(b.name)),publicStats={...data.publicStats,Candidate:data.publicStats.TaylorMason};
  for(const config of task.configs){const trace=[],tracing=task.n<(task.stage==='validation'?2:1),target=makeMedianAgent(config,data,tracing?e=>trace.push(e):undefined);
    let targetRound=0;const dropRandom=seededRandom(task.seed^0x5a31b);const targetBid=target.bid;target.bid=ctx=>{const amount=targetBid(ctx);targetRound++;if(task.dropRate&&dropRandom()<task.dropRate){target.lastDecision={...target.lastDecision,amount:0,baseline:0,dropped:true};return 0;}return amount;};
    let premiumPurchases=0,premiumPaid=0;
    const selected=Array.from({length:task.field==='empirical'?5:3},(_,i)=>models[(task.n+i)%models.length]);
    const rivals=task.field==='empirical'?selected.map((m,i)=>empirical(m,task.world,task.seed,i)):[makeTaylorAgent(),makeWagsAgent(),...selected.map(m=>premiumRival(m,data.market))];
    const agents=[target,...rivals],offset=task.n%6;agents.push(...agents.splice(0,offset));const seat=agents.indexOf(target);
    const defense={pressureWins:0,pressurePaid:0,ownershipChanges:0,ownershipPayments:0,baselineAlreadyWins:0,baselineTies:0,blockedNames:{}};
    const game=simulateMatch({seed:task.seed,agents:agents.map(a=>enrich(a,publicStats)),dictionary,bag,onAuction(e){if(e.winner===seat&&'JQXZ'.includes(e.letter)){premiumPurchases++;premiumPaid+=e.paid;}const d=target.lastDecision;if(!d||d.amount!==e.bids[seat])throw new Error('Decision/bid mismatch');
      if(d.amount<=d.baseline)return;const baselineBids=[...e.bids];baselineBids[seat]=d.baseline;const alternate=settleAuction(baselineBids,'Vickrey',e.tieRanks);
      if(e.winner===seat){defense.pressureWins++;defense.pressurePaid+=e.paid;const otherTop=Math.max(0,...e.bids.filter((_,i)=>i!==seat));if(d.baseline===otherTop&&d.baseline>0)defense.baselineTies++;
        if(alternate.winner===seat)defense.baselineAlreadyWins++;else {defense.ownershipChanges++;defense.ownershipPayments+=e.paid;const name=alternate.winner===undefined?'unbought':agents[alternate.winner].name;defense.blockedNames[name]=(defense.blockedNames[name]??0)+1;}}
      if(tracing)trace.push({event:'settled-defense',round:e.round+1,letter:e.letter,baseline:d.baseline,bid:d.amount,paid:e.paid,actualWinner:e.winner===undefined?null:agents[e.winner].name,baselineWinner:alternate.winner===undefined?null:agents[alternate.winner].name});
    }});
    if(tracing){mkdirSync(join(directory,'traces'),{recursive:true});appendFileSync(join(directory,'traces',`${task.stage}-${task.field}-${task.seed}-${config.id}.jsonl`),trace.map(e=>JSON.stringify(e)).join('\n')+'\n');}
    const own=game.players[seat],others=game.players.filter((_,i)=>i!==seat),publicRivals=others.filter(p=>p.kind==='model');
    records.push({stage:task.stage,field:task.field,world:task.world,seed:task.seed,n:task.n,config:config.id,own:{...own,premiumPurchases,premiumPaid,topRival:Math.max(...others.map(p=>p.score)),topPublicRival:Math.max(...publicRivals.map(p=>p.score))},diagnostics:{...target.diagnostics},defense,...game});
  }return records;
}
