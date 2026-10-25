import {taylorOffenseBid,chooseOffensiveTaylorWord} from './taylor-policy.js';
import {TAYLOR_ACTIVE_CONFIG} from './taylor-settings.js';
import {type BidContext,type WordContext} from './strategy.js';
export {TAYLOR_POLICY_VERSION} from './taylor-policy.js';
export {TAYLOR_ACTIVE_CONFIG} from './taylor-settings.js';
export const decideTaylorBid=(ctx:BidContext)=>taylorOffenseBid(ctx,TAYLOR_ACTIVE_CONFIG);
export const chooseTaylorWord=(ctx:WordContext)=>chooseOffensiveTaylorWord(ctx);
