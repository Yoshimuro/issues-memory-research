// Is a string literal inside a never-called (lazily compiled) function present in the heap
// as its own string object? Checked via a heap snapshot's string table (exact matches).
// The probe strings are assembled only AFTER the snapshot is written, so the probe itself
// cannot put them into the heap before the snapshot.
const v8 = require('v8');
const topLevel = 'TOPLEVEL_LITERAL_q7w8e9';
function neverCalled() { return 'LAZY_LITERAL_z1x2c3'; }
function calledOnce() { return 'CALLED_LITERAL_r4t5y6'; }
if (process.argv[2] === 'call') neverCalled();
calledOnce();
const file = v8.writeHeapSnapshot(require('os').tmpdir() + '/lazy-' + process.pid + '.heapsnapshot');
const snap = JSON.parse(require('fs').readFileSync(file, 'utf8'));
const S = new Set(snap.strings);
const probes = [['TOPLEVEL', 'q7w8e9'], ['LAZY', 'z1x2c3'], ['CALLED', 'r4t5y6']].map(([a, b]) => [a, '_LITERAL_', b].join(''));
probes.push(['DataView', 'prototype', 'setFloat32'].join('.'));
for (const s of probes) console.log(s.padEnd(32), 'exact string in snapshot:', S.has(s));
require('fs').unlinkSync(file);
