// Which string sizes go to large-object space? (%InLargeObjectSpace)
const out = (typeof print === 'function') ? print : console.log;
for (const [enc, ch] of [['one-byte', 'a'], ['two-byte', 'я']]) {
  for (const n of [60000, 65535, 65536, 66000, 131000, 131072, 132000]) {
    const s = ch.repeat(n - 1) + String.fromCharCode(ch.charCodeAt(0) + (n % 2));
    const f = JSON.parse(JSON.stringify(s));  // fresh flat sequential string
    out(`${enc} length ${n}: large-object space = ${%InLargeObjectSpace(f)} (flat seq: ${%InYoungGeneration(f) !== undefined}}`);
  }
}
