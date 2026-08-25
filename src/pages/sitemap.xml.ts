import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://wwwd-theta.vercel.app');
  const entries = await getCollection('entries', ({ data }) => data.status === 'published');
  const urls = [
    '/',
    '/investigations/',
    '/notes/',
    ...entries.map((entry) =>
      entry.data.contentType === 'Investigation'
        ? `/investigations/${entry.id}/`
        : `/notes/${entry.id}/`,
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = new URL(path, base).href;
    return `  <url>
    <loc>${loc}</loc>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
