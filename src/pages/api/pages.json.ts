import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { shouldShowPost } from "@/utils/markdown";

// Returns non-draft, non-noIndex posts for use in the command palette "pages" search.
// The pages collection no longer exists — all content lives in the posts collection.
// Utility pages (about, contact, etc.) have noIndex: true and are excluded.
export const GET: APIRoute = async () => {
  try {
    const posts = await getCollection("posts");
    const isDev = import.meta.env.DEV;
    const visiblePosts = posts.filter((post) => shouldShowPost(post, isDev) && !post.data.noIndex);

    const result = visiblePosts.map((post) => ({
      id: post.id,
      title: post.data.title,
      description: post.data.description || "",
      url: "/" + ((post.data.permalink ?? post.id) as string).replace(/^\//, "") + "/",
      type: "page" as const,
      lastModified: (post.data as any).lastModified?.toISOString(),
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch pages" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
