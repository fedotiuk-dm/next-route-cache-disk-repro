#!/usr/bin/env bash
# Renders ten pages, restarts the server, and asks for them again: the second process finds every
# page in the filesystem cache on disk. MEMORY_CACHE_MB is passed through to next.config.mjs.
set -euo pipefail
start() { (nohup pnpm start > server.log 2>&1 &); for _ in $(seq 60); do curl -sf localhost:3100/api/memory >/dev/null && return; sleep 0.5; done; }
stop() { fuser -k 3100/tcp >/dev/null 2>&1 || true; sleep 1; }
verdicts() { for i in $(seq 0 9); do curl -s -o /dev/null -D - "localhost:3100/p/restart-$1-$i" | tr -d '\r' | awk -F': ' 'tolower($1)=="x-nextjs-cache"{v=$2} END{print (v=="" ? "rendered" : v)}'; done | sort | uniq -c | tr '\n' ' '; echo; }
stop; rm -rf .next; pnpm build >/dev/null
tag=$RANDOM
start; echo -n "first process, first visit:   "; verdicts $tag
echo -n "first process, second visit:  "; verdicts $tag
stop; start; echo -n "second process, same pages:   "; verdicts $tag
ls .next/server/route-cache/APP_PAGE/*/\$/p/ | grep -c "restart-$tag-.*\.html" | sed 's/^/pages on disk: /'
stop
