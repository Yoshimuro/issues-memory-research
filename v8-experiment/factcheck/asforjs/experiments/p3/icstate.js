const log = typeof print === 'function' ? print : console.log;
const dictObj = {}; for (let i=0;i<100;i++) dictObj['p'+i] = i;
log('dictObj fast?', %HasFastProperties(dictObj));
function getP(o){ return o.p5; }
for (let i=0;i<10;i++) getP(dictObj);
log('### feedback getP (dictionary receiver)'); %DebugPrint(getP);
log('### dict object map'); %DebugPrint(dictObj);
function getQ(o){ return o.q; }
const a = {q: {x:1}}; for (let i=0;i<1000;i++) getQ(a); a.q = null; getQ(a); a.q = undefined; getQ(a);
log('### feedback getQ after value null/undefined'); %DebugPrint(getQ);
function useQ(o){ const v = o.q; return v == null ? 0 : v.x; }
const b = {q: {x:1}}; for (let i=0;i<1000;i++) useQ(b); b.q = null; useQ(b); b.q = undefined; useQ(b);
log('### feedback useQ'); %DebugPrint(useQ);
