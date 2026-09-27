// эмит tsc (target ES2020 + useDefineForClassFields) vs присваивание: стоимость конструктора
const print = globalThis.print || console.log;
class PDefine { constructor(x, y) { Object.defineProperty(this, "x", { enumerable: true, configurable: true, writable: true, value: 0 }); Object.defineProperty(this, "y", { enumerable: true, configurable: true, writable: true, value: 0 }); this.x = x; this.y = y; } }
class PAssign { constructor(x, y) { this.x = 0; this.y = 0; this.x = x; this.y = y; } }
class PField { x = 0; y = 0; constructor(x, y) { this.x = x; this.y = y; } }
const N = 5e6;
for (let rep = 0; rep < 4; rep++) { const out = []; for (const C of [PDefine, PAssign, PField]) { const t = Date.now(); let s = 0; for (let i = 0; i < N; i++) { const p = new C(i, 1); s = (s + p.x + p.y) & 0xffff; } out.push(C.name + '=' + (Date.now() - t) + 'ms(' + s + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
