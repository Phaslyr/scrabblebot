import assert from "node:assert/strict";
import {test} from "node:test";
import {guardedBid,shouldExtendHold,makeResponseAgent,marketForecast} from "./response-point.mjs";
import {makeWagsAgent,makeTaylorAgent,simulateMatch} from "../../src/local-arena.ts";
const rack=text=>{const r=new Map();for(const c of text)r.set(c,(r.get(c)??0)+1);return r;};
test("market forecasts exclude our own cash and use the correct calibrated price",()=>{
  const fit={family:"letter-median",letterFractions:{Z:0.5},fallbackFraction:0.3};
  const models={pooled:fit,identity:{22:{selected:"median",median:fit}},nameToId:{rival:22},simpleKind:"market-letter",
    marketBaseline:{cells:{},letters:{Z:12},fallback:10},bands:{"market-letter":{shift:-2,lower:-3,upper:5},"identity-features":{shift:1,lower:-2,upper:4}}};
  const ctx={letter:"Z",myBalance:1000,myRack:rack("QQQ"),myScore:0,progress:0.2,auctionType:"Vickrey",
    opponents:[{name:"rival",balance:20,score:0,isSimulated:false,rackSize:3,knownRack:rack("QUI")}]};
  assert.deepEqual(marketForecast(models,"simple",ctx),{point:10,low:7,high:15});
  assert.deepEqual(marketForecast(models,"style",ctx),{point:11,low:9,high:15});
});
test("forecast alone cannot justify an unwanted or unaffordable acquisition",()=>{
  const ctx={myBalance:100,remainingTiles:30},base={amount:13,ownGain:0,ownPotential:0,leaderBias:0};
  assert.equal(guardedBid(ctx,base,"wags","style",{point:14,low:13,high:15}),13);
  const valuable={...base,ownGain:30};
  assert.equal(guardedBid(ctx,valuable,"wags","style",{point:90,low:80,high:100}),13);
  assert.equal(guardedBid({...ctx,remainingTiles:0},valuable,"wags","blind"),0);
});
test("a justified response stays within the four-coin extension and actual cash",()=>{
  const ctx={myBalance:20,remainingTiles:30},base={amount:12,ownGain:33,ownPotential:20,leaderBias:0};
  assert.equal(guardedBid(ctx,base,"wags","style",{point:12,low:11,high:13}),13);
  for(const cash of [1,4,12,20,100]){const b={...base,amount:Math.min(12,cash)};const bid=guardedBid({...ctx,myBalance:cash},b,"wags","blind");assert.ok(bid<=cash&&bid<=b.amount+4&&bid>=b.amount);}
});
test("prediction can extend a low-cost completion hold, but not cash after the final award",()=>{
  const ctx={myRack:rack("QUI"),dictionary:["QI","QUIZ"],myBalance:12,auctionLetter:"Z",committedBid:7,remainingTiles:30};
  assert.equal(shouldExtendHold(ctx,"QI","style",{point:3,low:1,high:5}),true);
  assert.equal(shouldExtendHold(ctx,"QI","style",{point:9,low:8,high:12}),false);
  assert.equal(shouldExtendHold({...ctx,remainingTiles:0},"QI","blind"),false);
  assert.equal(shouldExtendHold({...ctx,committedBid:0},"QI","blind"),false);
});
test("the unchanged experimental control reproduces both current bot factories",()=>{
  const inert={name:"idle",kind:"fixture",bid:()=>0,word:()=>null};
  const common={seed:25,dictionary:["AT","AX","TAX"],bag:[..."ATAXTAXAXT"],startingRackSize:2};
  for(const [style,factory]of [["wags",makeWagsAgent],["taylor",()=>makeTaylorAgent(1.6)]]){
    const expected=simulateMatch({...common,agents:[factory(),inert]});
    const actual=simulateMatch({...common,agents:[makeResponseAgent(style,"control",{}),inert]});
    assert.deepEqual(actual,expected);
  }
});
