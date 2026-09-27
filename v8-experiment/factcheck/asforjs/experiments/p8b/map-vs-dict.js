// dynamic string keys: Map vs plain object (becomes dictionary mode) — insert+lookup+delete workload
const print = globalThis.print || console.log;
const keys = []; for (let i = 0; i < 5000; i++) keys.push('k' + i);
function withMap() { const m = new Map(); for (const k of keys) m.set(k, 1); let s = 0; for (const k of keys) s += m.get(k); for (let i = 0; i < keys.length; i += 2) m.delete(keys[i]); return s + m.size; }
function withObj() { const o = {}; for (const k of keys) o[k] = 1; let s = 0; for (const k of keys) s += o[k]; for (let i = 0; i < keys.length; i += 2) delete o[keys[i]]; return s + Object.keys(o).length; }
function withObjNoKeys() { const o = {}; for (const k of keys) o[k] = 1; let s = 0; for (const k of keys) s += o[k]; for (let i = 0; i < keys.length; i += 2) delete o[keys[i]]; return s; }
function withMapNoSize() { const m = new Map(); for (const k of keys) m.set(k, 1); let s = 0; for (const k of keys) s += m.get(k); for (let i = 0; i < keys.length; i += 2) m.delete(keys[i]); return s; }
{ const o = {}; for (const k of keys) o[k] = 1; print('object with 5000 dynamic keys is dictionary: ' + !%HasFastProperties(o)); }
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [withMapNoSize, withObjNoKeys]) { const t = Date.now(); let c = 0; for (let r = 0; r < 300; r++) c += f(); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
