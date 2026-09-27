var counter = 0; globalThis.gx = 1;
function f(o){ counter = counter + gx; return o.a; }
f({a:1}); f({b:1,a:2}); f({c:1,a:3});
