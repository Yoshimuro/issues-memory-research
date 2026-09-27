const log = typeof print === 'function' ? print : console.log;
const smallDict = {a:1,b:2,c:3,d:4}; delete smallDict.a; log('smallDict dict', !%HasFastProperties(smallDict));
log('assign({}, smallDict(3 props), {x,y}) fast?', %HasFastProperties(Object.assign({}, smallDict, {x:1,y:2})));
let lit='({'; for(let i=0;i<100;i++) lit+=`p${i}:${i},`; lit+='})'; const fast100 = eval(lit); log('fast100 fast', %HasFastProperties(fast100));
log('assign({}, fast100) fast?', %HasFastProperties(Object.assign({}, fast100)));
const dict100={}; for(let i=0;i<100;i++) dict100['q'+i]=i; log('dict100 dict', !%HasFastProperties(dict100));
log('assign({}, dict100) fast?', %HasFastProperties(Object.assign({}, dict100)));
