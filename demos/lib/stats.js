export function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

export function fmt(xs) {
  return `${mean(xs).toFixed(1)} ± ${stddev(xs).toFixed(1)} ms (n=${xs.length})`;
}
