import { cacheLife } from "next/cache";

// Only a placeholder at build: every real slug renders on its first request and is kept by the
// incremental cache, like a CMS site whose pages are not known at build time.
export function generateStaticParams() {
  return [{ slug: "_" }];
}

async function body(slug) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  // About 60 KB of non-Latin-1 text per page, a typical Ukrainian article.
  const paragraph = `Хімчистка ${slug}: чистимо пальта, костюми, сукні та пуховики. `;
  return Array.from({ length: 120 }, (_, i) => `${i}. ${paragraph.repeat(8)}`);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const paragraphs = await body(slug);
  return (
    <main>
      <h1>{slug}</h1>
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </main>
  );
}
