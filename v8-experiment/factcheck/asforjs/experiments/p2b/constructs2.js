function ifChain(v){ let r; if (v === 1) { r = 10; } else if (v === 2) { r = 20; } else { r = 30; } return r; }
function sw(v){ let r; switch (v) { case 1: r = 10; break; case 2: r = 20; break; default: r = 30; } return r; }
function swFall(v){ let r; switch (v) { case 1: r = 10; case 2: r = 20; break; default: r = 30; } return r; }
function swBig(v){ switch (v) { case 0: return 10; case 1: return 11; case 2: return 12; case 3: return 13; case 4: return 14; case 5: return 15; case 6: return 16; case 7: return 17; } return 0; }
function ifBool(b){ if (b) return 1; return 2; }
function ifStrict(b){ if (b === 1) return 1; return 2; }
function andTern(x){ return x & 1 ? x : 0; }
function modIf(x){ if (x % 2) return x; return 0; }
function objLit(){ return { a: 1, b: 2 }; }
function objLitComputed(k){ return { a: 1, [k]: 2 }; }
function Ctor(name){ this.name = name; }
class Cls { constructor(name){ this.name = name; } }
class ClsPriv { #secret; constructor(name){ this.name = name; this.#secret = name; } getS(){ return this.#secret; } }
function reflectGet(obj){ return Reflect.get(obj, 0); }
function directGet(obj){ return obj[0]; }
function instOf(x){ return x instanceof Promise; }
function optCall(x){ return x?.then?.(); }
function newPromise(){ return new Promise(function executor(res){ res(1); }); }
function nPlus1(n){ return n + 1; }
function deadConst(x){ const unused = 5; return x; }
function fold(){ return 1 + 1; }
function noFold(){ const a = 1; return a + 1; }
function brackets(o){ return o["name"]; }
function afterReturn(x){ return x; x = x + 1; console.log(x); }
function loopSmall(){ let s = 0; for (let i = 0; i < 4; i++) s += i; return s; }
function shr(x){ return x >> 1; }
function div(x){ return x / 2; }
function consoleUse(){ console.log(1); }
function negZero(x){ return x * -0; }
function posZero(x){ return x * 0; }
ifChain(1); sw(1); swFall(1); swBig(3); ifBool(1); ifStrict(1); andTern(3); modIf(3); objLit(); objLitComputed('z'); new Ctor('a'); new Cls('a'); new ClsPriv('a').getS(); reflectGet([1]); directGet([1]); instOf(1); optCall(null); newPromise(); nPlus1(1); deadConst(1); fold(); noFold(); brackets({name:1}); afterReturn(1); loopSmall(); shr(4); div(4); negZero(1); posZero(1);
