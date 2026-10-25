import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {TAYLOR_ACTIVE_CONFIG,TAYLOR_POLICY_VERSION} from '../../src/taylor.ts';
const {directory}=JSON.parse(readFileSync('experiments/taylor-offense/latest.json','utf8'));
const load=f=>JSON.parse(readFileSync(join(directory,f),'utf8')),r=load('results.json'),manifest=load('manifest.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
assert.deepEqual(TAYLOR_ACTIVE_CONFIG,r.selected);assert.equal(existsSync('.bot-TaylorMason.lock'),false);
for(const s of r.sourceHashes)assert.equal(hash(s.file),s.sha256,`Core study source changed: ${s.file}`);
const intended=new Set(['src/online.ts','src/study.ts','src/local-arena.ts','package.json','../Start-Bot.ps1']);
const updated=[],preserved=[];
for(const s of manifest.liveHashes){const sha256=hash(s.file);if(sha256!==s.sha256){assert.ok(intended.has(s.file),`Unexpected legacy change: ${s.file}`);updated.push({file:s.file,before:s.sha256,after:sha256});}else preserved.push(s.file);}
const log=readFileSync('experiments/taylor-offense/check.log','utf8');assert.match(log,/pass 91/);assert.match(log,/fail 0/);assert.match(log,/> tsc/);
const verification={verifiedAt:new Date().toISOString(),policyVersion:TAYLOR_POLICY_VERSION,configuration:TAYLOR_ACTIVE_CONFIG,testsPassed:91,typescriptBuildPassed:true,studyPolicyAndInputsUnchanged:true,onlineBotStopped:true,intentionalLegacyChanges:updated,preservedLegacyFiles:preserved,
  activeSources:['src/taylor.ts','src/taylor-policy.ts','src/taylor-settings.ts','src/taylor-priors.ts','src/online.ts','src/study.ts','src/online-evaluation.ts','src/local-arena.ts','scripts/run-local-tests.mjs','../Start-Bot.ps1','../Start-Online-Test.ps1'].map(file=>({file,sha256:hash(file)}))};
writeFileSync(join(directory,'integration-verification.json'),JSON.stringify(verification,null,2));
const report=resolve('../TAYLOR-OFFENSE-RESULTS.md');let text=readFileSync(report,'utf8');
text+='\n## Integration checks\n\nAll **91 tests** and the TypeScript build passed after integration. Normal play, fixed evaluation, bounded practice and the default local arena use the same selected offense-only policy. The old defensive strategy spelling is only a compatibility alias for the new policy; saved pressure plans are ignored. Explicit weighted arena agents remain available for historical comparisons.\n\n';
text+='The shared scoring engine, Wags and VictorMateo policies and their launchers match their pre-study hashes. Core study policy/data files also match the frozen inputs. Only the intended TaylorMason routing, reporting, test-list and main-launcher files changed among the monitored legacy files. See [integration verification]('+join(directory,'integration-verification.json').replaceAll('\\','/')+'). The online bot remains stopped.\n';
writeFileSync(report,text);console.log(JSON.stringify({report,policy:TAYLOR_POLICY_VERSION,selected:TAYLOR_ACTIVE_CONFIG,testsPassed:91,preservedLegacyFiles:preserved.length,onlineBotStopped:true}));
