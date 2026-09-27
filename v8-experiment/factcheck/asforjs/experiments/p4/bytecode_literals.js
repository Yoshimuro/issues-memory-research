function lits(x) { let a = 0; let b = 0.0; let c = 1.0; let d = -0; let e = NaN; let f = 5; let g = x + 7; let h = 0.5; return [a,b,c,d,e,f,g,h]; }
function destrArr(arr) { const [a, b] = arr; return a + b; }
function destrObj(arr) { const {0: a, 1: b} = arr; return a + b; }
function destrIdx(arr) { const a = arr[0], b = arr[1]; return a + b; }
lits(1); destrArr([1,2]); destrObj([1,2]); destrIdx([1,2]);
