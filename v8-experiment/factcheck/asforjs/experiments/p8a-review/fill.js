const log = typeof print === 'function' ? print : console.log;
for (const n of [5, 1000, 100000, 1000000]) {
  const a = new Array(n).fill(0); const b = new Array(n).fill(1.5); const c = new Array(n).fill('x');
  log(`n=${n} fill(0) holey=${%HasHoleyElements(a)} smi=${%HasSmiElements(a)} | fill(1.5) holey=${%HasHoleyElements(b)} dbl=${%HasDoubleElements(b)} | fill('x') holey=${%HasHoleyElements(c)}`);
}
const p = new Array(10); p.fill(0, 0, 9); log('fill(0,0,9) of 10 holey=' + %HasHoleyElements(p));
