// compile+run time of a script with many declarations: var vs let vs const (top-level and inside functions)
const print = globalThis.print || console.log;
const vm = typeof require === 'function' ? require('vm') : null;
function make(kw, n, inFn) {
  let src = inFn ? 'function wrap(){' : '';
  for (let i = 0; i < n; i++) src += kw + ' v' + i + ' = ' + i + ';\n';
  for (let i = 0; i < n; i += 97) src += 'v' + i + ';\n';
  src += inFn ? '} wrap();' : '';
  return src;
}
function time(src) { const t = Date.now(); vm ? new vm.Script(src).runInNewContext({}) : Realm.eval(Realm.create(), src); return Date.now() - t; }
for (const inFn of [false, true]) for (let rep = 0; rep < 3; rep++) { const out = []; for (const kw of ['var', 'let', 'const']) out.push(kw + '=' + time(make(kw, 100000, inFn)) + 'ms'); print((inFn ? 'in-function ' : 'top-level   ') + 'rep' + rep + ' ' + out.join(' ')); }
