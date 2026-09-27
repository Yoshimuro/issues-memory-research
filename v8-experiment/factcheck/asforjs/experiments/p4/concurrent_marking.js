// allocate enough old-generation data to trigger incremental/concurrent marking
const keep = []; for (let i = 0; i < 3e6; i++) { keep.push({ a: i, b: [i] }); if (keep.length > 1e6) keep.splice(0, 5e5); }
