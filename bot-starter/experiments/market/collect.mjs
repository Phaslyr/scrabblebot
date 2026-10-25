// Fresh forward validation data only. Anonymous SELECT; no live bot entry point.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const previous=JSON.parse(readFileSync("experiments/betting/latest.json","utf8")).directory;
const old=JSON.parse(readFileSync(join(previous,"manifest.json"),"utf8"));
const directory=resolve("local-tests",`market-all-three-${new Date().toISOString().replace(/[:.]/g,"-")}`);
mkdirSync(join(directory,"data"),{recursive:true});
const endpoint=old.endpoint,sources=[];
async function select(table,where=""){
  const query=`SELECT * FROM ${table}${where}`;
  const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"text/plain"},body:query,signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw new Error(`${table}: ${r.status}`);
  const payload=await r.json(),text=JSON.stringify(payload),p=payload[0],keys=p.schema.elements.map(f=>f.name.some);
  const rows=p.rows.map(row=>Object.fromEntries(keys.map((key,i)=>[key,row[i]])));
  writeFileSync(join(directory,"data",`${table}.json`),text);
  sources.push({table,query,rows:rows.length,collectedAt:new Date().toISOString(),sha256:createHash("sha256").update(text).digest("hex")});
  return rows;
}
const [bots,matches]=await Promise.all([select("bot"),select("match_state")]);
const ended=matches.filter(m=>m.status[0]===2&&m.id>old.maximum).sort((a,b)=>a.id-b.id);
if(ended.length<30)throw new Error(`Only ${ended.length} new public games; no fresh holdout yet.`);
const minimum=ended[0].id,maximum=ended.at(-1).id,where=` WHERE match_id >= ${minimum} AND match_id <= ${maximum}`;
await Promise.all([select("match_participant",where),select("word_play",where),select("auction_result",where),select("auction_top_bid_archive",where)]);
const liveHashes=old.liveHashes.map(({file})=>({file,sha256:createHash("sha256").update(readFileSync(file)).digest("hex")}));
writeFileSync(join(directory,"manifest.json"),JSON.stringify({directory,previous,endpoint,anonymous:true,readOnly:true,sources,minimum,maximum,matchIds:ended.map(m=>m.id),liveHashes},null,2));
writeFileSync("experiments/market/latest.json",JSON.stringify({directory},null,2));
console.log(JSON.stringify({directory,previous,newPublicGames:ended.length,minimum,maximum},null,2));
