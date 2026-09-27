const log = typeof print === 'function' ? print : console.log;
function info(name, a) { log(`${name}: holey=${%HasHoleyElements(a)} smi=${%HasSmiElements(a)} dbl=${%HasDoubleElements(a)} dict=${%HasDictionaryElements(a)}`); }
for (const n of [5, 1000, 100000, 1e6]) {
  info(`new Array(${n})`, new Array(n));
  info(`new Array(${n}).fill(0)`, new Array(n).fill(0));
  info(`new Array(${n}).fill(0.5)`, new Array(n).fill(0.5));
  info(`new Array(${n}).fill(0,1)`, new Array(n).fill(0, 1));
  info(`Array.from({length:${n}},()=>0)`, Array.from({ length: n }, () => 0));
}
