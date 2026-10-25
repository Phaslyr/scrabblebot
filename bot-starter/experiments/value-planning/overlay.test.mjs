import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeOverlayAgent,OVERLAY_VARIANTS} from '../../src/value-overlay.ts';
import {simulateMatch} from './arena-core.ts';
const rack=s=>{const r=new Map();for(const c of s)r.set(c,(r.get(c)??0)+1);return r;};
const market={letters:{},cells:{},fallback:{paid:10,top:13}};
const ctx={myRack:rack('QUI'),publicKnownRack:rack(''),dictionary:['QI','QUIZ','AT'],myBalance:100,myScore:0,letter:'Z',progress:.2,remainingTiles:40,auctionType:'Vickrey',opponents:[{id:'1',name:'rival',balance:80,score:10,isSimulated:false,rackSize:5,knownRack:rack('AT')}]};
test('overlays preserve baseline coverage and match the six-coin extension bound',()=>{
  for(const balance of [0,1,4,12,35,100])for(const letter of ['A','I','Z']){const c={...ctx,myBalance:balance,letter},original=makeOverlayAgent(OVERLAY_VARIANTS[0],market).bid(c);
    for(const cfg of OVERLAY_VARIANTS.slice(1)){const bid=makeOverlayAgent(cfg,market).bid(c);assert.ok(Number.isSafeInteger(bid)&&bid>=original&&bid<=original+6&&bid<=balance);}}
});
test('premium word holds require a competitive current bid and usable future award',()=>{
  const c={...ctx,myRack:rack('TRAINER'),dictionary:['TRAINER','ZTRAINER'],auctionLetter:'Z',committedBid:20};
  const cfg=OVERLAY_VARIANTS.find(c=>c.overlay==='premium-hold');
  assert.equal(makeOverlayAgent(cfg,market).word(c),null);
  assert.equal(makeOverlayAgent(cfg,market).word({...c,committedBid:2}),'TRAINER');
  assert.equal(makeOverlayAgent(cfg,market).word({...c,remainingTiles:0}),'TRAINER');
  for(const config of OVERLAY_VARIANTS)assert.equal(makeOverlayAgent(config,market).bid({...ctx,remainingTiles:0}),0);
});
test('follow-up tracing and reset preserve outcomes',()=>{
  const idle={name:'idle',kind:'fixture',bid:()=>0,word:()=>null},options={seed:48,dictionary:['AT','AX','TAX','QI','QUIZ','TAXI'],bag:[...'ATAXTAXAXTQUIZATIS'],startingRackSize:2};
  for(const cfg of OVERLAY_VARIANTS){const traces=[],agent=makeOverlayAgent(cfg,market,e=>traces.push(e));const first=simulateMatch({...options,agents:[agent,idle]});
    assert.deepEqual(first,simulateMatch({...options,agents:[makeOverlayAgent(cfg,market),idle]}));assert.deepEqual(first,simulateMatch({...options,agents:[agent,idle]}));assert.ok(traces.length>0);}
});
