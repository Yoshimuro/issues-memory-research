function restf({...r}){ return r; }
function pat({name, age}){ return age; }
function brA(o){ return o['a']; }
function br0(o){ return o['0']; }
function dotA(o){ return o.a; }
function glob(){ return globalThis.Math ? Math : 0; }
restf({a:1}); pat({name:1, age:2}); brA({a:1}); br0([1]); dotA({a:1}); glob();
