const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const arr = Array.from({length: 1000}, (_, i) => i);
function double(x){ return x * 2; }
const doubleConst = x => x * 2;
function withArrow(){ let s=0; for (let r=0;r<20000;r++){ const m = arr.map(x => x * 2); s += m[r % 1000]; } return s; }
function withNamedDecl(){ let s=0; for (let r=0;r<20000;r++){ const m = arr.map(double); s += m[r % 1000]; } return s; }
function withNamedConst(){ let s=0; for (let r=0;r<20000;r++){ const m = arr.map(doubleConst); s += m[r % 1000]; } return s; }
function withLocalNamed(){ function d(x){ return x*2; } let s=0; for (let r=0;r<20000;r++){ const m = arr.map(d); s += m[r % 1000]; } return s; }
const cases = {withArrow, withNamedDecl, withNamedConst, withLocalNamed};
for (const f of Object.values(cases)) f();
for (let i=0;i<3;i++){ const out=[]; for (const [n,f] of Object.entries(cases)){ const t=now(); f(); out.push(`${n}=${(now()-t).toFixed(1)}`); } log('rep'+i, out.join(' ')); }
