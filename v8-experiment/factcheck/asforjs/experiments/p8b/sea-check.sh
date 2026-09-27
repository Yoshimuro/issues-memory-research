# Does Node's single-executable-application config support embedding V8 code cache?
for n in /opt/node22/bin/node /opt/nvm/versions/node/v24.21.0/bin/node /opt/node20/bin/node; do echo "== $n"; $n --help | grep -i -A1 "experimental-sea-config\|build-snapshot" | head -6; done
