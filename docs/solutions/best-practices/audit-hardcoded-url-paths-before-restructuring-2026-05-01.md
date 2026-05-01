---
title: Audit hardcoded URL paths before restructuring routes in Astro Modular
date: 2026-05-01
category: docs/solutions/best-practices/
module: Routing
problem_type: best_practice
component: tooling
severity: high
applies_when:
  - Considering a URL structure change (e.g. /posts/slug → /slug)
  - Moving a content collection to a different route prefix
  - Merging two route handlers into one
tags: [routing, url-structure, astro, astro-modular, refactoring, grep]
---

# Audit hardcoded URL paths before restructuring routes in Astro Modular

## Context

When evaluating a URL restructuring change — for example, moving posts from `/posts/slug` to a flat `/slug` to achieve cleaner URLs — there is a strong temptation to treat it as a simple routing change: move or extend a route file and call it done. In Astro Modular this is misleading, because the route prefix is hardcoded in many layers of the stack, not just the route file.

This came up when exploring flat URLs for a blog (simenskriver.no/eksempel vs simenskriver.no/posts/eksempel). Grepping for `/posts/` revealed 60+ references spread across the entire codebase before any code was written.

## Guidance

Before committing to any URL path restructuring, run a grep across the full source tree and scripts:

```sh
grep -rn "/posts/" src/ scripts/ --include="*.ts" --include="*.astro" --include="*.mjs" --include="*.js"
```

Then categorize every hit into one of three buckets:

| Bucket | Examples | Action |
|---|---|---|
| **Post URLs** (must change) | `PostCard.astro`, `PostLayout.astro`, `index.astro`, `internallinks.ts` | Update each reference |
| **Image/asset paths** (leave alone) | `/posts/attachments/`, `public/posts/` | These are filesystem paths for static files — independent of routing |
| **Tag/pagination URLs** (leave alone) | `/posts/tag/`, `/posts/2` | Archive pages — not individual post URLs |

Only proceed if the "must change" bucket is small enough to justify the work.

## Why This Matters

In Astro Modular, the URL prefix is not a single config value. It is replicated in:

- **Components**: `PostCard`, `PostContent`, `LinkedMentions`, `GraphModal`, `LocalGraph`, `Tags`, `ImageGallery`
- **Layouts**: `PostLayout`, `BaseLayout`, `ProjectLayout`
- **Pages**: `index.astro`, `posts/index.astro`, `posts/[page].astro`, tag pages
- **Utils**: `internallinks.ts` (wikilink resolver, ~15 occurrences), `seo.ts`, `images.ts`, `remark-inline-tags.ts`, `remark-obsidian-embeds.ts`
- **Build scripts**: `generate-graph-data.js`, `generate-deployment-config.js`, `process-aliases.js`
- **API**: `api/posts.json.ts`

The most dangerous file is `src/utils/internallinks.ts`. It is the Obsidian wikilink resolver that runs at build time and converts `[[Note]]` syntax to HTML links. It hardcodes `/posts/` in ~15 places. Errors here produce silently broken links across all markdown content — no build error, just dead URLs in production.

## When to Apply

- Before any route prefix change, collection merge, or URL restructuring
- When evaluating whether a URL design is worth implementing vs choosing the right structure from the start
- When onboarding to an Astro Modular project and assessing refactor scope

## Examples

**Scope audit for changing `/posts/slug` → `/slug`:**

```sh
# Run this first, before writing any code
grep -rn "/posts/" src/ scripts/ --include="*.ts" --include="*.astro" --include="*.js" | wc -l
# If this returns > 20, the refactor touches the entire stack — reconsider
```

**The right time to choose flat URLs is at project start**, before any components reference the prefix. Once the site is live or the codebase matures, the cost of changing the prefix usually exceeds the aesthetic benefit.

**If flat URLs are still desired**, the safest approach is to extract the post URL prefix into a single constant and reference it everywhere:

```ts
// src/utils/urls.ts
export const POST_BASE = ''; // Change this once to restructure all post URLs
export const postUrl = (slug: string) => `${POST_BASE}/${slug}`;
```

Then use `postUrl(post.id)` throughout the codebase instead of template literals. This makes future restructuring a one-line change.

## Related

- `src/utils/internallinks.ts` — wikilink resolver, highest-risk file for URL restructuring
- `src/pages/posts/[...slug].astro` — the route file for individual posts
- `src/pages/[...slug].astro` — the root catch-all (handles `pages` collection)
