// Anonymous public SELECT requests. No bot runtime, credentials, or reducers.
import {mkdirSync,writeFileSync,readFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const directory=resolve("local-tests",`betting-study-${new Date().toISOString().replace(/[:.]/g,"-")}`);
mkdirSync(join(directory,"data"),{recursive:true});
const endpoint="https://maincloud.spacetimedb.com/v1/database/scrabblebot/sql",sources=[];
function decode(payload){const p=payload[0],keys=p.schema.elements.map(f=>f.name.some);return p.rows.map(row=>Object.fromEntries(keys.map((k,i)=>[k,row[i]])));}
async function select(table,where=""){
  const query=`SELECT * FROM ${table}${where}`;
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"text/plain"},body:query,signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error(`${table}: ${response.status}`);
  const payload=await response.json(),text=JSON.stringify(payload),rows=decode(payload);
  writeFileSync(join(directory,"data",`${table}.json`),text);
  sources.push({table,query,collectedAt:new Date().toISOString(),rows:rows.length,sha256:createHash("sha256").update(text).digest("hex")});
  return rows;
}
const [bots,stats,versions,matches]=await Promise.all([select("bot"),select("bot_stats"),select("bot_version"),select("match_state")]);
const ended=matches.filter(m=>m.status[0]===2).sort((a,b)=>a.id-b.id).slice(-1800);
const minimum=ended[0].id,maximum=ended.at(-1).id,where=` WHERE match_id >= ${minimum} AND match_id <= ${maximum}`;
await Promise.all([select("match_participant",where),select("word_play",where),select("auction_result",where),select("auction_top_bid_archive",where)]);
const liveFiles=["src/online.ts","src/wags.ts","src/defense.ts","src/scoring-v3.ts","src/leader-priors-v3.ts","src/victor.ts","src/competition.ts","src/planning.ts","src/intel.ts","src/strategy.ts","src/study.ts","src/local-arena.ts","src/public-opponents.ts","package.json","../Start-Bot.ps1","../Start-Bot.cmd","../Start-Wags.cmd","../Start-VictorMateo.cmd"];
const liveHashes=liveFiles.map(file=>({file,sha256:createHash("sha256").update(readFileSync(file)).digest("hex")}));
writeFileSync(join(directory,"manifest.json"),JSON.stringify({directory,endpoint,anonymous:true,readOnly:true,sources,minimum,maximum,matchIds:ended.map(m=>m.id),liveHashes},null,2));
mkdirSync("experiments/betting",{recursive:true});
writeFileSync("experiments/betting/latest.json",JSON.stringify({directory},null,2));
console.log(JSON.stringify({directory,completedGames:ended.length,minimum,maximum,rows:sources.map(s=>({table:s.table,rows:s.rows}))},null,2));
