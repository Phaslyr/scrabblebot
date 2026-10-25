import assert from 'node:assert/strict';
import {test} from 'node:test';
import {availability,valueFrontier,valueWord,TILE_COUNTS,removeWord} from '../../src/value-planning.ts';
import {makeValueAgent,VALUE_CONTROL,VALUE_VARIANTS} from '../../src/value-agent.ts';
import {makeTaylorAgent,simulateMatch as originalArena} from '../../src/local-arena.ts';
import {simulateMatch} from './arena-core.ts';
const rack=text=>{const r=new Map();for(const c of text)r.set(c,(r.get(c)??0)+1);return r;};
const market={letters:{},cells:{},fallback:{paid:10,top:13}};
const knowledge=initial=>({initialRack:rack(initial),seen:new Map(),hiddenInitial:25,round:1,lastWordRound:0});
const opponent={id:'1',name:'rival',balance:100,score:0,isSimulated:false,knownRack:rack(''),rackSize:5};
const context={myRack:rack('VIZORE'),publicKnownRack:rack(''),dictionary:['VIREO','VIZORED','REVOICE','QI','QUIZ','AT'],myBalance:100,myScore:0,progress:0.1,remainingTiles:60,auctionType:'Vickrey',opponents:[opponent],letter:'D'};
test('opportunity probabilities match exact small populations and physical tile counts',()=>{
  assert.equal(TILE_COUNTS.reduce((a,b)=>a+b,0),98);assert.equal(TILE_COUNTS[16],1);assert.equal(TILE_COUNTS[25],1);
  assert.ok(Math.abs(availability(10,1,5,1)-0.5)<1e-10);assert.ok(Math.abs(availability(10,2,2,2)-1/45)<1e-10);
  assert.equal(availability(10,1,9,2),0);assert.equal(availability(10,2,10,2),1);
});
test('goals value premium payout and reject unavailable missing letters',()=>{
  const k=knowledge('VIZOR'),f=valueFrontier(context,k,market);assert.equal(f.goal.word,'VIZORED');assert.ok(f.goal.reward>f.base.score);assert.ok(f.goal.cost>0);
  k.seen.set('D',4);const gone=valueFrontier({...context,dictionary:['VIREO','VIZORED']},k,market);assert.equal(gone.goal,undefined);
});
test('a fundable six-letter goal can beat an unaffordable seven-letter target',()=>{
  const c={...context,myRack:rack('QUIET'),dictionary:['QUIET','QUIETS','QUIETUS'],myBalance:35};
  const f=valueFrontier(c,knowledge('QUIET'),{...market,letters:{U:{paid:100,top:100}}});assert.equal(f.goal.word,'QUIETS');assert.equal(f.goal.missing,1);
});
test('endgame cannot reserve goals requiring more future tiles than remain',()=>{
  const f=valueFrontier({...context,remainingTiles:0},knowledge('VIZOR'),market);assert.equal(f.goal,undefined);
  assert.equal(valueWord({...context,remainingTiles:0},knowledge('VIZOR'),market).word,'VIREO');
});
test('current-auction completion is preserved when the committed bid supports it',()=>{
  const c={...context,myRack:rack('QUI'),dictionary:['QI','QUIZ'],auctionLetter:'Z',committedBid:20};
  assert.equal(valueWord(c,knowledge('QUI'),market).reason,'committed-completion');
  assert.equal(valueWord({...c,remainingTiles:0},knowledge('QUI'),market).word,'QI');
});
test('holding expires and word consumption cannot invent tiles',()=>{
  const k={...knowledge('VIZOR'),round:12,lastWordRound:0};assert.equal(valueWord(context,k,market).reason,'hold-expired');
  assert.throws(()=>removeWord(rack('AT'),'TAX'));assert.equal([...removeWord(rack('TAXAT'),'TAX').values()].reduce((a,b)=>a+b,0),2);
});
test('new policies stay affordable, integral, and skip the last unplayable tile',()=>{
  for(const cfg of VALUE_VARIANTS)for(const balance of [0,1,4,12,35,100]){const agent=makeValueAgent(cfg,market);const bid=agent.bid({...context,myBalance:balance});assert.ok(Number.isSafeInteger(bid)&&bid>=0&&bid<=balance);
    assert.equal(agent.bid({...context,myBalance:balance,progress:1,remainingTiles:0}),0);}
});
test('the instrumented arena and unchanged control reproduce existing results',()=>{
  const idle={name:'idle',kind:'fixture',bid:()=>0,word:()=>null};
  for(const seed of [13,79,142]){const options={seed,dictionary:['AT','AX','TAX','QI','QUIZ','TAXI'],bag:[...'ATAXTAXAXTQUIZATIS'],startingRackSize:2};
    const old=makeTaylorAgent(1.6);old.name='Candidate';const expected=originalArena({...options,agents:[old,idle]});let auctions=0;
    const actual=simulateMatch({...options,agents:[makeValueAgent(VALUE_CONTROL,market),idle],onAuction(){auctions++;}});assert.deepEqual(actual,expected);assert.equal(auctions,actual.auctions);}
});
test('tracing is observational and reset erases match-specific knowledge',()=>{
  const cfg=VALUE_VARIANTS.at(-1),trace=[];const idle={name:'idle',kind:'fixture',bid:()=>0,word:()=>null};
  const options={seed:83,dictionary:['AT','AX','TAX','QI','QUIZ','TAXI'],bag:[...'ATAXTAXAXTQUIZATIS'],startingRackSize:2};
  const logged=makeValueAgent(cfg,market,e=>trace.push(e));const result=simulateMatch({...options,agents:[logged,idle]});assert.deepEqual(result,simulateMatch({...options,agents:[makeValueAgent(cfg,market),idle]}));
  assert.deepEqual(result,simulateMatch({...options,agents:[logged,idle]}));assert.ok(trace.some(e=>e.event==='bid'&&typeof e.rack==='string'&&Array.isArray(e.alternatives)));
});
