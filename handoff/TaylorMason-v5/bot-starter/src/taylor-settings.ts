import {type TaylorConfig} from './taylor-policy.js';
// Selected on development bags only. The subsequent validation is reported in
// TAYLOR-OFFENSE-RESULTS.md; public-word preferences remain a small heuristic.
export const TAYLOR_ACTIVE_CONFIG:Readonly<TaylorConfig>={id:'public-six',mode:'public',maxExtra:6};
