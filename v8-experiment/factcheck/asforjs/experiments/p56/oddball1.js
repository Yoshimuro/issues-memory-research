// Are true/false/undefined/null/'' one object?  d8 --allow-natives-syntax oddball1.js
for (const v of [true, false, undefined, null, '']) { print('#### ' + JSON.stringify(v)); %DebugPrint(v); }
