// Diagnostic shadow replay only: hypothetical actions never change the recorded
// trajectory. No counterfactual final scores or match wins are reported.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {readTable} from './archive.mjs';
import {makeOverlayAgent as makeValueAgent,OVERLAY_VARIANTS as VALUE_VARIANTS} from '../../src/value-overlay.ts';
import {rackText,removeWord} from '../../src/value-planning.ts';
import {mean} from '../market/stats.mjs';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const data=JSON.parse(readFileSync(join(directory,'opponents.json'),'utf8'));
const liveDir='runs/TaylorMason/2026-10-24T23-02-06-768Z';
const games=JSON.parse(readFileSync(join(liveDir,'results.json'),'utf8')).results.filter(g=>g.phase!=='partial');
const events=readFileSync(join(liveDir,'events.jsonl'),'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s));
const topBids=new Map(readTable(directory,'auction_top_bid_archive').map(a=>[String(a.auction_id),a.top_bid]));
const {loadDictionary}=await import('../../src/dictionary.ts');const dictionary=loadDictionary();
const diagnostic=join(directory,'diagnostics-followup');mkdirSync(diagnostic,{recursive:true});
const summaries=[];
for(const g of games){
  const ownId='69',timeline=events.filter(e=>String(e.data?.matchId)===g.matchId),delta=new Map(),required=new Map();
  for(const e of timeline){if(e.event==='auction-result'&&String(e.data.winner)===ownId)delta.set(e.data.letter,(delta.get(e.data.letter)??0)+1);
    if(e.event==='word'&&String(e.data.botId)===ownId)for(const c of e.data.word){delta.set(c,(delta.get(c)??0)-1);required.set(c,Math.max(required.get(c)??0,-delta.get(c)));}}
  const initial=new Map([...required].filter(([,n])=>n>0));assert.equal([...initial.values()].reduce((s,n)=>s+n,0),5,'Initial rack is not uniquely reconstructed');
  const states=new Map([{id:ownId,name:'TaylorMason'},...g.opponents].map(p=>[p.id,{id:p.id,name:p.name,balance:100,score:0,size:5,known:new Map()}]));
  const results=new Map(timeline.filter(e=>e.event==='auction-result').map(e=>[String(e.data.auctionId),e.data]));
  let ownRack=new Map(initial),round=0,lastWordRound=0;const seen=new Map(),traces=[],observed=[],comparisons=[];
  for(const event of timeline){const e=event.data;
    if(event.event==='word'){const s=states.get(String(e.botId));assert.ok(s);s.balance+=Number(e.reward);s.score+=Number(e.reward);s.size-=e.word.length;
      for(const c of e.word)s.known.set(c,Math.max(0,(s.known.get(c)??0)-1));assert.ok(s.size>=0);
      if(s.id===ownId){ownRack=removeWord(ownRack,e.word);lastWordRound=round;}continue;}
    if(event.event==='auction-result'){const s=states.get(String(e.winner));if(s){s.balance-=Number(e.paid);s.size++;s.known.set(e.letter,(s.known.get(e.letter)??0)+1);assert.ok(s.balance>=0);
      if(s.id===ownId)ownRack.set(e.letter,(ownRack.get(e.letter)??0)+1);}continue;}
    if(event.event!=='decision')continue;round++;const self=states.get(ownId),remaining=68-round;
    const ctx={letter:e.letter,myRack:new Map(ownRack),publicKnownRack:new Map(self.known),myBalance:self.balance,myScore:self.score,dictionary,progress:(round-1)/67,remainingTiles:remaining,auctionType:'Vickrey',
      opponents:[...states.values()].filter(s=>s.id!==ownId).map(s=>({id:s.id,name:s.name,balance:s.balance,score:s.score,rackSize:s.size,knownRack:new Map(s.known),isSimulated:false,...data.publicStats[s.name]}))};
    observed.push({round,auctionId:e.auctionId,rack:rackText(ownRack),balance:self.balance,score:self.score,remaining,recordedBid:e.amount,originalDeadlineMs:e.observedRemainingMs});
    const actual=results.get(String(e.auctionId));assert.ok(actual);const threshold=String(actual.winner)===ownId?Number(actual.paid):topBids.get(String(e.auctionId));
    for(const config of VALUE_VARIANTS){const localTrace=[],agent=makeValueAgent(config,data.market,t=>localTrace.push(t));
      agent.restore({initialRack:initial,seen,hiddenInitial:25,round:round-1,lastWordRound});
      const bid=agent.bid(ctx),word=agent.word({...ctx,auctionLetter:e.letter,committedBid:bid});
      const ownership=threshold===undefined?'unknown':bid===0?'skip':bid>threshold?'strict-price-win':bid===threshold?'tie':'strict-price-loss';
      const record={match:g.matchId,round,config:config.id,recordedBid:e.amount,shadowBid:bid,proposedWord:word,comparisonOnly:true,ownership,staleOpening:e.observedRemainingMs<0,thresholdUsedOnlyForEvaluation:threshold};
      comparisons.push({...record,goalReward:agent.lastDecision?.goal?.reward??null});for(const t of localTrace)traces.push({...record,...t});
    }
    seen.set(e.letter,(seen.get(e.letter)??0)+1);
  }
  assert.equal(round,68);assert.equal(states.get(ownId).score,g.score);assert.equal(states.get(ownId).balance,100+g.score-g.totalSpend);
  for(const p of g.opponents)assert.equal(states.get(p.id).score,p.score);
  writeFileSync(join(diagnostic,`game-${g.matchId}-observed.json`),JSON.stringify({match:g.matchId,initialRack:rackText(initial),positions:observed},null,2));
  writeFileSync(join(diagnostic,`game-${g.matchId}-shadow.jsonl`),traces.map(t=>JSON.stringify(t)).join('\n')+'\n');
  const control=comparisons.filter(c=>c.config==='current-taylor');
  summaries.push({match:g.matchId,initialRack:rackText(initial),initialRackExact:true,positions:round,scoreAudit:true,balanceAudit:true,
    unchangedBidMatches:control.filter(c=>c.recordedBid===c.shadowBid).length,staleOpenings:control.filter(c=>c.staleOpening).length,
    variants:Object.fromEntries(VALUE_VARIANTS.map(cfg=>{const rows=comparisons.filter(c=>c.config===cfg.id);return [cfg.id,{bidChanges:rows.filter(c=>c.recordedBid!==c.shadowBid).length,
      strictPriceWins:rows.filter(c=>c.ownership==='strict-price-win').length,ties:rows.filter(c=>c.ownership==='tie').length,meanGoalReward:mean(rows.filter(c=>c.goalReward!==null).map(c=>c.goalReward))}];}))});
  console.log(`Diagnostic replay audited ${g.matchId}: exact own initial rack ${rackText(initial)}, ${round} positions`);
}
const result={completedAt:new Date().toISOString(),games:summaries.length,positions:summaries.reduce((s,g)=>s+g.positions,0),summaries,
  limitations:['Only observed trajectories are replayed; hypothetical decisions are not propagated.','Historical opponent reputation rows were not logged; current public reputation is used in shadow decisions.','Archived top bids are consulted only after the decision for diagnostic ownership classification.','These eight known cases are excluded from price/opponent fitting and are not validation matches.']};
writeFileSync(join(directory,'replay-followup-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({games:result.games,positions:result.positions,bidParity:summaries.map(g=>({match:g.match,matching:g.unchangedBidMatches,total:g.positions}))},null,2));

