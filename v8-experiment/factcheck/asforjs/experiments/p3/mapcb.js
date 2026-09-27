const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const arr = Array.from({length: 1000}, (_, i) => i);
function double(x){ return x * 2; }
function withArrow(){ let s=0; for (let r=0;r<20000;r++){ const m = arr.map(x => x * 2); s += m[r % 1000]; } return s; }
function withNamed(){ let s=0; for (let r=0;r<20000;r++){ const m = arr.map(double); s += m[r % 1000]; } return s; }
withArrow(); withNamed();
for (let i=0;i<3;i++){ let t=now(); withArrow(); const a=now()-t; t=now(); withNamed(); const b=now()-t; log(`rep${i} arrow=${a.toFixed(1)} named=${b.toFixed(1)} named/arrow=${(b/a).toFixed(2)}`); }
let lit='{'; for(let i=0;i<300;i++) lit+=`"p${i}":${i},`; lit=lit.slice(0,-1)+'}'; log('JSON.parse 300 keys fast?', %HasFastProperties(JSON.parse(lit)));
let lit2='{'; for(let i=0;i<120;i++) lit2+=`"p${i}":${i},`; lit2=lit2.slice(0,-1)+'}'; log('JSON.parse 120 keys fast?', %HasFastProperties(JSON.parse(lit2)));
