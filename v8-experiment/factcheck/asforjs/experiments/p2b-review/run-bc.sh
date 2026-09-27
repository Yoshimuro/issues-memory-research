#!/bin/bash
# usage: run-bc.sh script.js "fn1 fn2" [engines...]; prints filtered bytecode
. /home/user/issues-memory-research/v8-experiment/factcheck/asforjs/experiments/p2b-review/engines.sh
S=$1; NAMES=$2; shift 2
ENG=${ENG:-"node20:$N20 node22:$N22 node24:$N24 d8:$D8"}
for e in $ENG; do n=${e%%:*}; b=${e#*:}
 for f in $NAMES; do echo "=============== $n :: $f"
  $b --print-bytecode --print-bytecode-filter="$f" "$@" $S 2>&1 | grep -E '^ *[0-9]* *[SE]?>? *0x[0-9a-f]+ @' | sed -E 's/^.*@ +[0-9]+ : ([0-9a-f]{2} )+ *//'
 done; done
