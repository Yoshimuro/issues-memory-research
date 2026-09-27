const print = globalThis.print || console.log;
const a = {x: 1, y: 2, z: 3}; delete a.x; print('delete first prop -> fast properties: ' + %HasFastProperties(a));
const b = {x: 1, y: 2, z: 3}; delete b.z; print('delete last-added prop -> fast properties: ' + %HasFastProperties(b));
const c = {x: 1, y: 2}; Object.setPrototypeOf(c, {p: 1}); print('setPrototypeOf -> fast: ' + %HasFastProperties(c) + ', same map as {x,y}: ' + %HaveSameMap(c, {x: 1, y: 2}));
const d = {x: 1}; d.y = 2; print('added key later vs literal {x,y} same map: ' + %HaveSameMap(d, {x: 1, y: 2}));
