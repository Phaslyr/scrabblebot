import {makeMedianAgent} from './median-policy.js';
import {TAYLOR_LIVE_CONFIG,TAYLOR_LIVE_MODEL} from './taylor-median-settings.js';
import {type ValueKnowledge} from './value-planning.js';
import {type ArenaAgent} from './local-arena.js';
export {TAYLOR_LIVE_CONFIG,TAYLOR_LIVE_VERSION} from './taylor-median-settings.js';
export const createLiveTaylorPolicy=()=>makeMedianAgent(TAYLOR_LIVE_CONFIG,TAYLOR_LIVE_MODEL);
export function makeLiveTaylorAgent():ArenaAgent {const p=createLiveTaylorPolicy();p.name='TaylorMason';return p;}
export interface TaylorHistory {
 rack:Map<string,number>;ownId:bigint;startingRackSize:number;participants:number;
 purchases:readonly {letter:string;winnerBotId?:bigint;at:bigint}[];
 words:readonly {word:string;botId:bigint;at:bigint}[];
}
// Reconstruct our own initial rack, never an opponent's private letters.
// This also restores letters revealed while the client was disconnected.
export function recoverTaylorKnowledge(h:TaylorHistory):ValueKnowledge|undefined {
 const initialRack=new Map(h.rack),seen=new Map<string,number>();
 const ownWords=h.words.filter(w=>w.botId===h.ownId);
 for(const w of ownWords)for(const c of w.word)initialRack.set(c,(initialRack.get(c)??0)+1);
 for(const p of h.purchases){seen.set(p.letter,(seen.get(p.letter)??0)+1);if(p.winnerBotId===h.ownId)initialRack.set(p.letter,(initialRack.get(p.letter)??0)-1);}
 if([...initialRack.values()].some(n=>n<0)||[...initialRack.values()].reduce((s,n)=>s+n,0)!==h.startingRackSize)return undefined;
 for(const [letter,count] of initialRack)if(count===0)initialRack.delete(letter);
 const lastWord=ownWords.reduce((at,w)=>w.at>at?w.at:at,0n);
 return {initialRack,seen,hiddenInitial:h.startingRackSize*Math.max(0,h.participants-1),round:h.purchases.length,lastWordRound:h.purchases.filter(p=>p.at<=lastWord).length};
}
