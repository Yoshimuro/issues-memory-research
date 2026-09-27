const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
class P { constructor(x, y) { this.x = x; this.y = y; } }
function F(x, y) { this.x = x; this.y = y; }
const keep = [];
function mkLit(n) { let s = 0; for (let i = 0; i < n; i++) { const o = { x: i, y: 1 }; if ((i & 0xFFFFF) === 0) keep.push(o); s += o.x; } return s; }
function mkCls(n) { let s = 0; for (let i = 0; i < n; i++) { const o = new P(i, 1); if ((i & 0xFFFFF) === 0) keep.push(o); s += o.x; } return s; }
function mkFn(n) { let s = 0; for (let i = 0; i < n; i++) { const o = new F(i, 1); if ((i & 0xFFFFF) === 0) keep.push(o); s += o.x; } return s; }
function t(f) { f(1e5); f(1e5); const a = now(); f(1e7); return (now() - a).toFixed(1); }
for (let r = 0; r < 3; r++) log(`rep${r}: literal ${t(mkLit)} | class ${t(mkCls)} | function-ctor ${t(mkFn)}`);
