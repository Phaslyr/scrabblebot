import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeCandidate,ORIGINAL,HOLD,MODERN,ADAPTIVE,STATIC_TAYLOR,STATIC_WAGS,children,completionHold} from './policy.mjs';
import {makeVictorAgent,makeTaylorAgent,makeWagsAgent,simulateMatch} from '../../src/local-arena.ts';
import {enrich} from './arena.mjs';
const rack=s=>{const r=new Map();for(const c of s)r.set(c,(r.get(c)??0)+1);return r;};
const opponent={id:'1',name:'rival',balance:40,score:10,isSimulated:false,knownRack:rack('AT'),rackSize:2};
const ctx={myRack:rack('AT'),dictionary:['AT','QI','QUIZ','TRAINER'],myBalance:100,myScore:0,opponents:[opponent],remainingTiles:30,progress:0.2,letter:'E',auctionType:'Vickrey'};
test('original Victor and static scoring controls reproduce current factories',()=>{
  const inert={name:'idle',kind:'fixture',bid:()=>0,word:()=>null};
  for(const [config,factory] of [[ORIGINAL,makeVictorAgent],[STATIC_TAYLOR,()=>makeTaylorAgent(1.6)],[STATIC_WAGS,makeWagsAgent]])for(const seed of [21,107]){
    const expected={...factory(),name:'VictorMateo',kind:'victor'},options={seed,dictionary:['AT','AX','TAX','QI','QUIZ','TAXI','TAXIS'],bag:[...'ATAXTAXAXTQUIZATIS'],startingRackSize:2};
    assert.deepEqual(simulateMatch({...options,agents:[makeCandidate(config),inert]}),simulateMatch({...options,agents:[expected,inert]}));
  }
});
test('current-auction hold protects completion ingredients without withholding long words or unbought final tiles',()=>{
  const c={...ctx,myRack:rack('QUI'),auctionLetter:'Z',committedBid:9};
  assert.equal(completionHold(c,'QI',8),true);assert.equal(completionHold({...c,committedBid:0},'QI',8),false);
  assert.equal(completionHold({...c,committedBid:2},'QI',8),false);assert.equal(completionHold({...c,remainingTiles:0},'QI',8),false);
  assert.equal(completionHold({...c,myRack:rack('TRAINER')},'TRAINER',8),false);
});
test('adaptive phase needs earned points and position, supports rebuilding, and resets',()=>{
  const bot=makeCandidate(ADAPTIVE);bot.bid({...ctx,myBalance:150});assert.equal(bot.snapshot().mode,'build');
  bot.bid({...ctx,myScore:40,myBalance:65});assert.equal(bot.snapshot().mode,'defend');
  bot.bid({...ctx,myScore:40,myBalance:23});assert.equal(bot.snapshot().mode,'rebuild');
  bot.bid({...ctx,myScore:40,myBalance:60,opponents:[{...opponent,score:120}]});assert.equal(bot.snapshot().mode,'rebuild');
  bot.reset();assert.equal(bot.snapshot().mode,'build');assert.equal(bot.snapshot().transitions,0);assert.equal(bot.diagnostics.everDefended,0);
});
test('a large unseen rival rack prevents a false defensive lead',()=>{
  const bot=makeCandidate(ADAPTIVE);bot.bid({...ctx,myScore:35,myBalance:80,opponents:[{...opponent,knownRack:rack(''),rackSize:25}]});assert.equal(bot.snapshot().mode,'build');
});
test('all candidates keep budgets and final-auction behavior valid',()=>{
  for(const config of [ORIGINAL,HOLD,MODERN,ADAPTIVE,...children(MODERN),...children(HOLD)])for(const cash of [0,1,4,20,65,120,NaN,-1]){
    const bot=makeCandidate(config),amount=bot.bid({...ctx,myBalance:cash,myScore:40});assert.ok(Number.isSafeInteger(amount)&&amount>=0);
    if(Number.isFinite(cash)&&cash>=0)assert.ok(amount<=Math.floor(cash));
    assert.equal(bot.bid({...ctx,myBalance:Math.max(0,cash)||0,remainingTiles:0}),0);
  }
});
test('leader enrichment supplies public statistics without supplying private letters',()=>{
  const agent={name:'test',kind:'fixture',bid:c=>{assert.equal(c.opponents[0].matchesPlayed,500);assert.deepEqual(c.opponents[0].knownRack,rack('AT'));return 0;},word:()=>null};
  enrich(agent,{rival:{matchesPlayed:500,wins:150,rating:1500}}).bid(ctx);
});
