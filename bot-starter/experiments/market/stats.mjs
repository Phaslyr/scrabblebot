export const mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
export function interval(a){const m=mean(a),v=mean(a.map(x=>(x-m)**2))*a.length/Math.max(1,a.length-1),d=1.96*Math.sqrt(v/Math.max(1,a.length));
  return {mean:m,interval95:[m-d,m+d],independentBags:a.length};}
export function group(rows,key){const m=new Map();for(const r of rows){const k=key(r);if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return m;}
