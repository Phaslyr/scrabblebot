import {parentPort,workerData} from 'node:worker_threads';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {DEFAULT_BAG} from '../../../spacetimedb/src/letters.ts';
import {loadDictionary} from '../../src/dictionary.ts';
import {prepareDictionary} from '../../src/strategy.ts';
import {preparePools,playTask} from './arena-v2.mjs';
const data=JSON.parse(readFileSync(join(workerData.directory,'opponents.json'),'utf8')),pools=preparePools(data),dictionary=loadDictionary();prepareDictionary(dictionary);
const bag=DEFAULT_BAG.flatMap(([c,n])=>Array(n).fill(c));
parentPort.on('message',task=>{try{parentPort.postMessage({id:task.id,records:playTask(task,data,pools,dictionary,bag,workerData.directory)});}catch(error){parentPort.postMessage({id:task.id,error:error.stack??String(error)});}});
parentPort.postMessage({ready:true});

