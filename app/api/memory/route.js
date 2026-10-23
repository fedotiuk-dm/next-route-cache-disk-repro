import { connection } from "next/server";

export async function GET() {
  await connection();
  globalThis.gc?.();
  globalThis.gc?.();
  const { rss, heapUsed, arrayBuffers } = process.memoryUsage();
  return Response.json({ rss, heapUsed, arrayBuffers });
}
