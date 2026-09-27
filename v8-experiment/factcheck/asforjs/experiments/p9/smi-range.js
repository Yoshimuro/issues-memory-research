// Which values are Smi on this engine? Values come from Number(string) (no double-array boxing)
const log = typeof console !== 'undefined' ? console.log : print;
for (const s of ['1073741823','1073741824','-1073741824','-1073741825','2147483647','2147483648','-2147483648','-2147483649']) {
  const v = Number(s);
  log(s.padStart(12), 'IsSmi=', %IsSmi(v));
}
