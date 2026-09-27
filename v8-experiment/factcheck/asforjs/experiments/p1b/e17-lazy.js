// Uncalled functions get no bytecode (lazy compilation); the called one does.
function doCalled() { return 1 + 2; }
function doNeverCalled() { return 3 + 4; }
doCalled();
