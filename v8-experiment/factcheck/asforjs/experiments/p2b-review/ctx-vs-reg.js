// Doc line 327: "всё со словом Context/ContextSlot ... заметно медленнее регистра". Amplified: 8 reads per iteration.
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function mkCtx(){ var a = 1, b = 2, c = 3, d = 4; function ctx(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c + d + a + b + c + d) | 0; } return s; } return ctx; }
function mkDeep(){ var a = 1, b = 2, c = 3, d = 4; return function mid(){ let z = 0; const keep = () => z; return function deep(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c + d + a + b + c + d) | 0; } return s; }; }; }
function reg(n){ var a = 1, b = 2, c = 3, d = 4; let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c + d + a + b + c + d) | 0; } return s; }
const fns = { reg, ctx: mkCtx(), deep: mkDeep()() };
const N = 5e6, R = 7, res = {};
for (const k in fns) res[k] = [];
for (let r = 0; r < R; r++) for (const k in fns) { const t0 = now(); fns[k](N); res[k].push(now() - t0); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k in res) print(k.padEnd(5), 'median', med(res[k]).toFixed(1), 'ms ratio_vs_reg', (med(res[k]) / med(res.reg)).toFixed(3), ' all', res[k].map(x => x.toFixed(0)).join('/'));
