function work(n) { let s = 0; const a = []; for (let i = 0; i < n; i++) { a.push({x: i, y: String(i)}); s = (s + a[i].x + a[i].y.length) & 0xffffff; } return s; }
const t = Date.now(); let r = 0; for (let k = 0; k < 20; k++) r += work(2e5); print('time=' + (Date.now() - t) + 'ms ' + r);
