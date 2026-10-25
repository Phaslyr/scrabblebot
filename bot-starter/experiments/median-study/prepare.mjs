import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {archive,readTable} from '../value-planning/archive.mjs';
import {quantile} from '../../src/public-opponents.ts';
import {DEFAULT_BAG} from '../../../spacetimedb/src/letters.ts';
const json=f=>JSON.parse(readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const {directory}=json('experiments/median-study/latest.json'),manifest=json(join(directory,'manifest.json'));
const excluded=new Set([12761,12770,12779,12788,12797,12806,12816,12826]);
const campaign=json('runs/taylor-offense-online-active.json');for(const d of campaign.runDirectories)for(const g of json(join(d,'results.json')).results)excluded.add(Number(g.matchId));
const included=manifest.matchIds.filter(id=>!excluded.has(id)),cut=Math.floor(included.length*.8),fitIds=new Set(included.slice(0,cut)),holdIds=new Set(included.slice(cut));
const fit=archive(directory,fitIds),hold=archive(directory,holdIds);if(fit.audit.excluded.length||hold.audit.excluded.length)throw new Error('History audit failed');
const matches=new Map(readTable(directory,'match_state').map(m=>[m.id,m])),stats=readTable(directory,'bot_stats'),versions=readTable(directory,'bot_version');
const all=stats.filter(s=>fit.bots.has(s.bot_id)&&!fit.bots.get(s.bot_id).is_simulated).map(s=>({id:s.bot_id,name:fit.bots.get(s.bot_id).name,games:s.matches_played,wins:s.wins,rating:s.rating,winRate:s.wins/Math.max(1,s.matches_played),versionStartedAt:Math.max(0,...versions.filter(v=>v.bot_id===s.bot_id).map(v=>Number(v.started_at[0])))}));
const current=(b,id)=>Number(matches.get(id)?.created_at[0]??0)>=b.versionStartedAt;
const chosen=all.filter(b=>b.games>=50&&new Set(fit.bids.filter(r=>r.botId===b.id&&current(b,r.matchId)).map(r=>r.matchId)).size>=30).sort((a,b)=>b.winRate-a.winRate).slice(0,8);
if(chosen.length<5)throw new Error('Insufficient leading-bot fit coverage');
const leaders=[],replay={};for(const b of chosen){const bids=fit.bids.filter(r=>r.botId===b.id&&current(b,r.matchId)),words=fit.wordEvents.filter(w=>w.botId===b.id&&current(b,w.matchId)),long=words.filter(w=>w.word.length>=7),games=new Set(bids.map(r=>r.matchId));
  leaders.push({...b,recentGames:games.size,actualMeanScore:words.reduce((s,w)=>s+w.reward,0)/games.size,word:{minimumLength:7,cashOutBalance:quantile(words.map(w=>w.balanceBefore),.5),minimumReward:quantile(long.map(w=>w.reward),.5),rackLimit:14,flushRemaining:3}});replay[b.name]=bids;
}
const auctions=readTable(directory,'auction_result'),tops=new Map(readTable(directory,'auction_top_bid_archive').map(a=>[a.auction_id,a.top_bid])),byMatch=new Map();
for(const a of auctions){if(!byMatch.has(a.match_id))byMatch.set(a.match_id,[]);byMatch.get(a.match_id).push(a);}for(const a of byMatch.values())a.sort((x,y)=>x.auction_id-y.auction_id);
const buckets=new Map(),letterBuckets=new Map(),winners=new Set(chosen.map(b=>b.id));
for(const id of fitIds){const rounds=byMatch.get(id)??[];if(matches.get(id)?.auction_type[0]!==1)continue;for(let i=0;i<rounds.length-1;i++){const a=rounds[i],winner=a.winner_bot_id[0]===0?a.winner_bot_id[1]:undefined,bot=chosen.find(b=>b.id===winner),top=tops.get(a.auction_id);if(!bot||!current(bot,id)||top===undefined||a.paid<=0)continue;
  const v={paid:a.paid,top},phase=Math.min(2,Math.floor(i/Math.max(1,rounds.length-1)*3));for(const [map,key] of [[buckets,`${a.letter}:${phase}`],[letterBuckets,a.letter]]){if(!map.has(key))map.set(key,[]);map.get(key).push(v);}}
}
const summary=rows=>({paid:quantile(rows.map(r=>r.paid),.5),top:quantile(rows.map(r=>r.top),.5),samples:rows.length,paidQuartiles:[.25,.5,.75].map(q=>quantile(rows.map(r=>r.paid),q)),topQuartiles:[.25,.5,.75].map(q=>quantile(rows.map(r=>r.top),q))});
const market={letters:Object.fromEntries([...letterBuckets].map(([c,rs])=>[c,summary(rs)])),cells:Object.fromEntries([...buckets].filter(([,rs])=>rs.length>=20).map(([c,rs])=>[c,summary(rs)])),fallback:{paid:12,top:16}};
const median={payout:quantile(leaders.map(b=>b.word.minimumReward),.5),cashOut:quantile(leaders.map(b=>b.word.cashOutBalance),.5)};
// Fit a single bid-model scale using historical public balances and price
// ceilings. The candidate never receives these current rival ceilings.
let randomState=19123;const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/2**32;};
const pools=new Map(chosen.map(b=>[b.name,fit.bids.filter(r=>r.botId===b.id&&current(b,r.matchId))]));
const generic=[...pools.values()].flat(),letterPools=new Map();
for(const [name,pool] of [...pools,['generic',generic]])for(const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')letterPools.set(`${name}:${c}`,pool.filter(r=>r.letter===c));
function predict(rows,scale){const predictions=[];for(let n=0;n<Math.min(rows.length,2500);n+=3){const row=rows[n],bids=row.rivals.map(o=>{const name=pools.has(o.name)?o.name:'generic',pool=pools.get(o.name)??generic,same=letterPools.get(`${name}:${row.letter}`),p=same.length?same:pool,r=p[Math.floor(random()*p.length)],fraction=r.exact?r.low:(r.low+r.high)/2;return Math.min(o.balance,Math.round(o.balance*fraction*scale));});if(bids.filter(x=>x>0).length<2)continue;predictions.push({predicted:Math.max(...bids),actual:(row.low+row.high)/2});}return predictions;}
const eligibleFit=fit.rows.filter(r=>r.rivals.filter(o=>pools.has(o.name)).length>=3),scales=[.75,1,1.25,1.5,1.75,2];
const scaleFit=scales.map(scale=>{randomState=19123;const ps=predict(eligibleFit,scale);return {scale,cases:ps.length,absoluteError:ps.reduce((s,p)=>s+Math.abs(p.predicted-p.actual),0)/Math.max(1,ps.length),predictedMedian:quantile(ps.map(p=>p.predicted),.5),actualMedian:quantile(ps.map(p=>p.actual),.5)};}).sort((a,b)=>a.absoluteError-b.absoluteError);
const opponentScale=scaleFit[0].scale;randomState=21977;const calibration=predict(hold.rows.filter(r=>r.rivals.filter(o=>pools.has(o.name)).length>=3),opponentScale);
const rosters=new Map();for(const p of readTable(directory,'match_participant')){if(!rosters.has(p.match_id))rosters.set(p.match_id,[]);rosters.get(p.match_id).push(p);}
const cases=[];for(const id of holdIds){const m=matches.get(id),rs=byMatch.get(id)??[],roster=rosters.get(id)??[];if(m.auction_type[0]!==1||m.starting_rack_size!==5||roster.length!==6||roster.some(p=>fit.bots.get(p.bot_id)?.is_simulated)||rs.length!==68)continue;
  const initial=Object.fromEntries(DEFAULT_BAG);for(const a of rs)initial[a.letter]--;if(Object.values(initial).some(n=>n<0)||Object.values(initial).reduce((s,n)=>s+n,0)!==30)continue;
  const target=roster[cases.length%6].bot_id;if(rs.some(a=>!tops.has(a.auction_id)))continue;
  cases.push({matchId:id,targetBotId:target,initialPool:Object.entries(initial).flatMap(([c,n])=>Array(n).fill(c)),auctions:rs.map(a=>{const winner=a.winner_bot_id[0]===0?a.winner_bot_id[1]:undefined;return {letter:a.letter,threshold:winner===undefined?0:winner===target?a.paid:tops.get(a.auction_id)};})});if(cases.length===256)break;
}
if(cases.length<256)throw new Error(`Need 256 held-out standard price paths, got ${cases.length}`);
const data={createdAt:new Date().toISOString(),fitIds:[...fitIds],holdoutIds:[...holdIds],excludedDiagnosticIds:[...excluded],audit:{fit:fit.audit,holdout:hold.audit},leaders,replay,market,median,opponentScale,scaleFit,calibration:{cases:calibration.length,predictedMedian:quantile(calibration.map(p=>p.predicted),.5),actualMedian:quantile(calibration.map(p=>p.actual),.5),absoluteError:calibration.reduce((s,p)=>s+Math.abs(p.predicted-p.actual),0)/Math.max(1,calibration.length)},publicStats:Object.fromEntries(all.map(b=>[b.name,{matchesPlayed:b.games,wins:b.wins,rating:b.rating}]))};
writeFileSync(join(directory,'opponents.json'),JSON.stringify(data));writeFileSync(join(directory,'price-paths.json'),JSON.stringify(cases));
console.log(JSON.stringify({directory,fitGames:fitIds.size,holdoutGames:holdIds.size,excludedGames:manifest.matchIds.length-included.length,leaders:leaders.map(b=>({name:b.name,games:b.recentGames,cash:b.word.cashOutBalance,payout:b.word.minimumReward})),median,rarePrices:Object.fromEntries([... 'JQXZ'].map(c=>[c,market.letters[c]])),opponentScale,calibration:data.calibration,pricePaths:cases.length},null,2));
