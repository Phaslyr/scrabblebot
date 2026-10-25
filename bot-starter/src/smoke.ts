import { loadDictionary } from "./dictionary.js";
import { prepareDictionary, wordReward } from "./strategy.js";
import { chooseTaylorWord, decideTaylorBid,TAYLOR_POLICY_VERSION } from "./taylor.js";

const dictionary = loadDictionary();
prepareDictionary(dictionary);
const myRack = new Map([["Q", 1], ["U", 1], ["I", 1]]);
const start = performance.now();
const bid = decideTaylorBid({ letter: "Z", myBalance: 100, myRack, dictionary }).amount;
myRack.set("Z", 1);
const word = chooseTaylorWord({ myRack, dictionary });
console.log(`Loaded ${dictionary.length.toLocaleString()} dictionary words.`);
console.log(`TaylorMason: ${TAYLOR_POLICY_VERSION}; defense disabled.`);
console.log(`Example: holding Q U I, bid ${bid} for Z.`);
console.log(`With Z: play ${word}, worth ${word ? wordReward(word) : 0} points.`);
console.log(`Two decisions took ${(performance.now() - start).toFixed(1)} ms. No server connection made.`);
