import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {archive,readTable} from './archive.mjs';
import {quantile} from '../../src/public-opponents.ts';
const {directory}=JSON.parse(readFileSync('experiments/victor-refinement/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const data=archive(directory,new Set(manifest.matchIds));if(data.audit.excluded.length)throw new Error('History audit failed.');
const stats=readTable(directory,'bot_stats'),versions=readTable(directory,'bot_version'),matches=new Map(readTable(directory,'match_state').map(m=>[m.id,m]));
const all=stats.filter(s=>data.bots.has(s.bot_id)&&!data.bots.get(s.bot_id).is_simulated).map(s=>({id:s.bot_id,name:data.bots.get(s.bot_id).name,
  games:s.matches_played,wins:s.wins,winRate:s.wins/Math.max(1,s.matches_played),rating:s.rating,
  versionStartedAt:Math.max(0,...versions.filter(v=>v.bot_id===s.bot_id).map(v=>Number(v.started_at[0])))}));
const eligible=[];
for(const bot of all.filter(b=>b.games>=50).sort((a,b)=>b.winRate-a.winRate||b.games-a.games)){
  const current=matchId=>Number(matches.get(matchId)?.created_at[0]??0)>=bot.versionStartedAt;
  const bids=data.bids.filter(r=>r.botId===bot.id&&current(r.matchId)),words=data.wordEvents.filter(w=>w.botId===bot.id&&current(w.matchId));
  const matchIds=[...new Set(bids.map(r=>r.matchId))];if(matchIds.length<20)continue;
  const histogram={};for(const w of words)histogram[w.word.length]=(histogram[w.word.length]??0)+1;
  const mode=Number(Object.entries(histogram).sort((a,b)=>b[1]-a[1]||Number(b[0])-Number(a[0]))[0]?.[0]??7);
  eligible.push({...bot,recentGames:matchIds.length,records:bids.length,word:{minimumLength:Math.max(5,Math.min(8,mode)),
    cashOutBalance:Math.max(8,Math.min(30,Math.round(quantile(words.map(w=>w.balanceBefore),0.5)))),rackLimit:14,flushRemaining:3},histogram,
    longScoreShare:words.filter(w=>w.word.length>=7).reduce((s,w)=>s+w.reward,0)/Math.max(1,words.reduce((s,w)=>s+w.reward,0)),bids});
  if(eligible.length===6)break;
}
if(eligible.length<6)throw new Error(`Only ${eligible.length} eligible current leaders.`);
const replay=Object.fromEntries(eligible.map(b=>[b.name,b.bids]));const leaders=eligible.map(({bids,...b})=>b);
const artifact={createdAt:new Date().toISOString(),audit:data.audit,leaders,publicStats:Object.fromEntries(all.map(b=>[b.name,{matchesPlayed:b.games,wins:b.wins,rating:b.rating}])),replay};
writeFileSync(join(directory,'opponents.json'),JSON.stringify(artifact));
console.log(JSON.stringify({directory,audit:data.audit,leaders},null,2));
