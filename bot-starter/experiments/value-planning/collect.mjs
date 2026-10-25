import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const previous=JSON.parse(readFileSync('experiments/victor-refinement/latest.json','utf8')).directory;
const old=JSON.parse(readFileSync(join(previous,'manifest.json'),'utf8'));
const directory=resolve('local-tests',`value-planning-${new Date().toISOString().replace(/[:.]/g,'-')}`);mkdirSync(join(directory,'data'),{recursive:true});
const endpoint=old.endpoint,sources=[];
async function select(table,where=''){const query=`SELECT * FROM ${table}${where}`;
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain'},body:query,signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw new Error(`${table}: ${r.status}`);const raw=await r.json(),body=JSON.stringify(raw),p=raw[0],keys=p.schema.elements.map(f=>f.name.some);
  writeFileSync(join(directory,'data',`${table}.json`),body);sources.push({table,query,sha256:createHash('sha256').update(body).digest('hex'),collectedAt:new Date().toISOString(),rows:p.rows.length});
  return p.rows.map(row=>Object.fromEntries(keys.map((k,i)=>[k,row[i]])));}
const [bots,stats,versions,matches]=await Promise.all(['bot','bot_stats','bot_version','match_state'].map(t=>select(t)));
const ended=matches.filter(m=>m.status[0]===2).sort((a,b)=>a.id-b.id).slice(-1000),minimum=ended[0].id,maximum=ended.at(-1).id;
const where=` WHERE match_id >= ${minimum} AND match_id <= ${maximum}`;
for(const t of ['match_participant','word_play','auction_result','auction_top_bid_archive'])await select(t,where);
const liveHashes=old.liveHashes.map(({file})=>({file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')}));
const manifest={collectedAt:new Date().toISOString(),directory,previous,endpoint,anonymous:true,readOnly:true,sources,minimum,maximum,matchIds:ended.map(m=>m.id),liveHashes};
writeFileSync(join(directory,'manifest.json'),JSON.stringify(manifest,null,2));writeFileSync('experiments/value-planning/latest.json',JSON.stringify({directory},null,2));console.log(JSON.stringify({directory,games:ended.length,minimum,maximum},null,2));

