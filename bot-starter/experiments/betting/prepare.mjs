import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {fitBid,predictBid,evaluateBid,quantile} from "../../src/public-opponents.ts";
import {marketKey,marketPrice} from "./market.mjs";

const {directory}=JSON.parse(readFileSync("experiments/betting/latest.json","utf8"));
const manifest=JSON.parse(readFileSync(join(directory,"manifest.json"),"utf8"));
const table=name=>{const p=JSON.parse(readFileSync(join(directory,"data",`${name}.json`),"utf8"))[0],keys=p.schema.elements.map(f=>f.name.some);return p.rows.map(row=>Object.fromEntries(keys.map((k,i)=>[k,row[i]])));};
const group=(rows,key)=>{const m=new Map();for(const r of rows){if(!m.has(r[key]))m.set(r[key],[]);m.get(r[key]).push(r);}return m;};
const time=t=>Number(t[0]),some=v=>v[0]===0?v[1]:undefined;
const bots=new Map(table("bot").map(b=>[b.id,b])),stats=table("bot_stats"),versions=table("bot_version");
const cutoff=new Map([...bots.keys()].map(id=>[id,Math.max(0,...versions.filter(v=>v.bot_id===id).map(v=>time(v.started_at)))]));
const matchIds=new Set(manifest.matchIds),matches=table("match_state").filter(m=>matchIds.has(m.id)).sort((a,b)=>a.id-b.id);
const rosters=group(table("match_participant"),"match_id"),auctions=group(table("auction_result"),"match_id"),plays=group(table("word_play"),"match_id");
const tops=new Map(table("auction_top_bid_archive").map(r=>[r.auction_id,r.top_bid]));
const trainEnd=matches[Math.floor(matches.length*0.6)-1].id,calEnd=matches[Math.floor(matches.length*0.8)-1].id;
const partition=id=>id<=trainEnd?"train":id<=calEnd?"calibration":"test";
const frames=[],samples=[],audit={valid:0,excluded:[],lateWinningBids:0,missingTop:0};
for(const match of matches){
  const roster=rosters.get(match.id)??[],rounds=[...(auctions.get(match.id)??[])].sort((a,b)=>time(a.closed_at)-time(b.closed_at)||a.auction_id-b.auction_id);
  const words=[...(plays.get(match.id)??[])].sort((a,b)=>time(a.played_at)-time(b.played_at)||a.id-b.id);
  const ledger=new Map(roster.map(p=>[p.bot_id,{balance:100,score:0,size:match.starting_rack_size,known:new Map(),invalid:false}]));
  const localFrames=[],localSamples=[];let wi=0;
  function apply(at,inclusive){while(wi<words.length&&(time(words[wi].played_at)<at||inclusive&&time(words[wi].played_at)===at)){
    const w=words[wi++],s=ledger.get(w.bot_id);if(!s)continue;s.balance+=w.total_reward;s.score+=w.total_reward;s.size-=w.word.length;
    if(s.size<0)s.invalid=true;for(const letter of w.word)s.known.set(letter,Math.max(0,(s.known.get(letter)??0)-1));}}
  let open=some(match.started_at)?.[0]??time(match.created_at);
  for(let i=0;i<rounds.length;i++){
    const a=rounds[i];apply(open,true);
    const winner=some(a.winner_bot_id),top=tops.get(a.auction_id)??(match.auction_type[0]===0?a.paid:undefined);
    const highest=Math.max(0,...[...ledger.values()].map(s=>s.score));
    const states=roster.map(p=>{const s=ledger.get(p.bot_id),bot=bots.get(p.bot_id);
      return {botId:p.bot_id,name:bot?.name??String(p.bot_id),real:bot?!bot.is_simulated:false,
        current:time(match.created_at)>=(cutoff.get(p.bot_id)??Infinity),matchId:match.id,letter:a.letter,balance:s.balance,score:s.score,
        rackSize:s.size,knownCopies:s.known.get(a.letter)??0,progress:i/Math.max(1,rounds.length-1),leaderScore:highest,firstPrice:match.auction_type[0]===0};});
    for(const s of states){if(!s.real||!s.current)continue;
      const won=winner===s.botId;
      if(won&&top!==undefined){localSamples.push({...s,won:true,kind:"exact",amount:top});if(top>s.balance)audit.lateWinningBids++;}
      else if(winner===undefined)localSamples.push({...s,won:false,kind:"exact",amount:0});
      else {const upper=s.firstPrice?top:a.paid;if(upper!==undefined&&upper<s.balance)localSamples.push({...s,won:false,kind:"upper",amount:upper});}
    }
    if(states.every(s=>s.real)&&match.auction_type[0]===1){
      if(top!==undefined||winner===undefined)localFrames.push({matchId:match.id,auctionId:a.auction_id,winner,top:top??0,paid:a.paid,states});
      else audit.missingTop++;
    }
    const close=time(a.closed_at);apply(close,false);
    const win=ledger.get(winner);if(win){win.balance-=a.paid;win.size++;win.known.set(a.letter,(win.known.get(a.letter)??0)+1);if(win.balance<0)win.invalid=true;}
    apply(close,true);open=close;
  }
  apply(Infinity,true);
  const valid=rounds.length&&roster.length&&roster.every(p=>{const s=ledger.get(p.bot_id);return !s.invalid&&s.balance===p.balance&&s.score===p.score;});
  if(!valid){audit.excluded.push(match.id);continue;}audit.valid++;frames.push(...localFrames);samples.push(...localSamples);
}
const byBot=group(samples,"botId"),byPart=part=>samples.filter(s=>partition(s.matchId)===part);
const leaders=stats.filter(s=>bots.has(s.bot_id)&&!bots.get(s.bot_id).is_simulated&&s.matches_played>=50)
  .map(s=>({...s,name:bots.get(s.bot_id).name,counts:Object.fromEntries(["train","calibration","test"].map(p=>[p,new Set((byBot.get(s.bot_id)??[]).filter(r=>partition(r.matchId)===p).map(r=>r.matchId)).size]))}))
  .filter(s=>s.counts.train>=25&&s.counts.calibration>=10&&s.counts.test>=10).sort((a,b)=>b.wins/b.matches_played-a.wins/a.matches_played).slice(0,5);
if(leaders.length<5)throw new Error("Five current-version leaders with chronological history required.");
const chosen=new Set(leaders.map(b=>b.bot_id));
const training=byPart("train"),calibration=byPart("calibration"),test=byPart("test");
console.log(`Audited ${audit.valid} games. Fitting on ${training.length} public bid observations; ${test.length} newer test observations.`);
const pooled=fitBid(training,"letter-median"),identity={},families=[];
for(const [id,rows]of byBot){
  const train=rows.filter(s=>partition(s.matchId)==="train"),cal=rows.filter(s=>partition(s.matchId)==="calibration");
  if(new Set(train.map(s=>s.matchId)).size<25||cal.length<100)continue;
  const median=fitBid(train,"letter-median"),linear=fitBid(train,"censored-linear");
  const lossMedian=evaluateBid(median,cal).selectionLoss,lossLinear=evaluateBid(linear,cal).selectionLoss;
  identity[id]={name:bots.get(id)?.name??String(id),median,linear,selected:lossLinear<lossMedian?"linear":"median"};
  families.push({name:identity[id].name,trainGames:new Set(train.map(s=>s.matchId)).size,calGames:new Set(cal.map(s=>s.matchId)).size,lossMedian,lossLinear,selected:identity[id].selected});
  console.log(`Fit ${identity[id].name}: ${identity[id].selected}`);
}
const variants=["pooled","identity-median","identity-features"];
function forecast(kind,s){const item=identity[s.botId];const model=kind==="pooled"||!item?pooled:kind==="identity-median"?item.median:item[item.selected];return predictBid(model,s);}
const market={train:[],calibration:[],test:[]};
for(const frame of frames){for(const own of frame.states){if(!chosen.has(own.botId)||!own.current)continue;
  const rivals=frame.states.filter(s=>s.botId!==own.botId),predictions=Object.fromEntries(variants.map(kind=>[kind,Math.max(0,...rivals.map(s=>forecast(kind,s)))]));
  let low,high;
  if(frame.winner===undefined)low=high=0;
  else if(frame.winner===own.botId){high=frame.paid;low=frame.paid<=1?0:frame.paid;}
  else low=high=frame.top;
  market[partition(frame.matchId)].push({matchId:frame.matchId,botId:own.botId,letter:own.letter,progress:own.progress,rivalCash:Math.max(0,...rivals.map(s=>s.balance)),low,high,predictions});
}}
const priceGroups=new Map(),letterGroups=new Map();
for(const row of market.train){const key=marketKey(row.letter,row.progress,row.rivalCash),amount=(row.low+row.high)/2;
  if(!priceGroups.has(key))priceGroups.set(key,[]);priceGroups.get(key).push(amount);
  if(!letterGroups.has(row.letter))letterGroups.set(row.letter,[]);letterGroups.get(row.letter).push(amount);}
const marketBaseline={cells:Object.fromEntries([...priceGroups].filter(([,values])=>values.length>=50).map(([key,values])=>[key,quantile(values,0.5)])),
  letters:Object.fromEntries([...letterGroups].map(([key,values])=>[key,quantile(values,0.5)])),fallback:quantile(market.train.map(row=>(row.low+row.high)/2),0.5)};
variants.push("market-letter");
for(const rows of Object.values(market))for(const row of rows)row.predictions["market-letter"]=marketPrice(marketBaseline,row.letter,row.progress,row.rivalCash);
const bands={};
for(const kind of variants){const rows=market.calibration,shift=quantile(rows.map(r=>(r.low+r.high)/2-r.predictions[kind]),0.5);
  bands[kind]={shift,lower:quantile(rows.map(r=>r.low-Math.max(0,r.predictions[kind]+shift)),0.1),upper:quantile(rows.map(r=>r.high-Math.max(0,r.predictions[kind]+shift)),0.9)};}
const mean=a=>a.reduce((s,n)=>s+n,0)/Math.max(1,a.length);
const interval=a=>{const m=mean(a),v=a.reduce((s,n)=>s+(n-m)**2,0)/Math.max(1,a.length-1),d=a.length>1?1.96*Math.sqrt(v/a.length):null;return {mean:m,interval95:d===null?null:[m-d,m+d],independentGames:a.length};};
const fieldMetrics={};const errorsByGame={};
for(const kind of variants){const b=bands[kind],groups=new Map();let covered=0,width=0;
  for(const r of market.test){const point=Math.max(0,r.predictions[kind]+b.shift),lo=Math.max(0,point+b.lower),hi=Math.max(lo,point+b.upper);
    const error=Math.max(0,r.low-point,point-r.high);if(!groups.has(r.matchId))groups.set(r.matchId,[]);groups.get(r.matchId).push(error);
    if(lo<=r.low&&hi>=r.high)covered++;width+=hi-lo;}
  errorsByGame[kind]=new Map([...groups].map(([id,values])=>[id,mean(values)]));
  fieldMetrics[kind]={intervalMAE:mean([...errorsByGame[kind].values()]),coverage:covered/Math.max(1,market.test.length),meanBandWidth:width/Math.max(1,market.test.length),testAuctions:market.test.length,testGames:groups.size};
}
const calError=kind=>{const b=bands[kind];return mean(market.calibration.map(r=>{const p=Math.max(0,r.predictions[kind]+b.shift);return Math.max(0,r.low-p,p-r.high);}));};
const simpleKind=calError("pooled")<=calError("market-letter")?"pooled":"market-letter";
const pairedDifference=interval([...errorsByGame["identity-features"]].map(([id,e])=>e-errorsByGame[simpleKind].get(id)));
const botMetrics=leaders.map(b=>{const rows=test.filter(s=>s.botId===b.bot_id),wins=rows.filter(s=>s.won),upper=rows.filter(s=>s.kind==="upper");return {name:b.name,botId:b.bot_id,publicWins:b.wins,publicGames:b.matches_played,partitions:b.counts,exactWins:wins.length,informativeLosingBounds:upper.length,
  lateWinFraction:wins.filter(s=>s.amount>s.balance).length/Math.max(1,wins.length),
  models:Object.fromEntries(variants.filter(kind=>kind!=="market-letter").map(kind=>[kind,{winningBidMAE:mean(wins.map(s=>Math.abs(forecast(kind,s)-s.amount))),losingBoundConflict:mean(upper.map(s=>Number(forecast(kind,s)>s.amount)))}]))};});
const replay=Object.fromEntries(leaders.map(b=>[b.name,test.filter(s=>s.botId===b.bot_id&&s.balance>0).map(s=>({letter:s.letter,phase:Math.min(2,Math.floor(s.progress*3)),low:s.kind==="exact"?Math.min(1,s.amount/s.balance):0,high:Math.min(1,s.amount/s.balance),exact:s.kind==="exact"}))]));
const serialized={pooled,identity,bands,marketBaseline,simpleKind,leaders:leaders.map(b=>({id:b.bot_id,name:b.name})),nameToId:Object.fromEntries([...bots.values()].map(b=>[b.name,b.id]))};
writeFileSync(join(directory,"forecast-models.json"),JSON.stringify(serialized));
writeFileSync(join(directory,"replay.json"),JSON.stringify(replay));
const sources=["experiments/betting/prepare.mjs","experiments/betting/market.mjs","experiments/betting/PROTOCOL.md","src/public-opponents.ts"];
const result={completedAt:new Date().toISOString(),directory,simpleKind,calibrationErrors:{pooled:calError("pooled"),market:calError("market-letter")},split:{trainEnd,calEnd,trainGames:matches.filter(m=>partition(m.id)==="train").length,calibrationGames:matches.filter(m=>partition(m.id)==="calibration").length,testGames:matches.filter(m=>partition(m.id)==="test").length},audit,botMetrics,fieldMetrics,pairedDifference,families,calibration:bands,
  predictiveGate:fieldMetrics["identity-features"].intervalMAE<=0.9*fieldMetrics[simpleKind].intervalMAE&&fieldMetrics["identity-features"].coverage>=0.75,
  sources:sources.map(file=>({file,sha256:createHash("sha256").update(readFileSync(file)).digest("hex")}))};
writeFileSync(join(directory,"prediction-results.json"),JSON.stringify(result,null,2));
console.log(JSON.stringify({directory,simpleKind,fieldMetrics,pairedDifference,predictiveGate:result.predictiveGate,botMetrics},null,2));
