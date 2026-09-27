// Does optimized code (Maglev/TurboFan) change flat-vs-cons for short results?
function t(s){ return %DebugPrint(s); }
function add3(a, b) { return a + ' ' + b; }
function add2(a, b) { return a + b; }
const m = 'мурыч', h = 'хмурыч';
%PrepareFunctionForOptimization(add3); %PrepareFunctionForOptimization(add2);
for (let i = 0; i < 20; i++) { add3(m, m); add2(m, h); }
print('--- interpreted add3 (11)'); t(add3(m, m));
print('--- interpreted add2 (11)'); t(add2(m, h));
if (globalThis.MAGLEV) {
  %OptimizeMaglevOnNextCall(add3); %OptimizeMaglevOnNextCall(add2);
  add3(m, m); add2(m, h);
  print('--- maglev add3 status ' + %GetOptimizationStatus(add3).toString(2)); t(add3(m, m));
  print('--- maglev add2'); t(add2(m, h));
}
%OptimizeFunctionOnNextCall(add3); %OptimizeFunctionOnNextCall(add2);
add3(m, m); add2(m, h);
print('--- turbofan add3 status ' + %GetOptimizationStatus(add3).toString(2)); t(add3(m, m));
print('--- turbofan add2'); t(add2(m, h));
print('--- turbofan add3 with 13-char result'); t(add3('мурыч', 'мурычхм'));
