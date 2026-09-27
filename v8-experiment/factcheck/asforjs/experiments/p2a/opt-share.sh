#!/bin/sh
# Share of functions that reach an optimizing tier, for a few real workloads (node24).
# compiled = distinct SFIs with bytecode compiled ("interpreter" / "interpreter-lazy" function events);
# optimized = distinct SFIs with "completed compiling ... (target MAGLEV|TURBOFAN...)" in --trace-opt.
N=/opt/nvm/versions/node/v24.21.0/bin/node
NPM=/opt/nvm/versions/node/v24.21.0/lib/node_modules/npm/bin/npm-cli.js
DIR=$(dirname "$0")
run() {
  name=$1; shift
  $N --log-function-events --no-logfile-per-isolate --logfile=/tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2a-fe.log --trace-opt "$@" > /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2a-opt.txt 2>&1
  comp=$(grep -E "^function,(interpreter|interpreter-lazy)," /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2a-fe.log | awk -F, '{print $3","$4","$5}' | sort -u | wc -l)
  opt=$(grep -E "^\[completed compiling" /tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/p2a-opt.txt | grep -oE "sfi = 0x[0-9a-f]+" | sort -u | wc -l)
  echo "$name: functions compiled to bytecode=$comp, functions optimized (Maglev/TurboFan)=$opt"
}
run "npm --version" $NPM --version
run "npm help" $NPM help
run "var-vs-let-parse.js (hot synthetic loop)" $DIR/var-vs-let-parse.js
