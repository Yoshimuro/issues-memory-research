// When is the feedback vector allocated? (lazy feedback allocation)
function doF(o) { return o.x + 1 }
const log = typeof print === 'function' ? print : console.log;
for (let i = 1; i <= 40; i++) {
  doF({ x: i });
  if ([1, 2, 4, 7, 8, 9, 10, 12, 16, 24, 32, 40].includes(i)) {
    log(`--- after ${i} calls`);
    %DebugPrint(doF);
  }
}
