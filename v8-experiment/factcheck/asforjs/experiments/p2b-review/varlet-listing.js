// Doc line 331: var -> LdaCurrentContextSlot; let -> LdaCurrentContextSlot + ThrowReferenceErrorIfHole; const -> LdaImmutableContextSlot + check.
// Case A: nothing reassigned. Case B: var/let reassigned by the inner function (typical summator that accumulates into outer vars).
function outerA(){ var vv = 1; let vl = 2; const vc = 3; function addA(){ return vv + vl + vc; } return addA; }
function outerB(){ var vv = 1; let vl = 2; const vc = 3; function addB(){ vv = vv + 1; vl = vl + 1; return vv + vl + vc; } return addB; }
function outerC(){ var vv = 1; let vl = 2; const vc = 3; const addC = () => vv + vl + vc; return addC; }
// depth 1: inner of inner
function outerD(){ var vv = 1; let vl = 2; const vc = 3; return function mid(){ return function addD(){ return vv + vl + vc; }; }; }
outerA()(); outerB()(); outerC()(); outerD()()();
