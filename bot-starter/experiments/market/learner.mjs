import {quantile} from "../../src/public-opponents.ts";
import {marketKey,marketPrice} from "../betting/market.mjs";
export function makeTable(rows){const cells=new Map(),letters=new Map();
  for(const r of rows){const cash=Math.max(0,...r.rivals.map(s=>s.balance)),key=marketKey(r.letter,r.progress,cash),y=(r.low+r.high)/2;
    if(!cells.has(key))cells.set(key,[]);cells.get(key).push(y);if(!letters.has(r.letter))letters.set(r.letter,[]);letters.get(r.letter).push(y);}
  return {cells:Object.fromEntries([...cells].filter(([,a])=>a.length>=50).map(([k,a])=>[k,quantile(a,0.5)])),
    letters:Object.fromEntries([...letters].map(([k,a])=>[k,quantile(a,0.5)])),fallback:quantile(rows.map(r=>(r.low+r.high)/2),0.5)};
}
export const tablePoint=(table,row)=>marketPrice(table,row.letter,row.progress,Math.max(0,...row.rivals.map(s=>s.balance)));
export function features(row,table,identities=[]){
  const rivals=row.rivals,cash=rivals.map(s=>s.balance).sort((a,b)=>b-a),size=rivals.map(s=>s.rackSize),scores=rivals.map(s=>s.score);
  const mean=a=>a.reduce((s,n)=>s+n,0)/Math.max(1,a.length),clamp=x=>Math.max(-4,Math.min(4,x));
  const x=[tablePoint(table,row)/40,row.progress,cash[0]/100,(cash[1]??0)/100,mean(cash)/100,cash.filter(n=>n>=20).length/5,
    Math.max(...size)/15,mean(size)/10,Math.max(...scores)/150,(Math.max(...scores)-Math.min(...scores))/150,
    mean(rivals.map(s=>s.knownCopies??0))/3,Math.max(...rivals.map(s=>s.knownCopies??0))/3,
    mean(rivals.map(s=>(s.knownSize??0)/Math.max(1,s.rackSize))),mean(rivals.map(s=>s.knownValue??0))/30];
  for(const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ")x.push(Number(c===row.letter));
  for(const id of identities){const s=rivals.find(s=>String(s.botId)===String(id));x.push(s?1:0,s?s.balance/100:0,s?s.rackSize/15:0);}
  return x.map(clamp);
}
export function fitBoosted(rows,table,identities,maxTrees=80){
  const n=rows.length,f=features(rows[0],table,identities).length,matrix=new Float32Array(n*f),bins=new Uint8Array(n*f),target=new Float64Array(n),prediction=new Float64Array(n);
  for(let i=0;i<n;i++){matrix.set(features(rows[i],table,identities),i*f);target[i]=(rows[i].low+rows[i].high)/2;prediction[i]=tablePoint(table,rows[i]);}
  const cuts=[];
  for(let j=0;j<f;j++){const values=Array.from({length:n},(_,i)=>matrix[i*f+j]).sort((a,b)=>a-b),max=values.at(-1);
    const list=[...new Set([0,...[0.1,0.25,0.5,0.75,0.9].map(q=>values[Math.floor((n-1)*q)])])].filter(v=>v>=values[0]&&v<max).sort((a,b)=>a-b);cuts.push(list);
    for(let i=0;i<n;i++){let b=0;while(b<list.length&&matrix[i*f+j]>list[b])b++;bins[i*f+j]=b;}}
  const trees=[],rate=0.1,gradient=new Float64Array(n),minLeaf=Math.max(100,Math.floor(n*0.002));
  for(let t=0;t<maxTrees;t++){
    let total=0;for(let i=0;i<n;i++){gradient[i]=Math.max(-10,Math.min(10,target[i]-prediction[i]));total+=gradient[i];}
    let best={gain:0};
    for(let j=0;j<f;j++){const list=cuts[j];if(!list.length)continue;const sums=new Float64Array(list.length+1),counts=new Uint32Array(list.length+1);
      for(let i=0;i<n;i++){const b=bins[i*f+j];sums[b]+=gradient[i];counts[b]++;}
      let sum=0,count=0;for(let k=0;k<list.length;k++){sum+=sums[k];count+=counts[k];const right=n-count;if(count<minLeaf||right<minLeaf)continue;
        const gain=sum*sum/count+(total-sum)**2/right-total*total/n;
        if(gain>best.gain)best={gain,feature:j,threshold:list[k],left:sum/count*rate,right:(total-sum)/right*rate};}}
    if(!best.gain)break;trees.push(best);
    for(let i=0;i<n;i++)prediction[i]+=matrix[i*f+best.feature]<=best.threshold?best.left:best.right;
  }
  return {identities,trees,learningRate:rate,kind:"boosted-stump residual over market table"};
}
export function directPoint(model,row,count=model.trees.length){let value=tablePoint(model.table,row);const x=features(row,model.table,model.identities);
  for(let i=0;i<Math.min(count,model.trees.length);i++){const tree=model.trees[i];value+=x[tree.feature]<=tree.threshold?tree.left:tree.right;}
  return Math.max(0,value);
}
export const distance=(row,prediction)=>Math.max(0,row.low-prediction,prediction-row.high);
export function calibrate(rows,predict){const shift=quantile(rows.map(r=>(r.low+r.high)/2-predict(r)),0.5);
  return {shift,lower:quantile(rows.map(r=>r.low-Math.max(0,predict(r)+shift)),0.1),upper:quantile(rows.map(r=>r.high-Math.max(0,predict(r)+shift)),0.9)};
}
export function band(raw,cal){const point=Math.max(0,raw+cal.shift),low=Math.max(0,point+cal.lower);return {point,low,high:Math.max(low,point+cal.upper)};}
