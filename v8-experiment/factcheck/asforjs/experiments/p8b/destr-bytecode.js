function arrPat(arr) { const [a, b] = arr; return a + b; }
function objPat(arr) { const {0: a, 1: b} = arr; return a + b; }
function arrPat3(arr) { const [a, , c] = arr; return a + c; }
function paramObj({x, y}) { return x + y; }
function restObj(o) { const {...rest} = o; return rest; }
function restObjEx(o) { const {a, ...rest} = o; return rest; }
arrPat([1,2]); objPat([1,2]); arrPat3([1,2,3]); paramObj({x:1,y:2}); restObj({a:1}); restObjEx({a:1,b:2});
