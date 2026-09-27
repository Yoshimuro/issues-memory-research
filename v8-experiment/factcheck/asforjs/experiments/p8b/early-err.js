console.log('top-level statement executed');
function never() { function deeper() { function deepest() { const z1 = 1; let z1 = 2; } } }
