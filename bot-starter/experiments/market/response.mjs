// Offline wrappers; current online policy implementations stay untouched.
import {scoringBid,chooseScoringWord,scoringFrontier,SCORING_SETTINGS} from '../../src/scoring-v3.ts';
import {VictorMateoPolicy} from '../../src/victor.ts';
import {planRack} from '../../src/planning.ts';
import {LETTER_VALUE} from '../../src/strategy.ts';
import {predictBid} from '../../src/public-opponents.ts';
import {tablePoint,directPoint,band} from './learner.mjs';

export function publicRow(ctx,models){const leaderScore=Math.max(ctx.myScore,...ctx.opponents.map(o=>o.score));
  return {letter:ctx.letter,progress:ctx.progress,rivals:ctx.opponents.filter(o=>!o.isSimulated).map(o=>({
    botId:models.nameToId[o.name],name:o.name,balance:o.balance,score:o.score,rackSize:o.rackSize??[...o.knownRack.values()].reduce((a,b)=>a+b,0),
    knownCopies:o.knownRack.get(ctx.letter)??0,knownSize:[...o.knownRack.values()].reduce((a,b)=>a+b,0),
    knownValue:[...o.knownRack].reduce((s,[c,n])=>s+n*(LETTER_VALUE[c]??0),0),leaderScore}))};}
export function forecast(models,mode,ctx){const row=publicRow(ctx,models);
  if(mode==='simple')return band(tablePoint(models.table,row),models.simpleCalibration);
  if(mode==='direct')return band(directPoint(models.direct,row),models.directCalibration);
  if(mode==='style')return band(Math.max(0,...row.rivals.map(s=>{const item=models.oldModels.identity[s.botId],fit=item?item[item.selected]:models.oldModels.pooled;
    return predictBid(fit,{...s,letter:row.letter,progress:row.progress,firstPrice:ctx.auctionType==='FirstPrice'});})),models.styleCalibration);
}
export function responseBid(ctx,base,style,mode,price,phase='build'){
  if((ctx.remainingTiles??Infinity)<=0)return 0;
  if(mode==='control'||base.amount<=0)return base.amount;
  const worth=Math.max(base.ownGain??0,base.ownPotential??0);if(worth<12)return base.amount;
  const balance=Math.floor(ctx.myBalance),ending=(ctx.remainingTiles??Infinity)<=8||(ctx.progress??0)>=0.88;
  const s=style==='victor'?(phase==='defend'?{fraction:0.45,reserve:30,ratio:0.35}:{fraction:0.75,reserve:4,ratio:0.15}):{...SCORING_SETTINGS[style],ratio:0.15};
  const reserve=ending?0:Math.min(s.reserve,Math.floor(balance*s.ratio));
  const fraction=ending?(style==='taylor'||style==='victor'&&phase==='defend'?0.8:0.95):Math.min(0.95,s.fraction+0.1);
  const ceiling=Math.min(balance-reserve,Math.floor(balance*fraction),Math.ceil(worth*1.1+2+Math.min(3,base.leaderBias??0)));
  const cap=Math.max(base.amount,Math.min(base.amount+4,ceiling));if(mode==='blind')return cap;
  if(!price)return base.amount;const need=Math.floor(price.point)+1;
  return need>base.amount&&need<=cap?need:base.amount;
}
export function extendHold(ctx,word,style,mode,price){
  if(mode==='control'||!word||(ctx.committedBid??0)<1||(ctx.remainingTiles??Infinity)<=0||!ctx.auctionLetter)return false;
  const plan=c=>style==='victor'?planRack(c):scoringFrontier(c).base,before=plan(ctx);
  if(before.words.some(w=>w.length>=7))return false;
  const myRack=new Map(ctx.myRack);myRack.set(ctx.auctionLetter,(myRack.get(ctx.auctionLetter)??0)+1);
  if(plan({...ctx,myRack}).score-before.score<8)return false;
  return mode==='blind'||!!price&&price.point<ctx.committedBid-1;
}
export function makeResponseAgent(style,mode,models){
  const victor=style==='victor'?new VictorMateoPolicy():null;
  const diagnostics={bidRaises:0,extraBidCoins:0,holdExtensions:0,buildBids:0,defendBids:0,rebuildBids:0,everDefended:0,everRebuilt:0,transitions:0};
  let opening,price;
  const observe=()=>{if(!victor)return;const s=victor.snapshot;diagnostics.everDefended=Math.max(diagnostics.everDefended,Number(s.mode==='defend'));
    diagnostics.everRebuilt=Math.max(diagnostics.everRebuilt,Number(s.mode==='rebuild'));diagnostics.transitions=s.transitions;};
  return {name:{wags:'Wags',taylor:'TaylorMason',victor:'VictorMateo'}[style],kind:style,diagnostics,
    reset(){victor?.reset();opening=undefined;price=undefined;for(const k of Object.keys(diagnostics))diagnostics[k]=0;},
    bid(ctx){opening=ctx.progress;price=['simple','style','direct'].includes(mode)?forecast(models,mode,ctx):undefined;
      const base=victor?victor.bid(ctx):scoringBid(ctx,ctx.opponents,style,style==='wags'?1:1.6);observe();
      if(victor)diagnostics[`${victor.snapshot.mode}Bids`]++;
      const amount=responseBid(ctx,base,style,mode,price,victor?.snapshot.mode);
      if(amount>base.amount){diagnostics.bidRaises++;diagnostics.extraBidCoins+=amount-base.amount;}return amount;},
    word(ctx){const word=victor?victor.word(ctx):chooseScoringWord(ctx,style);observe();
      if(opening===ctx.progress&&extendHold(ctx,word,style,mode,price)){diagnostics.holdExtensions++;return null;}return word;},
    snapshot:()=>victor?.snapshot,
  };
}
