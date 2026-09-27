const f = process.argv[2]; const t = process.hrtime.bigint(); const m = require(f); const dt = Number(process.hrtime.bigint() - t) / 1e6; console.log(dt.toFixed(3));
