// Exploratory median-price follow-up; hard cash/value ceilings are unchanged.
import {predictBid} from "../../src/public-opponents.ts";
import {scoringBid,chooseScoringWord,scoringFrontier,SCORING_SETTINGS} from "../../src/scoring-v3.ts";
import {marketPrice} from "./market.mjs";

export function marketForecast(models,kind,ctx){
  const key=kind==="simple"?models.simpleKind:"identity-features",band=models.bands[key];
  const leaderScore=Math.max(ctx.myScore,...ctx.opponents.map(o=>o.score));
  const prices=ctx.opponents.filter(o=>!o.isSimulated).map(o=>{
    const id=models.nameToId[o.name],item=models.identity[id];
    const fit=kind==="simple"||!item?models.pooled:item[item.selected];
    return predictBid(fit,{letter:ctx.letter,balance:o.balance,score:o.score,rackSize:o.rackSize??[...o.knownRack.values()].reduce((a,b)=>a+b,0),
      knownCopies:o.knownRack.get(ctx.letter)??0,progress:ctx.progress,leaderScore,firstPrice:ctx.auctionType==="FirstPrice"});
  });
  const raw=key==="market-letter"?marketPrice(models.marketBaseline,ctx.letter,ctx.progress,Math.max(0,...ctx.opponents.map(o=>o.balance))):Math.max(0,...prices);
  const point=Math.max(0,raw+band.shift),low=Math.max(0,point+band.lower),high=Math.max(low,point+band.upper);
  return {point,low,high};
}
export function guardedBid(ctx,base,style,mode,forecast){
  if((ctx.remainingTiles??Infinity)<=0)return 0;
  if(mode==="control"||base.amount<=0)return base.amount;
  const worth=Math.max(base.ownGain??0,base.ownPotential??0);
  if(worth<12)return base.amount;
  const balance=Math.floor(ctx.myBalance),s=SCORING_SETTINGS[style];
  const reserve=(ctx.remainingTiles??Infinity)<=8?0:Math.min(s.reserve,Math.floor(balance*0.15));
  const ceiling=Math.min(balance-reserve,Math.floor(balance*Math.min(0.95,s.fraction+0.1)),Math.ceil(worth*1.1+2+Math.min(3,base.leaderBias??0)));
  const cap=Math.max(base.amount,Math.min(base.amount+4,ceiling));
  if(mode==="blind")return cap;
  if(!forecast)return base.amount;
  const need=Math.floor(forecast.point)+1;
  return need>base.amount&&need<=cap?need:base.amount;
}
export function shouldExtendHold(ctx,word,mode,forecast){
  if(mode==="control"||!word||(ctx.committedBid??0)<1||(ctx.remainingTiles??Infinity)<=0||!ctx.auctionLetter)return false;
  const before=scoringFrontier(ctx);
  if(before.base.words.some(w=>w.length>=7))return false;
  const myRack=new Map(ctx.myRack);myRack.set(ctx.auctionLetter,(myRack.get(ctx.auctionLetter)??0)+1);
  const gain=scoringFrontier({...ctx,myRack}).base.score-before.base.score;
  if(gain<8)return false;
  return mode==="blind"||!!forecast&&forecast.point<ctx.committedBid-1;
}
export function makeResponseAgent(style,mode,models){
  let opening,forecast;
  const diagnostics={bidRaises:0,extraBidCoins:0,holdExtensions:0};
  const name=style==="wags"?"Wags":"TaylorMason";
  return {name,kind:style,diagnostics,reset(){opening=undefined;forecast=undefined;for(const key of Object.keys(diagnostics))diagnostics[key]=0;},
    bid(ctx){opening=ctx.progress;forecast=mode==="simple"||mode==="style"?marketForecast(models,mode,ctx):undefined;
      const base=scoringBid(ctx,ctx.opponents,style,style==="wags"?1:1.6),amount=guardedBid(ctx,base,style,mode,forecast);
      if(amount>base.amount){diagnostics.bidRaises++;diagnostics.extraBidCoins+=amount-base.amount;}return amount;},
    word(ctx){const word=chooseScoringWord(ctx,style);
      if(opening===ctx.progress&&shouldExtendHold(ctx,word,mode,forecast)){diagnostics.holdExtensions++;return null;}return word;},
  };
}
