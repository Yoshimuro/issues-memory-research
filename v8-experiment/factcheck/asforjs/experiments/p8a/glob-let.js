let t0 = Date.now(); let s = 0;
for (let i = 0; i < 1e8; i++) { s = (s + (i & 7)) | 0; }
print('global let: ' + (Date.now() - t0) + ' ms ' + s);
