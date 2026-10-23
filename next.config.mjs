/** @type {import('next').NextConfig} */
export default {
  cacheComponents: true,
  partialPrefetching: true,
  // MEMORY_CACHE_MB=0 keeps no page in the in-memory LRU, so a hit can only come from disk.
  ...(process.env.MEMORY_CACHE_MB && {
    cacheMaxMemorySize: Number(process.env.MEMORY_CACHE_MB) * 1024 * 1024,
  }),
};
