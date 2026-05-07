import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "../config";
import { shouldShowPost, postUrl } from "../utils/markdown";

// Helper function to normalize siteUrl - ensure it ends with a single slash
function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, '') + '/';
}

export const GET: APIRoute = async () => {
  const siteUrl = normalizeSiteUrl(import.meta.env.SITE || siteConfig.site);

  const posts = await getCollection("posts");
  const isDev = import.meta.env.DEV;

  // Exclude drafts and noIndex posts (home, 404, contact, privacy-policy, thank-you)
  const visiblePosts = posts.filter(
    (post) => shouldShowPost(post, isDev) && !post.data.noIndex
  );

  // Generate URLs
  const urls: string[] = [];

  // Homepage
  urls.push(`
    <url>
      <loc>${siteUrl}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `);

  // Individual posts — all at root level via postUrl()
  visiblePosts.forEach((post) => {
    const slug = postUrl(post).slice(1); // strip leading slash; siteUrl already ends with /
    urls.push(`
      <url>
        <loc>${siteUrl}${slug}/</loc>
        <lastmod>${post.data.date.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
    `);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
