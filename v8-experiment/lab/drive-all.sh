#!/usr/bin/env bash
set -uo pipefail
export PATH=/opt/node24-local/bin:/opt/node22/bin:$PATH
cd /root/v8-experiment/lab
echo "driver start: node=$(node -v) claude=$(which claude)"
echo "===== BRANCH 1/4: P1 no-rules ====="
./run-experiment.sh -n 15 -p prompts/P1.txt -o out/p1-no-rules -m opus
echo "===== BRANCH 2/4: P1 rules ====="
./run-experiment.sh -n 15 -p prompts/P1.txt -o out/p1-rules -r v8-rules.md -m opus
echo "===== BRANCH 3/4: P2 no-rules ====="
./run-experiment.sh -n 15 -p prompts/P2.txt -o out/p2-no-rules -m opus
echo "===== BRANCH 4/4: P2 rules ====="
./run-experiment.sh -n 15 -p prompts/P2.txt -o out/p2-rules -r v8-rules.md -m opus
echo "ALL_BRANCHES_DONE"
