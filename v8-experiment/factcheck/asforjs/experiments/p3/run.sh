#!/bin/bash
# usage: run.sh script.js [extra flags]  -> runs on all engines, prints sections
S=$1; shift
D=/tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/d8
for e in node20:/opt/node20/bin/node node22:/opt/node22/bin/node node24:/opt/nvm/versions/node/v24.21.0/bin/node d8rel:$D/rel/d8 d8dbg:$D/dbg/d8; do
  n=${e%%:*}; b=${e#*:}
  [ -n "$ONLY" ] && [[ ! " $ONLY " == *" $n "* ]] && continue
  echo "===== $n ====="
  if [[ $n == d8* ]]; then timeout 300 $b --allow-natives-syntax "$@" $S 2>&1; else timeout 300 $b --allow-natives-syntax "$@" $S 2>&1; fi
done
