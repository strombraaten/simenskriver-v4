/**
 * Migrates content from simenskriver-v3 to v4.
 *
 * Run from the v4 repo root:
 *   node scripts/migrate-v3.mjs
 *
 * Add --dry-run to preview without writing files.
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const DRY_RUN = process.argv.includes('--dry-run');
const __dirname = dirname(fileURLToPath(import.meta.url));

const V3_CONTENT = '/Users/simenstrombraaten/dev/blog/simenskriver-v3/content';
const V4_POSTS   = join(__dirname, '../src/content/posts');
const V4_IMAGES  = join(V4_POSTS, 'attachments');

const SKIP_EXTENSIONS = new Set(['.mp4', '.mov', '.canvas', '.json', '.css', '.js', '.DS_Store']);
const SKIP_FILES      = new Set(['index.md']);

const stats = { images: 0, posts: 0, skipped: 0, conflicts: [] };

// ── Helpers ────────────────────────────────────────────────────────────────

function log(msg) { console.log(msg); }

function ensureDir(dir) {
  if (!DRY_RUN) mkdirSync(dir, { recursive: true });
}

/** Walk a directory recursively and yield file paths. */
function* walkFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else {
      yield full;
    }
  }
}

// ── Frontmatter parser/transformer ────────────────────────────────────────

/**
 * Parse raw frontmatter string into key/value lines (preserving arrays).
 * Returns { meta: string[], body: string } where meta is the lines between ---.
 */
function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: null, body: content };
  return { meta: match[1], body: match[2] };
}

/**
 * Transform v3 frontmatter text into v4 frontmatter text.
 * isUtkast: file came from the Utkast/ folder (not private/).
 * isPrivate: file is under Utkast/private/ — always draft.
 * publishValue: parsed value of the `publish` field from v3.
 */
function transformFrontmatter(metaText, { isUtkast, isPrivate }) {
  const lines = metaText.split('\n');
  const out = [];
  let publishValue = null;

  for (const line of lines) {
    // Capture and remove `publish` field
    if (/^publish:\s*(true|false)/.test(line)) {
      publishValue = /^publish:\s*true/.test(line);
      continue;
    }
    // Remove old `type` field (e.g. type: notat)
    if (/^type:\s/.test(line)) continue;
    // Rename lastmod → lastModified
    if (/^lastmod:\s/.test(line)) {
      out.push(line.replace(/^lastmod:/, 'lastModified:'));
      continue;
    }
    out.push(line);
  }

  // Determine draft status
  if (isPrivate) {
    out.push('draft: true');
  } else if (publishValue === false) {
    out.push('draft: true');
  }
  // publishValue === true → no draft field needed (default is published)

  // Add type: utkast for Utkast folder (not private, not unpublished)
  if (isUtkast && !isPrivate && publishValue !== false) {
    out.push('type: utkast');
  }

  return out.join('\n');
}

// ── Image reference fixer ──────────────────────────────────────────────────

function fixImageRefs(body) {
  // ![[images/foo.png]] → ![[attachments/foo.png]]
  return body.replace(/!\[\[images\//g, '![[attachments/');
}

// ── Step 1: Copy images ────────────────────────────────────────────────────

log('\n── Step 1: Copying images ───────────────────────────────────────────');
ensureDir(V4_IMAGES);

const v3ImagesDir = join(V3_CONTENT, 'images');
if (existsSync(v3ImagesDir)) {
  for (const srcPath of walkFiles(v3ImagesDir)) {
    const filename = basename(srcPath);
    const destPath = join(V4_IMAGES, filename);

    if (existsSync(destPath)) {
      log(`  skip (exists): ${filename}`);
      stats.skipped++;
      continue;
    }

    log(`  copy image: ${filename}`);
    if (!DRY_RUN) copyFileSync(srcPath, destPath);
    stats.images++;
  }
} else {
  log(`  WARNING: ${v3ImagesDir} not found`);
}

// ── Step 2: Copy and transform markdown files ─────────────────────────────

log('\n── Step 2: Migrating posts ──────────────────────────────────────────');
ensureDir(V4_POSTS);

const SOURCE_FOLDERS = [
  { dir: join(V3_CONTENT, 'Notater'),      isUtkast: false },
  { dir: join(V3_CONTENT, 'Oppslagsverk'), isUtkast: false },
  { dir: join(V3_CONTENT, 'Tanker'),       isUtkast: false },
  { dir: join(V3_CONTENT, 'Utkast'),       isUtkast: true  },
];

for (const { dir, isUtkast } of SOURCE_FOLDERS) {
  if (!existsSync(dir)) {
    log(`  WARNING: ${dir} not found, skipping`);
    continue;
  }

  for (const srcPath of walkFiles(dir)) {
    const filename = basename(srcPath);
    const ext      = extname(srcPath).toLowerCase();
    const relPath  = srcPath.replace(dir + '/', '');
    const isPrivate = isUtkast && relPath.startsWith('private/');

    // Skip non-markdown and explicitly excluded files
    if (ext !== '.md' && ext !== '.mdx') {
      if (!SKIP_EXTENSIONS.has(ext) && filename !== '.DS_Store') {
        log(`  skip (non-text): ${filename}`);
      }
      stats.skipped++;
      continue;
    }
    if (SKIP_FILES.has(filename)) {
      log(`  skip (excluded): ${filename}`);
      stats.skipped++;
      continue;
    }

    // Parse frontmatter to check publish status (skip unpublished non-private files)
    const raw     = readFileSync(srcPath, 'utf-8');
    const { meta, body } = splitFrontmatter(raw);
    const publishMatch = meta ? meta.match(/^publish:\s*(true|false)/m) : null;
    const publishValue  = publishMatch ? publishMatch[1] === 'true' : null;

    // Non-Utkast unpublished → skip
    if (!isUtkast && publishValue === false) {
      log(`  skip (unpublished): ${filename}`);
      stats.skipped++;
      continue;
    }
    // Utkast non-private unpublished → include as draft
    // Utkast private → always include as draft

    const destPath = join(V4_POSTS, filename);

    if (existsSync(destPath)) {
      log(`  CONFLICT: ${filename} already exists — skipping, check manually`);
      stats.conflicts.push({ src: srcPath, dest: destPath });
      continue;
    }

    let newMeta;
    if (meta) {
      newMeta = transformFrontmatter(meta, { isUtkast, isPrivate });
    } else {
      // No frontmatter in source — create a minimal one for private/utkast files
      newMeta = isPrivate ? 'draft: true' : (isUtkast ? 'type: utkast' : null);
    }
    const newBody = fixImageRefs(body);
    const output  = newMeta !== null
      ? `---\n${newMeta}\n---\n${newBody}`
      : newBody;

    log(`  ${isPrivate ? 'draft(private)' : isUtkast ? 'utkast' : 'post'}: ${filename}`);
    if (!DRY_RUN) writeFileSync(destPath, output, 'utf-8');
    stats.posts++;
  }
}

// ── Summary ────────────────────────────────────────────────────────────────

log('\n── Done ─────────────────────────────────────────────────────────────');
log(`  Images copied : ${stats.images}`);
log(`  Posts migrated: ${stats.posts}`);
log(`  Skipped       : ${stats.skipped}`);
if (stats.conflicts.length > 0) {
  log(`\n  CONFLICTS (${stats.conflicts.length}) — resolve manually:`);
  for (const { src } of stats.conflicts) log(`    ${src}`);
}
if (DRY_RUN) log('\n  (dry run — no files written)');
