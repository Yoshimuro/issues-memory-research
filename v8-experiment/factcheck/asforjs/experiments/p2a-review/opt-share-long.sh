#!/bin/sh
# Share of compiled functions reaching Maglev/TurboFan on longer-running real workloads (node24); same method as ../p2a/opt-share.sh
N=/opt/nvm/versions/node/v24.21.0/bin/node
TSC=/opt/node22/lib/node_modules/typescript/bin/tsc
PRETTIER=/opt/node22/lib/node_modules/prettier/bin/prettier.cjs
run() {
  name=$1; shift
  s=$(date +%s.%N)
  $N --log-function-events --no-logfile-per-isolate --logfile=/tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-fe.log --trace-opt "$@" > /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-opt.txt 2>&1
  e=$(date +%s.%N)
  comp=$(grep -E "^function,(interpreter|interpreter-lazy)," /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-fe.log | awk -F, '{print $3","$4","$5}' | sort -u | wc -l)
  opt=$(grep -E "^\[completed compiling" /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-opt.txt | grep -oE "sfi = 0x[0-9a-f]+" | sort -u | wc -l)
  tf=$(grep -E "^\[completed compiling" /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-opt.txt | grep -E "TURBOFAN" | grep -oE "sfi = 0x[0-9a-f]+" | sort -u | wc -l)
  echo "$name: wall=$(echo "$e - $s" | bc) s; compiled=$comp, optimized(Maglev|TF)=$opt, TurboFan=$tf, share=$(echo "scale=3; $opt*100/$comp" | bc)%"
}
run "tsc --noEmit typescript.d.ts (copy in scratch)" $TSC --ignoreConfig --noEmit /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-work/typescript.d.ts
run "prettier format copy of prettier index.cjs" $PRETTIER --no-config /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2ar-work/chunk.js --log-level=warn
