import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {archive,readTable} from './archive.mjs';
import {quantile} from '../../src/public-opponents.ts';
const {directory}=JSON.parse(readFileSync('experiments/value-planning/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const live=JSON.parse(readFileSync('runs/TaylorMason/2026-10-24T23-02-06-768Z/results.json','utf8')).results.filter(g=>g.phase!=='partial');
const diagnosticIds=new Set(live.map(g=>Number(g.matchId))),trainingIds=new Set(manifest.matchIds.filter(id=>!diagnosticIds.has(id)));
const data=archive(directory,trainingIds);if(data.audit.excluded.length)throw new Error('Public history audit failed');
const stats=readTable(directory,'bot_stats'),versions=readTable(directory,'bot_version'),matches=new Map(readTable(directory,'match_state').map(m=>[m.id,m]));
const all=stats.filter(s=>data.bots.has(s.bot_id)&&!data.bots.get(s.bot_id).is_simulated).map(s=>({id:s.bot_id,name:data.bots.get(s.bot_id).name,games:s.matches_played,wins:s.wins,winRate:s.wins/Math.max(1,s.matches_played),rating:s.rating,
  versionStartedAt:Math.max(0,...versions.filter(v=>v.bot_id===s.bot_id).map(v=>Number(v.started_at[0])))}));
const observed=[...new Map(live.map(g=>{const b=[...g.opponents].sort((a,b)=>b.score-a.score)[0];return [Number(b.id),b];})).values()];
const chosen=observed.map(b=>all.find(x=>x.id===Number(b.id))??{id:Number(b.id),name:b.name,games:0,wins:0,winRate:0,rating:1200,versionStartedAt:0});
for(const b of all.filter(b=>b.games>=50).sort((a,b)=>b.winRate-a.winRate)){if(chosen.some(x=>x.id===b.id))continue;
  const recent=new Set(data.bids.filter(r=>r.botId===b.id&&Number(matches.get(r.matchId)?.created_at[0]??0)>=b.versionStartedAt).map(r=>r.matchId)).size;
  if(recent>=20)chosen.push(b);if(chosen.length>=9)break;}
const leaders=[],replay={};
for(const b of chosen){const current=id=>Number(matches.get(id)?.created_at[0]??0)>=b.versionStartedAt;
  let bids=data.bids.filter(r=>r.botId===b.id&&current(r.matchId)),words=data.wordEvents.filter(w=>w.botId===b.id&&current(w.matchId));let historicalFallback=false;
  if(!bids.length){bids=data.bids.filter(r=>r.botId===b.id);words=data.wordEvents.filter(w=>w.botId===b.id);historicalFallback=true;}
  if(!bids.length)throw new Error(`No public coverage for observed winner ${b.name}`);
  const ids=new Set(bids.map(r=>r.matchId)),histogram={};words=words.filter(w=>ids.has(w.matchId));for(const w of words)histogram[w.word.length]=(histogram[w.word.length]??0)+1;
  const mode=Number(Object.entries(histogram).sort((a,b)=>b[1]-a[1])[0]?.[0]??7),long=words.filter(w=>w.word.length>=7);
  leaders.push({...b,recentGames:ids.size,smallHistory:ids.size<20,historicalFallback,records:bids.length,
    word:{minimumLength:Math.max(5,Math.min(8,mode)),cashOutBalance:Math.max(8,Math.min(30,quantile(words.map(w=>w.balanceBefore),.5))),minimumReward:quantile(long.map(w=>w.reward),.5)||40,rackLimit:14,flushRemaining:3},
    actualMeanScore:words.reduce((s,w)=>s+w.reward,0)/Math.max(1,ids.size)});replay[b.name]=bids;}
const rounds=new Map();for(const a of readTable(directory,'auction_result')){if(!trainingIds.has(a.match_id)||matches.get(a.match_id)?.auction_type[0]!==1)continue;if(!rounds.has(a.match_id))rounds.set(a.match_id,[]);rounds.get(a.match_id).push(a);}
const tops=new Map(readTable(directory,'auction_top_bid_archive').map(a=>[a.auction_id,a.top_bid]));const cells=new Map(),letters=new Map();
for(const rows of rounds.values()){rows.sort((a,b)=>a.auction_id-b.auction_id);for(let i=0;i<rows.length;i++){const a=rows[i],top=tops.get(a.auction_id);if(a.paid<=0||top===undefined)continue;
  const key=`${a.letter}:${Math.min(2,Math.floor(i/Math.max(1,rows.length-1)*3))}`,r={paid:a.paid,top};if(!cells.has(key))cells.set(key,[]);cells.get(key).push(r);if(!letters.has(a.letter))letters.set(a.letter,[]);letters.get(a.letter).push(r);}}
const summary=rows=>({paid:Math.max(1,quantile(rows.map(r=>r.paid),.5)),top:Math.max(1,quantile(rows.map(r=>r.top),.5))});
const market={letters:Object.fromEntries([...letters].map(([k,v])=>[k,summary(v)])),cells:Object.fromEntries([...cells].filter(([,v])=>v.length>=15).map(([k,v])=>[k,summary(v)])),fallback:{paid:12,top:16}};
const out={createdAt:new Date().toISOString(),audit:data.audit,diagnosticIds:[...diagnosticIds],trainingGames:trainingIds.size,leaders,market,publicStats:Object.fromEntries(all.map(b=>[b.name,{matchesPlayed:b.games,wins:b.wins,rating:b.rating}])),replay};
writeFileSync(join(directory,'opponents.json'),JSON.stringify(out));console.log(JSON.stringify({directory,audit:data.audit,trainingGames:trainingIds.size,leaders,market},null,2));
