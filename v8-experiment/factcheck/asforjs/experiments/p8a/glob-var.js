var t0 = Date.now(); var s = 0;
for (var i = 0; i < 1e8; i++) { s = (s + (i & 7)) | 0; }
print('global var: ' + (Date.now() - t0) + ' ms ' + s);
