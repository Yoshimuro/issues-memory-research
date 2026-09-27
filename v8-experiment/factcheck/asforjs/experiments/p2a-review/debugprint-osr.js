// Function optimized only via OSR: what does %DebugPrint show?
function doLoop(n) { let s = 0; for (let i = 0; i < n; i++) s += i; %DebugPrint(doLoop); return s }
doLoop(3e6);
