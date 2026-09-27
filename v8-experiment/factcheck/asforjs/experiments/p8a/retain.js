// Does a closure retain a big array it does NOT mention, if a sibling closure mentions it?
function makeNoMention() { const big = new Array(1e6).fill(1); const ref = new WeakRef(big); const keep = () => 1; return { keep, ref }; }
function makeSiblingMentions() { const big = new Array(1e6).fill(1); const ref = new WeakRef(big); const other = () => big.length; other(); const keep = () => 1; return { keep, ref }; }
function makeMentions() { const big = new Array(1e6).fill(1); const ref = new WeakRef(big); const keep = () => big.length; return { keep, ref }; }
async function main() {
  const r = {};
  for (const [n, f] of Object.entries({ makeNoMention, makeSiblingMentions, makeMentions })) r[n] = f();
  await new Promise(res => setTimeout(res, 0)); gc(); await new Promise(res => setTimeout(res, 0)); gc();
  for (const [n, o] of Object.entries(r)) console.log(`${n}: big alive = ${o.ref.deref() !== undefined} (keep() = ${o.keep()})`);
}
main();
