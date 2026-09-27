# 3 rounds x 20 runs each, wall time per run in ms
for r in 1 2 3; do
for e in "/tmp/claude-0/-home-user-issues-memory-research/dacf359b-9898-588d-b8f1-20fd1e3f2945/scratchpad/d8/rel/d8" "/opt/node22/bin/node" "/opt/nvm/versions/node/v24.21.0/bin/node"; do
  s=$(date +%s%N); for i in $(seq 20); do $e empty.js >/dev/null; done; t=$(date +%s%N)
  echo "round $r $(basename $(dirname $(dirname $e)))/$(basename $e): $(( (t-s)/20000000 )) ms/run"
done; done
