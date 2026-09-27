// Calls until Maglev / TurboFan for a tiny function (tier-up thresholds per version).
const log = typeof console !== 'undefined' ? console.log : print;
function tiny(v) { return v + 1; }
let firstMaglev = -1, firstTF = -1;
for (let i = 1; i <= 60000; i++) {
  tiny(i);
  const s = %GetOptimizationStatus(tiny);
  if (firstMaglev < 0 && (s & 32)) firstMaglev = i;   // kMaglevved (bit 5) in 11.3-13.6
  if (firstTF < 0 && (s & 64)) { firstTF = i; break; } // kTurboFanned (bit 6)
}
log(`first Maglev call=${firstMaglev} first TurboFan call=${firstTF}`);
