import {makeMedianAgent} from '../../src/median-policy.ts';
import {seededRandom} from '../../src/local-arena.ts';
import {wordReward} from '../../src/strategy.ts';
const sets=new WeakMap();
export function playPriceTask(task,data,dictionary,pricePaths){
 const path=pricePaths[task.n],random=seededRandom(task.seed),pool=[...path.initialPool];
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 let legal=sets.get(dictionary);if(!legal){legal=new Set(dictionary);sets.set(dictionary,legal);}
 return task.configs.map(config=>{
  const agent=makeMedianAgent(config,data);let rack=new Map(),known=new Map(),balance=100,score=0,spent=0,purchases=0,premiumPurchases=0,longWords=0,longScore=0,wordLetters=0;
  const add=(r,c)=>r.set(c,(r.get(c)??0)+1);for(const c of pool.slice(0,5))add(rack,c);
  for(let i=0;i<path.auctions.length;i++){
   const a=path.auctions[i],view=()=>({myRack:new Map(rack),publicKnownRack:new Map(known),myBalance:balance,myScore:score,opponents:[],dictionary,remainingTiles:path.auctions.length-i-1,progress:i/(path.auctions.length-1),auctionType:'Vickrey'});
   const amount=agent.bid({...view(),letter:a.letter});if(!Number.isSafeInteger(amount)||amount<0||amount>balance)throw new Error('Invalid price-taking bid');
   for(let n=0;n<98;n++){const word=agent.word({...view(),auctionLetter:a.letter,committedBid:amount});if(!word)break;if(!legal.has(word))throw new Error('Invalid price-taking word');
    const use=new Map();for(const c of word)add(use,c);for(const [c,count]of use){if((rack.get(c)??0)<count)throw new Error('Unavailable price-taking tile');rack.set(c,rack.get(c)-count);known.set(c,Math.max(0,(known.get(c)??0)-count));}
    const reward=wordReward(word);score+=reward;balance+=reward;wordLetters+=word.length;if(word.length>=7){longWords++;longScore+=reward;}
   }
   if(amount>a.threshold){const paid=Math.max(1,a.threshold);if(paid>balance)throw new Error('Price-taking cash failure');balance-=paid;spent+=paid;purchases++;if('JQXZ'.includes(a.letter))premiumPurchases++;add(rack,a.letter);add(known,a.letter);}
  }
  if(balance!==100+score-spent||balance<0||wordLetters+[...rack.values()].reduce((s,n)=>s+n,0)!==5+purchases)throw new Error('Price-taking conservation failure');
  return {stage:task.stage,field:'price-taking',seed:task.seed,n:task.n,caseId:path.matchId,config:config.id,own:{score,balance,cash:balance,spent,purchases,premiumPurchases,longWords,longScore,remainingRack:[...rack].flatMap(([c,n])=>Array(n).fill(c)).sort().join('')},diagnostics:agent.diagnostics};
 });
}
