#!/bin/bash
N=/opt/nvm/versions/node/v24.21.0/bin/node
for rep in 1 2 3; do for lim in 130 160 250 2000; do
  out=$($N --max-old-space-size=$lim --trace-gc gc-vs-limit.js 2>&1)
  sc=$(echo "$out" | grep -c 'Scavenge'); mc=$(echo "$out" | grep -c 'Mark-Compact')
  mcms=$(echo "$out" | grep 'Mark-Compact' | sed -E 's/.*MB, (pooled: [0-9.]+ MB, )?([0-9.]+) \/.*/\2/' | awk '{s+=$1} END {printf "%.0f", s}')
  scms=$(echo "$out" | grep 'Scavenge' | sed -E 's/.*MB, (pooled: [0-9.]+ MB, )?([0-9.]+) \/.*/\2/' | awk '{s+=$1} END {printf "%.0f", s}')
  echo "rep $rep limit ${lim}MB: scavenges $sc (${scms} ms), mark-compacts $mc (${mcms} ms) $(echo "$out" | grep -o 'done.*\|heap out of memory' | head -1)"
done; done
