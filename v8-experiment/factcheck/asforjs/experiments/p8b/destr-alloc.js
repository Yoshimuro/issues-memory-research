// count scavenges during array-destructuring loop vs object-pattern loop (tuple created outside)
const print = globalThis.print || console.log;
const which = (globalThis.arguments && globalThis.arguments[0]) || process.argv[2];
const n = +((globalThis.arguments && globalThis.arguments[1]) || process.argv[3]);
const pair = [1, 2];
function useStateLike() { return pair; }
function arrPat() { const [v, set] = useStateLike(); return v + set; }
function objPat() { const {0: v, 1: set} = useStateLike(); return v + set; }
const f = which === 'arr' ? arrPat : objPat;
let s = 0; for (let i = 0; i < n; i++) s = (s + f()) | 0;
print(which + ' done ' + s);
