// Where do literal JSArray and its elements live? Uses %DebugPrint + %InYoungGeneration.
function lit() { return [1, 2, 3]; }
function dlit() { return [1.5, 2.5, 3.5]; }
function oblit() { return [{}, 'x', 1]; }
for (const [name, f] of [['smi literal', lit], ['double literal', dlit], ['object literal', oblit]]) {
  for (let call = 1; call <= 3; call++) {
    const a = f();
    print(`=== ${name} call ${call}: JSArray young=${%InYoungGeneration(a)}`);
    %DebugPrint(a);
  }
}
const n = new Array(3); n[0] = 1;
print(`=== new Array: JSArray young=${%InYoungGeneration(n)}`); %DebugPrint(n);
