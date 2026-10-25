// Frozen offline candidate from 2026-10-24T22:38:39.819Z. No online entry point.
import {makeCandidate} from './policy.mjs';
export const configuration={
  "id": "modern-original-phase",
  "engine": "modern",
  "phase": "legacy",
  "attackWeight": 0.8,
  "reserve": 30,
  "exploration": 3
};
export const makeVictorMateoCandidate=()=>makeCandidate(configuration);
