function before() { const g = function readBefore() { return v; }; let v = 1; return g; }
function after() { let v = 1; return function readAfter() { return v; }; }
before()(); after()();
