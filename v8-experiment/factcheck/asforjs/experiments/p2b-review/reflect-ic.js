// (a) doc 366: Reflect.get(obj, 0) "заметно дороже" прямого доступа. (b) doc 414: interpreted code gets "только оптимизации генератора и число инструкций" -> does IC state matter in Ignition?
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function viaReflect(o){ return Reflect.get(o, 0); }
function viaDirect(o){ return o[0]; }
function getX(o){ return o.x; }
function getX2(o){ return o.x; }
const arr = [1, 2, 3];
const mono = [{x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5}, {x: 6}, {x: 7}, {x: 8}];
const mega = []; for (let i = 0; i < 8; i++) { const o = {}; o['p' + i] = i; o.x = i; mega.push(o); }
function loopR(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + viaReflect(arr)) | 0; return s; }
function loopD(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + viaDirect(arr)) | 0; return s; }
function loopMono(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + getX(mono[i & 7])) | 0; return s; }
function loopMega(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + getX2(mega[i & 7])) | 0; return s; }
const fns = { loopR, loopD, loopMono, loopMega };
const N = 3e6, R = 5, res = {};
for (const k in fns) res[k] = [];
for (let r = 0; r < R; r++) for (const k in fns) { const t0 = now(); fns[k](N); res[k].push(now() - t0); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k in res) print(k.padEnd(9), 'median', med(res[k]).toFixed(1), 'ms  all', res[k].map(x => x.toFixed(0)).join('/'));
print('reflect/direct', (med(res.loopR) / med(res.loopD)).toFixed(2), ' mega/mono', (med(res.loopMega) / med(res.loopMono)).toFixed(2));
