import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeResponseAgent,responseBid,extendHold,publicRow} from './response.mjs';
import {makeWagsAgent,makeTaylorAgent,makeVictorAgent,simulateMatch} from '../../src/local-arena.ts';
const rack=text=>{const m=new Map();for(const c of text)m.set(c,(m.get(c)??0)+1);return m;};
test('all three controls exactly reproduce their current factories across repeated games',()=>{
  const inert={name:'idle',kind:'fixture',bid:()=>0,word:()=>null};
  for(const [style,factory] of [['wags',makeWagsAgent],['taylor',()=>makeTaylorAgent(1.6)],['victor',makeVictorAgent]]){
    const experiment=makeResponseAgent(style,'control',{}),original=factory();
    for(const seed of [25,191,512]){const options={seed,dictionary:['AT','AX','TAX','QUIZ','QI','TAXI','TAXIS','SAT','SIT'],bag:[...'ATAXTAXAXTQUIZATIS'],startingRackSize:2};
      assert.deepEqual(simulateMatch({...options,agents:[experiment,inert]}),simulateMatch({...options,agents:[original,inert]}));}
  }
});
test('Victor retains his larger reserve in defense and resets every game',()=>{
  const base={amount:13,ownGain:40},ctx={myBalance:30,remainingTiles:30,progress:0.2};
  assert.equal(responseBid(ctx,base,'victor','blind',null,'defend'),16);
  assert.equal(responseBid(ctx,base,'victor','blind',null,'build'),17);
  const bot=makeResponseAgent('victor','control',{}),rich={...ctx,myBalance:120,myScore:35,myRack:rack('TAX'),dictionary:['TAX','AT'],letter:'I',opponents:[{id:'1',name:'rival',isSimulated:false,balance:20,score:0,knownRack:rack('AT'),rackSize:2}]};
  bot.bid(rich);assert.equal(bot.snapshot().mode,'defend');assert.equal(bot.diagnostics.everDefended,1);
  bot.reset();assert.equal(bot.snapshot().mode,'build');assert.equal(bot.diagnostics.everDefended,0);assert.equal(bot.snapshot().transitions,0);
});
test('predictions cannot buy unproductive, excessive, or final tiles',()=>{
  for(const style of ['wags','taylor','victor']){
    const ctx={myBalance:20,remainingTiles:30,progress:0.1},base={amount:10,ownGain:0};
    assert.equal(responseBid(ctx,base,style,'direct',{point:11}),10);
    assert.equal(responseBid(ctx,{...base,ownGain:30},style,'direct',{point:90}),10);
    assert.equal(responseBid({...ctx,remainingTiles:0},base,style,'blind'),0);
    const bid=responseBid(ctx,{...base,ownGain:30},style,'blind');assert.ok(bid>=10&&bid<=14&&bid<=20);
  }
});
test('public features use observed rack counts and rival identity, excluding own private information',()=>{
  const ctx={letter:'Z',progress:0.1,myScore:20,myBalance:999,myRack:rack('ZZZZ'),opponents:[{name:'rival',balance:40,score:5,knownRack:rack('QI'),rackSize:7,isSimulated:false}]};
  const row=publicRow(ctx,{nameToId:{rival:22}});assert.equal(row.rivals[0].botId,22);assert.equal(row.rivals[0].knownSize,2);assert.equal(row.rivals[0].rackSize,7);assert.equal(row.rivals[0].knownCopies,0);
  assert.deepEqual(publicRow({...ctx,myBalance:1,myRack:rack('A')},{nameToId:{rival:22}}),row);
});
test('holding requires an affordable submitted bid and never withholds an available long word',()=>{
  const ctx={myRack:rack('QUI'),dictionary:['QI','QUIZ'],myBalance:12,auctionLetter:'Z',committedBid:7,remainingTiles:30};
  for(const style of ['wags','taylor','victor']){
    assert.equal(extendHold(ctx,'QI',style,'direct',{point:3}),true);
    assert.equal(extendHold({...ctx,committedBid:0},'QI',style,'blind'),false);
    assert.equal(extendHold({...ctx,remainingTiles:0},'QI',style,'blind'),false);
    assert.equal(extendHold({...ctx,myRack:rack('TRAINER'),dictionary:['TRAINER','TRAINERS'],auctionLetter:'S'},'TRAINER',style,'blind'),false);
  }
});
