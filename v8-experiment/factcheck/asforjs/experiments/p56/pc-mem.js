// Heap after full GC for a pointer-heavy structure. Compare d8 (pointer compression ON) vs node24 (OFF).
// <engine> --expose-gc --trace-gc pc-mem.js   -> read "Mark-Compact A -> B MB" of the last forced GCs
var out = (typeof print === 'function') ? print : console.log;
gc(); out('--- baseline gc done');
var keep = [];
for (var i = 0; i < 1e6; i++) keep.push({ a: i, b: null, c: [i, i + 1], d: { x: i } });
gc(); out('--- after build gc done ' + keep.length);
