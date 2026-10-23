# Route cache entries on disk are never read back (Cache Components)

With `cacheComponents: true`, a page rendered at request time is written to
`.next/server/route-cache/APP_PAGE/<id>/$/...` (`.html`, `.meta`, `.segments`), but the server never
answers from that entry. A page is served as a `HIT` only while it sits in the in-memory LRU; once
the LRU evicts it, or after a restart, it is rendered again although its entry is still on disk.

`app/p/[slug]/page.jsx` names only a placeholder slug in `generateStaticParams`, so every real slug
renders on its first request, as on a CMS site whose pages are unknown at build time. Each page is
about 320 KB of HTML (non-Latin-1 text).

```bash
pnpm install

# 1. Restart: ten pages rendered and cached, the server restarted, the same ten pages asked again.
./scripts/restart-check.sh

# 2. LRU eviction: pages visited in order, round after round, like a crawler walking a sitemap.
pnpm build && pnpm start          # other terminal:
PAGES=60  ROUNDS=3 pnpm load      # fits the default 50 MB LRU: HIT from round 2
PAGES=120 ROUNDS=3 pnpm load      # does not fit: every request renders, every round
ls .next/server/route-cache/APP_PAGE/*/\$/p/ | grep -c '\.html$'   # all of them are on disk
```

`MEMORY_CACHE_MB=<n>` sets `cacheMaxMemorySize` for a build and start (`MEMORY_CACHE_MB=0
./scripts/restart-check.sh` shows the same restart result).
