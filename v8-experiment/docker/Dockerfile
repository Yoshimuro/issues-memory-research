# Лаборатория доклада «V8 для самых маленьких». Единственный источник чисел для слайдов.
# Среда как в проде: node:<версия>-alpine (musl). Версия пиннится точным тегом.
#   docker build --build-arg NODE_TAG=24.21.0-alpine -t v8-talk-lab:24 docker
#   docker build --build-arg NODE_TAG=22.23.2-alpine -t v8-talk-lab:22 docker
ARG NODE_TAG=24.21.0-alpine
FROM node:${NODE_TAG}
# bash + coreutils: verify.sh использует declare -A и mktemp --suffix (в busybox их нет)
RUN apk add --no-cache bash coreutils && npm install -g autocannon@8
WORKDIR /work
CMD ["bash"]
