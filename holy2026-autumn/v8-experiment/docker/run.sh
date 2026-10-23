#!/bin/bash
# ./docker/run.sh [24|22] [команда]   — без команды: bash внутри. Репо монтируется в /work.
set -e
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd "$(dirname "$0")/.." || exit 1
V=24; case "${1:-}" in 22|24) V=$1; shift;; esac
case "$V" in
  24) NODE_TAG=24.21.0-alpine;;
  22) NODE_TAG=22.23.2-alpine;;
esac
docker image inspect v8-talk-lab:$V >/dev/null 2>&1 || docker build --build-arg NODE_TAG="$NODE_TAG" -t v8-talk-lab:$V docker
if [ $# -eq 0 ]; then exec docker run --rm -it --cpus 2 -v "$PWD":/work v8-talk-lab:$V bash; fi
exec docker run --rm --cpus 2 -v "$PWD":/work v8-talk-lab:$V bash -c "$*"
