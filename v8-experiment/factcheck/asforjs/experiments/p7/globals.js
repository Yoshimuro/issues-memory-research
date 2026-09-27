const names = Object.getOwnPropertyNames(globalThis);
print('count', names.length);
const std = new Set(['Object','Function','Array','Number','parseFloat','parseInt','Infinity','NaN','undefined','Boolean','String','Symbol','Date','Promise','RegExp','Error','AggregateError','EvalError','RangeError','ReferenceError','SyntaxError','TypeError','URIError','globalThis','JSON','Math','Intl','ArrayBuffer','Atomics','Uint8Array','Int8Array','Uint16Array','Int16Array','Uint32Array','Int32Array','Float32Array','Float64Array','Uint8ClampedArray','BigUint64Array','BigInt64Array','DataView','Map','BigInt','Set','WeakMap','WeakSet','Proxy','Reflect','FinalizationRegistry','WeakRef','decodeURI','decodeURIComponent','encodeURI','encodeURIComponent','escape','unescape','eval','isFinite','isNaN','SharedArrayBuffer','WebAssembly','Iterator','Float16Array','console','Temporal','DisposableStack','AsyncDisposableStack','SuppressedError']);
print('non-std:', names.filter(n=>!std.has(n)).join(' '));
setTimeout(()=>print('timeout callback'), 1000);
print('after setTimeout (script end)');
print('arguments:', typeof arguments !== 'undefined' ? JSON.stringify(Array.from(arguments)) : 'none');
