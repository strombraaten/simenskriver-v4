# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Simen Skriver** — a personal blog and digital garden built on the [Astro Modular](https://astro-modular.netlify.app/) theme. Uses [Vault CMS](https://docs.vaultcms.org/guides/introduction/) to set up a tailored Obsidian writing environment: content is authored in Obsidian and pushed directly to the repo via the Obsidian Git plugin, triggering Vercel deploys automatically. Deployed on **Vercel**; domain (`simenskriver.no`) is registered and managed via **GoDaddy**. Content lives in `src/content/` as Markdown/MDX; wikilinks, embeds, callouts, and other Obsidian syntax are processed by custom remark/rehype plugins at build time. Newsletter distribution is handled by **Buttondown** via RSS-to-email: new posts are picked up automatically from the site's RSS feed.

## ⚠ Workflow Safety

Before making changes, consider whether they could break either of these two systems:

**Astro Modular theme compatibility**
- This project tracks the upstream [Astro Modular](https://astro-modular.netlify.app/) theme. Avoid changes that deviate heavily from the theme's conventions — they risk creating merge conflicts or broken upgrades when pulling in future upstream updates.
- Prefer configuration-based customisation (via `src/config.ts`) over modifying theme internals directly.

**Obsidian → Git → Vercel authoring workflow**
- Content is written in Obsidian and pushed to the repo via the Obsidian Git plugin, triggering Vercel deploys automatically. [Vault CMS](https://docs.vaultcms.org/guides/introduction/) configures this environment.
- Do NOT change: content folder structure (`src/content/`), frontmatter field names/types, wikilink/embed syntax handling, or image paths — these are tightly coupled to what Obsidian and Vault CMS expect.
- Do NOT rename or restructure the `scripts/` pipeline steps that run before the Astro build (image sync, alias processing, graph generation) — the Obsidian workflow depends on these.

**Buttondown RSS-to-email newsletter**
- New posts are automatically distributed as newsletters via Buttondown pulling the site's RSS feed. Do NOT change the RSS feed URL path, post URL structure, or remove/rename frontmatter fields used in the feed (`title`, `description`, `date`) — Buttondown depends on these.

If a proposed change risks any of the above, flag it explicitly before proceeding.

## Commands

```sh
pnpm dev        # Dev server at http://localhost:5000 (runs setup, image sync, alias processing, graph generation first)
pnpm build      # Full production build (same pre-steps + Astro build)
pnpm preview    # Build then preview locally
```

Utility scripts (also run automatically as part of dev/build):

```sh
pnpm sync-images              # Sync images from Obsidian vault
pnpm process-aliases          # Resolve Obsidian wikilink aliases
pnpm generate-graph-data      # Rebuild knowledge graph JSON
pnpm generate-deployment-config  # Write Netlify/Vercel/Cloudflare/GH Pages config
pnpm check-images             # Validate image references
```

No test runner or linter is configured.

## Architecture

### Content Pipeline

```
src/content/{posts,pages,projects,docs,special}/
  └─ .md / .mdx files
       │
       ├─ Zod validation (src/content.config.ts)
       ├─ Remark plugins (Obsidian syntax, embeds, image sizing, wikilinks, callouts, math, TOC, reading time)
       ├─ Rehype plugins (slug anchors, image attributes)
       └─ Astro layouts → static HTML output
```

Content collections and their schemas are defined in `src/content.config.ts`. All frontmatter fields have defaults or are optional — nothing is strictly required. Common fields across collections: `title` (defaults to "Untitled"), `description`, `draft` (boolean, omits from production), `image`, `noIndex`. The `posts` collection also uses `date`, `tags`, `hideTOC`/`showTOC`.

### Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | ~2700-line central config — all feature toggles, nav, SEO, theme presets |
| `astro.config.mjs` | Astro + MDX + Tailwind + Swup + all remark/rehype plugin wiring |
| `src/content.config.ts` | Content collection schemas |
| `tailwind.config.mjs` | Tailwind with dynamic theme colors via CSS custom properties |
| `vite.config.mjs` | Build optimisation and minification |
| `docs/solutions/` | Documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`) |

### Component Hierarchy

- **Layouts** (`src/layouts/`): `BaseLayout`, `PostLayout`, `DocumentationLayout`, `ProjectLayout`, `PageLayout`
- **Cards** (`src/components/`): `PostCard`, `ProjectCard`, `DocumentationCard`
- **Interactive** (`src/components/`): `CommandPalette` (Ctrl+K, Fuse.js), `ThemeSelector`, `GraphModal` / `LocalGraph` (D3), `Lightbox`
- **Structural**: `Header`, `Footer`, `DocsSidebar`, `Navigation`

### Build Scripts

All live in `scripts/` (project root) as Node.js `.js` / `.mjs` files. They run before Astro and produce artifacts consumed at build time (graph JSON, deployment config files, processed alias map).

### Theming

15+ built-in themes in `src/themes/`. Themes are CSS custom property sets; `tailwind.config.mjs` maps Tailwind color tokens to those properties. The active theme is set in `src/config.ts`.

### Path Aliases

`@/` → `src/`, plus `@/components`, `@/layouts`, `@/utils`, `@/config` (see `tsconfig.json`).

## Working with Content

- New **posts** go in `src/content/posts/` as `.md` or `.mdx`. The Obsidian vault root **is** `src/content/` — point Obsidian directly at that directory.
- Obsidian-style wikilinks (`[[Note]]`) and embeds (`![[image.png]]`) are resolved at build time by the custom remark plugins.
- Images go in `src/content/<collection>/attachments/`. `pnpm sync-images` copies them to `public/<collection>/attachments/` where Astro can serve them (runs automatically on `pnpm dev`/`pnpm build`).
- After renaming notes or adding aliases, run `pnpm process-aliases`.
- Set `draft: true` in frontmatter to exclude a post from production builds.
- The active deployment platform is set in `src/config.ts` under `deployment.platform` (values: `netlify`, `vercel`, `github-pages`, `cloudflare-workers`). `pnpm generate-deployment-config` writes the matching platform config file.
