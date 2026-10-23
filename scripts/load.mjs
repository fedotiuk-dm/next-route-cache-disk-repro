// Visits PAGES distinct pages in order, ROUNDS times, like a crawler walking a sitemap, and prints
// the cache verdicts and the server's memory after a forced GC once per round.
const BASE = process.env.BASE ?? "http://localhost:3100";
const PAGES = Number(process.env.PAGES ?? 200);
const ROUNDS = Number(process.env.ROUNDS ?? 10);
const MB = (bytes) => Math.round(bytes / 1048576);

async function memory() {
  const m = await (await fetch(`${BASE}/api/memory`)).json();
  return `heapUsed=${MB(m.heapUsed)}MB arrayBuffers=${MB(m.arrayBuffers)}MB rss=${MB(m.rss)}MB`;
}

console.log(`start ${await memory()}`);
for (let round = 1; round <= ROUNDS; round += 1) {
  const verdicts = {};
  const started = Date.now();
  for (let i = 0; i < PAGES; i += 1) {
    const response = await fetch(`${BASE}/p/page-${i}`);
    await response.arrayBuffer();
    const verdict = response.headers.get("x-nextjs-cache") ?? "rendered (no x-nextjs-cache)";
    verdicts[verdict] = (verdicts[verdict] ?? 0) + 1;
  }
  console.log(`round ${round}: ${JSON.stringify(verdicts)} ${Date.now() - started}ms ${await memory()}`);
}
