import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "../config";
import { postUrl } from "../utils/markdown";

// Helper function to normalize siteUrl - ensure it ends with a single slash
function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, '') + '/';
}

export const GET: APIRoute = async () => {
  const siteUrl = normalizeSiteUrl(import.meta.env.SITE || siteConfig.site);
  const posts = await getCollection("posts", ({ data }) => {
    return !data.draft;
  });

  // Sort posts by date (newest first)
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  // Generate Atom feed XML
  const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${siteConfig.title}</title>
  <subtitle>${siteConfig.description}</subtitle>
  <link href="${siteUrl}"/>
  <link href="${siteUrl}feed.xml" rel="self"/>
  <id>${siteUrl}</id>
  <author>
    <name>${siteConfig.author}</name>
  </author>
  <updated>${new Date().toISOString()}</updated>

  ${sortedPosts
    .map(
      (post) => `
  <entry>
    <title>${post.data.title}</title>
    <link href="${siteUrl}${postUrl(post).slice(1)}/"/>
    <!-- id is kept on the old /posts/ form so feed readers don't treat entries as new -->
    <id>${siteUrl}posts/${(post as any).id}/</id>
    <published>${new Date(post.data.date).toISOString()}</published>
    <updated>${new Date(post.data.date).toISOString()}</updated>
    <summary>${post.data.description || ""}</summary>
    ${
      post.data.tags
        ? post.data.tags.map((tag) => `<category term="${tag}"/>`).join("")
        : ""
    }
  </entry>`
    )
    .join("")}
</feed>`;

  return new Response(atomFeed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
};
