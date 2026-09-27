// Summary item 5 (line 32), line 111: uncalled function has no bytecode (CompileLazy)
function neverCalled(a) { return a * 2; }
function called(a) { return a * 2; }
called(1);
%DebugPrint(neverCalled);
print('-----');
%DebugPrint(called);
