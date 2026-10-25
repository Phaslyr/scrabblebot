import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeMedianAgent,MEDIAN_VARIANTS,MEDIAN_CENTER,medianFrontier} from '../../src/median-policy.ts';
import {decideTaylorBid,chooseTaylorWord} from '../../src/taylor.ts';
import {loadDictionary} from '../../src/dictionary.ts';
import {prepareDictionary} from '../../src/strategy.ts';
import {simulateMatch,makeTaylorAgent} from '../../src/local-arena.ts';
const rack=s=>new Map([...new Set(s)].map(c=>[c,[...s].filter(x=>x===c).length]));
const market={letters:{Q:{paid:30,top:40},U:{paid:10,top:15}},cells:{},fallback:{paid:12,top:18}},model={market,median:{payout:45,cashOut:10}};
const ctx={myRack:rack('PERIE'),publicKnownRack:new Map(),dictionary:['PERIQUE'],myBalance:100,myScore:0,remainingTiles:40,progress:.3,letter:'Q',auctionType:'Vickrey',opponents:[]};
test('the control remains exactly the stopped v4 policy',()=>{
 const a=makeMedianAgent(MEDIAN_VARIANTS[0],model);assert.equal(a.bid(ctx),decideTaylorBid(ctx).amount);assert.equal(a.word(ctx),chooseTaylorWord(ctx));assert.equal(a.lastDecision.amount,a.lastDecision.baseline);
 const dictionary=['AT','AX','QI','QUIZ','PERIQUE'];const options={seed:144,agents:[makeTaylorAgent(),{name:'Idle',kind:'fixture',bid:()=>2,word:()=>null}],dictionary,bag:[...'PERIEQUZATAXIERONSTULIPQERETAIN']};
 const expected=simulateMatch(options);const actual=simulateMatch({...options,agents:[makeMedianAgent(MEDIAN_VARIANTS[0],model),options.agents[1]]});assert.deepEqual(actual.players.map(({name,...p})=>p),expected.players.map(({name,...p})=>p));
});
test('a useful scarce tile can receive a market-competitive own-value bid',()=>{
 const a=makeMedianAgent(MEDIAN_CENTER,model),old=decideTaylorBid(ctx).amount,bid=a.bid(ctx);assert.ok(bid>old);assert.ok(bid>=40);assert.equal(a.lastDecision.threat,0);assert.equal(a.lastDecision.weight,0);assert.equal(bid,a.lastDecision.baseline);
});
test('observed exhausted scarce letters cannot remain future word goals',()=>{
 const k={initialRack:rack('PERIE'),seen:rack('Q'),hiddenInitial:25,round:1,lastWordRound:0};assert.equal(medianFrontier(ctx,k,model,45).goal,undefined);
 const after=medianFrontier({...ctx,myRack:rack('PERIEQ')},k,model,45);assert.equal(after.goal?.word,'PERIQUE');assert.deepEqual(after.goal?.missingLetters,['U']);
});
test('configurations stay affordable and skip the unusable last award',()=>{
 for(const config of MEDIAN_VARIANTS)for(const balance of [NaN,-1,0,1,4,12,100,100.5])for(const auctionType of ['Vickrey','FirstPrice']){
  const a=makeMedianAgent(config,model),bid=a.bid({...ctx,myBalance:balance,auctionType});assert.ok(Number.isSafeInteger(bid)&&bid>=0);if(Number.isFinite(balance)&&balance>=0)assert.ok(bid<=Math.floor(balance));
  a.reset();assert.equal(a.bid({...ctx,myBalance:balance,remainingTiles:0,auctionType}),0);
 }
});
test('rival identities, scores and hidden information do not affect purchases',()=>{
 for(const config of MEDIAN_VARIANTS){const a=makeMedianAgent(config,model),b=makeMedianAgent(config,model);assert.equal(a.bid(ctx),b.bid({...ctx,opponents:[{id:'x',name:'leader',score:10000,balance:1000,knownRack:rack('QUI'),rackSize:8}]}));}
});
test('reset and observational tracing do not change decisions or carry knowledge',()=>{
 const trace=[],a=makeMedianAgent(MEDIAN_CENTER,model),b=makeMedianAgent(MEDIAN_CENTER,model,e=>trace.push(e));assert.equal(a.bid(ctx),b.bid(ctx));a.reset();assert.equal(a.bid(ctx),b.lastDecision.amount);assert.ok(trace.length);
 const d=a.lastDecision;const actual=a.word({...ctx,auctionLetter:'Q',committedBid:d.amount});assert.equal(actual,d.expectedWords[0]??null);assert.equal(a.diagnostics.forecastMismatches,0);
});
test('full-dictionary candidate calculations fit the one-second auction window',t=>{
 const dictionary=loadDictionary();prepareDictionary(dictionary);const a=makeMedianAgent(MEDIAN_CENTER,model),start=performance.now();a.bid({...ctx,dictionary,myRack:rack('AEINORSTCLUMPDB'),letter:'H'});const elapsed=performance.now()-start;t.diagnostic(`cold crowded-rack median bid: ${elapsed.toFixed(1)} ms`);assert.ok(elapsed<700);
});
