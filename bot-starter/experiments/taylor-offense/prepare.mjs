import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {archive,readTable} from '../value-planning/archive.mjs';
import {quantile} from '../../src/public-opponents.ts';
import {loadDictionary} from '../../src/dictionary.ts';
import {wordReward} from '../../src/strategy.ts';
import {DEFAULT_BAG} from '../../../spacetimedb/src/letters.ts';
const {directory}=JSON.parse(readFileSync('experiments/taylor-offense/latest.json','utf8'));
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
const excluded=new Set([12761,12770,12779,12788,12797,12806,12816,12826]),ids=new Set(manifest.matchIds.filter(id=>!excluded.has(id)));
const a=archive(directory,ids);if(a.audit.excluded.length)throw new Error('Archive reconstruction failed');
const stats=readTable(directory,'bot_stats'),versions=readTable(directory,'bot_version'),matches=new Map(readTable(directory,'match_state').map(m=>[m.id,m]));
const all=stats.filter(s=>a.bots.has(s.bot_id)&&!a.bots.get(s.bot_id).is_simulated).map(s=>({id:s.bot_id,name:a.bots.get(s.bot_id).name,games:s.matches_played,wins:s.wins,winRate:s.wins/Math.max(1,s.matches_played),rating:s.rating,
  versionStartedAt:Math.max(0,...versions.filter(v=>v.bot_id===s.bot_id).map(v=>Number(v.started_at[0])))}));
const current=(bot,id)=>Number(matches.get(id)?.created_at[0]??0)>=bot.versionStartedAt;
const chosen=all.filter(b=>b.games>=50&&new Set(a.bids.filter(r=>r.botId===b.id&&current(b,r.matchId)).map(r=>r.matchId)).size>=20).sort((x,y)=>y.winRate-x.winRate).slice(0,8);
if(chosen.length<5)throw new Error('Insufficient current leader coverage');
const replay={},leaders=chosen.map(b=>{const bids=a.bids.filter(r=>r.botId===b.id&&current(b,r.matchId)),words=a.wordEvents.filter(w=>w.botId===b.id&&current(b,w.matchId)),gameIds=new Set(bids.map(r=>r.matchId)),long=words.filter(w=>w.word.length>=7),histogram={};
  for(const w of words)histogram[w.word.length]=(histogram[w.word.length]??0)+1;
  const mode=Number(Object.entries(histogram).sort((x,y)=>y[1]-x[1])[0]?.[0]??7);replay[b.name]=bids;
  return {...b,recentGames:gameIds.size,records:bids.length,word:{minimumLength:Math.max(5,Math.min(8,mode)),cashOutBalance:Math.max(8,Math.min(30,quantile(words.map(w=>w.balanceBefore),.5))),minimumReward:quantile(long.map(w=>w.reward),.5)||40,rackLimit:14,flushRemaining:3},actualMeanScore:words.reduce((s,w)=>s+w.reward,0)/gameIds.size};});
const groups=new Map(),cells=new Map(),letters=new Map(),tops=new Map(readTable(directory,'auction_top_bid_archive').map(r=>[r.auction_id,r.top_bid]));
for(const r of readTable(directory,'auction_result'))if(ids.has(r.match_id)&&matches.get(r.match_id)?.auction_type[0]===1){if(!groups.has(r.match_id))groups.set(r.match_id,[]);groups.get(r.match_id).push(r);}
for(const rows of groups.values()){rows.sort((x,y)=>x.auction_id-y.auction_id);for(let n=0;n<rows.length;n++){const a=rows[n],top=tops.get(a.auction_id);if(a.paid<=0||top===undefined)continue;const key=`${a.letter}:${Math.min(2,Math.floor(n/Math.max(1,rows.length-1)*3))}`,v={paid:a.paid,top};for(const [map,k] of [[cells,key],[letters,a.letter]]){if(!map.has(k))map.set(k,[]);map.get(k).push(v);}}}
const summarize=rows=>({paid:Math.max(1,quantile(rows.map(r=>r.paid),.5)),top:Math.max(1,quantile(rows.map(r=>r.top),.5))});
const market={letters:Object.fromEntries([...letters].map(([k,v])=>[k,summarize(v)])),cells:Object.fromEntries([...cells].filter(([,v])=>v.length>=15).map(([k,v])=>[k,summarize(v)])),fallback:{paid:12,top:16}};
const opponentData={createdAt:new Date().toISOString(),trainingGames:ids.size,audit:a.audit,diagnosticIds:[...excluded],leaders,market,replay,publicStats:Object.fromEntries(all.map(b=>[b.name,{matchesPlayed:b.games,wins:b.wins,rating:b.rating}]))};
writeFileSync(join(directory,'opponents.json'),JSON.stringify(opponentData));
const dictionary=new Set(loadDictionary()),families=new Map();let selectedWords=0;
for(const w of a.wordEvents){const bot=chosen.find(b=>b.id===w.botId);if(!bot||!current(bot,w.matchId)||!dictionary.has(w.word)||w.reward!==wordReward(w.word))continue;selectedWords++;
  if(w.reward<30||w.word.length<5||w.word.length>10)continue;
  const signature=[...w.word].sort().join('');let family=families.get(signature);if(!family){family={signature,reward:w.reward,occurrences:0,games:new Set(),bots:new Set(),spellings:new Map()};families.set(signature,family);}
  family.occurrences++;family.games.add(w.matchId);family.bots.add(w.botId);family.spellings.set(w.word,(family.spellings.get(w.word)??0)+1);
}
const eligible=[...families.values()].filter(w=>w.games.size>=3&&w.bots.size>=2).map(w=>({word:[...w.spellings].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0]))[0][0],reward:w.reward,occurrences:w.occurrences,games:w.games.size,bots:w.bots.size,rank:w.reward*Math.log1p(w.games.size)*Math.sqrt(w.bots.size)})).sort((x,y)=>y.rank-x.rank||x.word.localeCompare(y.word)).slice(0,384);
if(!eligible.length)throw new Error('No repeated premium word families');
// Letter evidence uses all eligible premium plays, not just repeated spellings.
const weighted=Object.fromEntries(DEFAULT_BAG.map(([c])=>[c,0]));for(const w of families.values())for(const c of w.signature)weighted[c]+=w.games.size*w.reward/w.signature.length;
const total=Object.values(weighted).reduce((s,n)=>s+n,0),bagTotal=DEFAULT_BAG.reduce((s,[,n])=>s+n,0);
const affinity=Object.fromEntries(DEFAULT_BAG.map(([c,n])=>{const p=n/bagTotal,ratio=(weighted[c]+total*.15*p)/(total*1.15*p);return [c,Number(Math.max(0,Math.min(1,Math.log2(Math.max(1,ratio))/2)).toFixed(4))];}));
const priors={collectedAt:manifest.collectedAt,trainingGames:ids.size,bots:chosen.map(b=>({id:b.id,name:b.name,winRate:b.winRate,games:b.games})),selectedWordEvents:selectedWords,minimumReward:30,minimumGames:3,minimumBots:2,words:eligible,letters:affinity};
writeFileSync(join(directory,'word-priors.json'),JSON.stringify(priors,null,2));
writeFileSync('src/taylor-priors.ts',`// Generated from audited anonymous public records; see TAYLOR-OFFENSE-RESULTS.md.\n// These are preferences, never a replacement for the full legal dictionary.\nexport const TAYLOR_PRIOR_METADATA=${JSON.stringify({collectedAt:priors.collectedAt,trainingGames:ids.size,bots:priors.bots,wordFamilies:eligible.length})} as const;\nexport const TAYLOR_WORD_PRIORS=${JSON.stringify(eligible.map(w=>({word:w.word,reward:w.reward,games:w.games,bots:w.bots})))} as const;\nexport const TAYLOR_LETTER_AFFINITY:Readonly<Record<string,number>>=${JSON.stringify(affinity)};\n`);
console.log(JSON.stringify({directory,trainingGames:ids.size,leaders:chosen.map(b=>({name:b.name,winRate:b.winRate})),families:eligible.length,topWords:eligible.slice(0,15),letters:affinity},null,2));
