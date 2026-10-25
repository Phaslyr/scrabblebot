import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const live='runs/TaylorMason/2026-10-24T23-02-06-768Z';
const games=JSON.parse(readFileSync(join(live,'results.json'),'utf8')).results.filter(g=>g.phase!=='partial');
const events=readFileSync(join(live,'events.jsonl'),'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s)),rows=[];
for(const g of games){const timeline=events.filter(e=>String(e.data?.matchId)===g.matchId),decisions=timeline.filter(e=>e.event==='decision');
  const traces=readFileSync(join(directory,'diagnostics',`game-${g.matchId}-shadow.jsonl`),'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s));
  const followup=readFileSync(join(directory,'diagnostics-followup',`game-${g.matchId}-shadow.jsonl`),'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s));
  for(let i=0;i<decisions.length;i++){const decision=decisions[i],closed=timeline.find(e=>e.event==='auction-result'&&String(e.data.auctionId)===String(decision.data.auctionId));
    const actual=timeline.filter(e=>e.event==='word'&&String(e.data.botId)==='69'&&e.time>=decision.time&&e.time<closed.time).map(e=>({word:e.data.word,reward:Number(e.data.reward)}));
    const newWords=traces.filter(e=>e.round===i+1&&e.event==='word'),followWords=followup.filter(e=>e.round===i+1&&e.event==='word');
    rows.push({match:g.matchId,round:i+1,auctionLetter:decision.data.letter,originalBid:decision.data.amount,observedWordsBeforeAward:actual,
      proposals:[...newWords,...followWords].map(e=>({configuration:e.config,rack:e.rack,word:e.word,reason:e.reason,goal:e.goal?{word:e.goal.word,reward:e.goal.reward,cost:e.goal.cost,probability:e.goal.probability,utility:e.goal.utility}:null,alternatives:e.alternatives??null}))});
  }
}
writeFileSync(join(directory,'diagnostic-choices.json'),JSON.stringify({cases:rows,limitations:'Observed words include only plays before the current award. Proposals are independent shadow decisions and are never scored as hypothetical completed games.'},null,2));
console.log(JSON.stringify({positions:rows.length,observedCashWindows:rows.filter(r=>r.observedWordsBeforeAward.length).length,initialCases:rows.filter(r=>r.round===1).map(r=>({match:r.match,rack:r.proposals[0]?.rack,actual:r.observedWordsBeforeAward,proposals:r.proposals.filter(p=>['goals-only','premium-joint'].includes(p.configuration))}))},null,2));
