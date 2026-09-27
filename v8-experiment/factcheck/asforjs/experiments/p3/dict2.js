const log = typeof print === 'function' ? print : console.log;
const MODE = typeof process!=='undefined' ? process.argv[2] : (typeof arguments!=='undefined'? arguments[0]:'');
function run(){ const o={}; let first='never'; for(let i=0;i<200;i++){ o['p'+i]=i; if(first==='never' && !%HasFastProperties(o)) first=i+1; } return [first, %HasFastProperties(o)]; }
function runNoCheck(){ const o={}; for(let i=0;i<200;i++){ o['p'+i]=i; } return %HasFastProperties(o); }
const h={}; for(let i=0;i<100;i++) h['p'+i]=i; log('top-level 100 keyed fast?', %HasFastProperties(h));
log('fn noCheck 200 keyed fast?', runNoCheck());
log('fn with check [firstSlow, fastAtEnd]', JSON.stringify(run()));
const h2={}; for(let i=0;i<100;i++) h2['q'+i]=i; log('top-level 100 keyed (new names q) fast?', %HasFastProperties(h2));
const h3={}; for(let i=0;i<1000;i++) h3['r'+i]=i; log('top-level 1000 keyed fast?', %HasFastProperties(h3));
const h4={}; for(let i=0;i<2000;i++) h4['s'+i]=i; log('top-level 2000 keyed fast?', %HasFastProperties(h4));
