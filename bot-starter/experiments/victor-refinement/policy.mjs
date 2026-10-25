// Experimental Victor only. Imports current policies without changing them.
import {VictorMateoPolicy} from '../../src/victor.ts';
import {scoringBid,chooseScoringWord,scoringFrontier} from '../../src/scoring-v3.ts';
import {planRack,rackSize} from '../../src/planning.ts';
import {chooseWord,wordReward} from '../../src/strategy.ts';
import {contenderStrength} from '../../src/intel.ts';

export const ORIGINAL={id:'original',engine:'original'};
export const HOLD={id:'hold-only',engine:'original',holdGain:8};
export const MODERN={id:'modern-original-phase',engine:'modern',phase:'legacy',attackWeight:0.8,reserve:30,exploration:3};
export const ADAPTIVE={id:'modern-adaptive',engine:'modern',phase:'adaptive',attackWeight:1,entryCash:60,exitCash:24,reserve:12,exploration:6,entryGap:6,exitGap:18};
export const STATIC_TAYLOR={id:'static-taylor',engine:'static',style:'taylor'};
export const STATIC_WAGS={id:'static-wags',engine:'static',style:'wags'};
export const INITIAL=[ORIGINAL,HOLD,MODERN,ADAPTIVE,STATIC_TAYLOR];
export function children(parent){if(parent.engine==='original')return [6,12].map(holdGain=>({...parent,id:`${parent.id}-gain${holdGain}`,holdGain}));
  return [{...parent,id:`${parent.id}-lean`,phase:'adaptive',entryCash:45,exitCash:18,reserve:6,entryGap:6,exitGap:18},
    {...parent,id:`${parent.id}-patient`,phase:'adaptive',entryCash:75,exitCash:30,reserve:16,entryGap:6,exitGap:18}];}
export function position(ctx){const rivals=ctx.opponents.filter(o=>!o.isSimulated);
  return {ownProjected:ctx.myScore+planRack(ctx).score,rivalProjected:Math.max(0,...rivals.map(o=>{
    const word=chooseWord({myRack:o.knownRack,dictionary:ctx.dictionary});return o.score+Math.max(word?wordReward(word):0,(o.rackSize??rackSize(o.knownRack))*2.5*contenderStrength(o));})),
    rivalCash:Math.max(0,...rivals.map(o=>o.balance)),real:rivals.length>0};}
export function completionHold(ctx,word,minimumGain){
  if(!word||!ctx.auctionLetter||(ctx.remainingTiles??Infinity)<=0||(ctx.committedBid??0)<=0)return false;
  const before=planRack(ctx);if(before.words.some(w=>w.length>=7))return false;
  const myRack=new Map(ctx.myRack);myRack.set(ctx.auctionLetter,(myRack.get(ctx.auctionLetter)??0)+1);
  const gain=planRack({...ctx,myRack}).score-before.score;
  return gain>=minimumGain&&ctx.committedBid>=Math.min(9,Math.ceil(gain*0.5));
}
export function makeCandidate(config){let mode='build',transitions=0;const original=config.engine==='original'?new VictorMateoPolicy():null;
  const diagnostics={buildBids:0,defendBids:0,rebuildBids:0,everDefended:0,everRebuilt:0,transitions:0,completionHolds:0};
  function observe(){if(original){mode=original.snapshot.mode;transitions=original.snapshot.transitions;}
    diagnostics.everDefended=Math.max(diagnostics.everDefended,Number(mode==='defend'));diagnostics.everRebuilt=Math.max(diagnostics.everRebuilt,Number(mode==='rebuild'));diagnostics.transitions=transitions;}
  function update(ctx){const p=position(ctx);let next=mode;
    if(config.phase==='legacy'){
      if(mode==='defend'){if(ctx.myBalance<55||!p.real||p.ownProjected+25<p.rivalProjected)next='rebuild';}
      else if(p.real&&ctx.myScore>=30&&(ctx.myBalance>=110||ctx.myBalance>=80&&ctx.myBalance>=1.35*p.rivalCash)&&p.ownProjected+12>=p.rivalProjected)next='defend';
    }else if(config.phase==='adaptive'){
      if(mode==='defend'){if(ctx.myBalance<config.exitCash||!p.real||p.ownProjected+config.exitGap<p.rivalProjected)next='rebuild';}
      else if(p.real&&ctx.myScore>=30&&ctx.myBalance>=config.entryCash&&p.ownProjected+config.entryGap>=p.rivalProjected)next='defend';
    }
    if(next!==mode){mode=next;transitions++;}observe();return p;
  }
  const currentStyle=()=>config.engine==='static'?config.style:mode==='defend'?'taylor':'wags';
  return {name:'VictorMateo',kind:'victor',config,diagnostics,
    reset(){mode='build';transitions=0;original?.reset();for(const k of Object.keys(diagnostics))diagnostics[k]=0;},
    snapshot(){return {mode,transitions};},
    bid(ctx){if(!Number.isFinite(ctx.myBalance)||ctx.myBalance<0||!Number.isFinite(ctx.myScore))return 0;let result;
      if(original){result=original.bid(ctx);observe();}
      else {if(config.engine!=='static')update(ctx);const style=currentStyle();result=scoringBid(ctx,ctx.opponents,style,style==='taylor'?1.6:config.attackWeight??1);
        if(config.engine==='modern'&&mode==='defend'){
          const ending=ctx.remainingTiles<=8||ctx.progress>=0.88,balance=Math.max(0,Math.floor(ctx.myBalance));
          const productive=(result.ownGain??0)>=6||(result.ownPotential??0)>=8||ending&&(result.ownGain??0)>0;
          const base=productive?result.baseline:Math.min(config.exploration,result.baseline);
          const extra=Math.max(0,result.amount-result.baseline),reserve=ending?0:Math.min(config.reserve,Math.floor(balance*(config.phase==='legacy'?0.35:0.2)));
          result={...result,baseline:Math.min(base,balance-reserve),amount:Math.max(0,Math.min(balance-reserve,base+extra))};
        }
      }
      diagnostics[`${mode}Bids`]++;return result.amount;
    },
    word(ctx){if(!Number.isFinite(ctx.myBalance)||ctx.myBalance<0||!Number.isFinite(ctx.myScore))return null;let word;if(original){word=original.word(ctx);observe();}
      else {if(config.engine!=='static')update(ctx);word=chooseScoringWord(ctx,currentStyle());}
      if(config.holdGain&&completionHold(ctx,word,config.holdGain)){diagnostics.completionHolds++;return null;}return word;
    },
  };
}
