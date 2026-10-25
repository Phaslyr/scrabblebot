import {readFileSync} from "node:fs";
import {join} from "node:path";
import {LETTER_VALUE} from "../../src/strategy.ts";
export const readTable=(directory,name)=>{const p=JSON.parse(readFileSync(join(directory,"data",`${name}.json`),"utf8"))[0],k=p.schema.elements.map(f=>f.name.some);return p.rows.map(row=>Object.fromEntries(k.map((key,i)=>[key,row[i]])));};
const group=(rows,key)=>{const m=new Map();for(const r of rows){if(!m.has(r[key]))m.set(r[key],[]);m.get(r[key]).push(r);}return m;};
const time=t=>Number(t[0]),some=v=>v[0]===0?v[1]:undefined;
export function archive(directory,ids){
  const bots=new Map(readTable(directory,"bot").map(b=>[b.id,b]));
  const matches=readTable(directory,"match_state").filter(m=>ids.has(m.id)&&m.status[0]===2).sort((a,b)=>a.id-b.id);
  const rosters=group(readTable(directory,"match_participant"),"match_id"),auctions=group(readTable(directory,"auction_result"),"match_id"),words=group(readTable(directory,"word_play"),"match_id");
  const tops=new Map(readTable(directory,"auction_top_bid_archive").map(r=>[r.auction_id,r.top_bid]));
  const rows=[],bids=[],audit={valid:0,excluded:[],marketGames:0,lateWins:0};
  for(const match of matches){
    const roster=rosters.get(match.id)??[],rounds=[...(auctions.get(match.id)??[])].sort((a,b)=>time(a.closed_at)-time(b.closed_at)||a.auction_id-b.auction_id);
    const plays=[...(words.get(match.id)??[])].sort((a,b)=>time(a.played_at)-time(b.played_at)||a.id-b.id);
    const states=new Map(roster.map(p=>[p.bot_id,{balance:100,score:0,size:match.starting_rack_size,known:new Map(),invalid:false}]));
    let wi=0,open=some(match.started_at)?.[0]??time(match.created_at);const localRows=[],localBids=[];
    const apply=(at,inclusive)=>{while(wi<plays.length&&(time(plays[wi].played_at)<at||inclusive&&time(plays[wi].played_at)===at)){
      const w=plays[wi++],s=states.get(w.bot_id);if(!s)continue;s.balance+=w.total_reward;s.score+=w.total_reward;s.size-=w.word.length;
      if(s.size<0)s.invalid=true;for(const c of w.word)s.known.set(c,Math.max(0,(s.known.get(c)??0)-1));}};
    for(let round=0;round<rounds.length;round++){
      const a=rounds[round];apply(open,true);const winner=some(a.winner_bot_id),top=tops.get(a.auction_id);
      const highest=Math.max(0,...[...states.values()].map(s=>s.score));
      const publicStates=roster.map(p=>{const s=states.get(p.bot_id),b=bots.get(p.bot_id);
        return {botId:p.bot_id,name:b?.name??String(p.bot_id),real:b?!b.is_simulated:false,balance:s.balance,score:s.score,rackSize:s.size,
          knownCopies:s.known.get(a.letter)??0,knownSize:[...s.known.values()].reduce((x,n)=>x+n,0),
          knownValue:[...s.known].reduce((x,[c,n])=>x+n*(LETTER_VALUE[c]??0),0),leaderScore:highest};});
      if(match.auction_type[0]===1&&(top!==undefined||winner===undefined)){
        for(const s of publicStates)if(s.real&&s.balance>0){const exact=winner===s.botId||winner===undefined,amount=winner===s.botId?top:winner===undefined?0:a.paid;
          if(amount>s.balance&&winner===s.botId)audit.lateWins++;
          localBids.push({botId:s.botId,name:s.name,letter:a.letter,phase:Math.min(2,Math.floor(round/Math.max(1,rounds.length-1)*3)),
            low:exact?Math.min(1,amount/s.balance):0,high:Math.min(1,amount/s.balance),exact});}
        if(publicStates.length===6&&publicStates.every(s=>s.real)){
          const own=publicStates[(round+match.id)%6],rivals=publicStates.filter(s=>s.botId!==own.botId);
          const high=winner===undefined?0:winner===own.botId?a.paid:top,low=winner===own.botId&&a.paid<=1?0:high;
          localRows.push({matchId:match.id,auctionId:a.auction_id,letter:a.letter,progress:round/Math.max(1,rounds.length-1),rivals,low,high});
        }
      }
      const close=time(a.closed_at);apply(close,false);const win=states.get(winner);
      if(win){win.balance-=a.paid;win.size++;win.known.set(a.letter,(win.known.get(a.letter)??0)+1);if(win.balance<0)win.invalid=true;}
      apply(close,true);open=close;
    }
    apply(Infinity,true);
    const valid=rounds.length&&roster.length&&roster.every(p=>{const s=states.get(p.bot_id);return !s.invalid&&s.balance===p.balance&&s.score===p.score;});
    if(!valid){audit.excluded.push(match.id);continue;}audit.valid++;if(localRows.length)audit.marketGames++;
    rows.push(...localRows);bids.push(...localBids);
  }
  return {bots,rows,bids,audit};
}
