#!/usr/bin/env node
// One-off migration: renames `slug:` → `permalink:` in post frontmatter.
// Posts that already have a non-empty `permalink` are left unchanged.
// Posts with neither slug nor permalink are skipped (still reachable at /posts/<id>).
//
// Usage:
//   node scripts/migrate-slug-to-permalink.mjs           # apply changes
//   node scripts/migrate-slug-to-permalink.mjs --dry-run # preview only

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const DRY_RUN = process.argv.includes('--dry-run');

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function extractFrontmatterValue(frontmatter, key) {
  const re = new RegExp(`^${key}:[^\\S\\n]*(.+)$`, 'm');
  const match = frontmatter.match(re);
  return match ? match[1].trim() : null;
}

function hasNonEmptyField(frontmatter, key) {
  const value = extractFrontmatterValue(frontmatter, key);
  return value !== null && value !== '';
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full)));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await collectFiles(POSTS_DIR);

  let migrated = 0;
  let skippedHasPermalink = 0;
  let skippedNoSlug = 0;

  const rows = [];

  for (const file of files.sort()) {
    const rel = path.relative(POSTS_DIR, file);
    const raw = await fs.readFile(file, 'utf8');
    const match = raw.match(FRONTMATTER_RE);

    if (!match) {
      rows.push({ rel, action: 'SKIP (no frontmatter)', slug: '', permalink: '' });
      skippedNoSlug++;
      continue;
    }

    const fm = match[1];

    // Already has permalink — leave it
    if (hasNonEmptyField(fm, 'permalink')) {
      const existing = extractFrontmatterValue(fm, 'permalink');
      rows.push({ rel, action: 'SKIP (permalink exists)', slug: '', permalink: existing });
      skippedHasPermalink++;
      continue;
    }

    const slugValue = extractFrontmatterValue(fm, 'slug');
    if (!slugValue) {
      rows.push({ rel, action: 'SKIP (no slug)', slug: '', permalink: '' });
      skippedNoSlug++;
      continue;
    }

    rows.push({ rel, action: 'MIGRATE', slug: slugValue, permalink: slugValue });
    migrated++;

    if (!DRY_RUN) {
      // Replace `slug: <value>` with `permalink: <value>` in the frontmatter block
      const newFm = fm.replace(/^slug:(.+)$/m, `permalink:$1`);
      const newRaw = raw.replace(match[1], newFm);
      await fs.writeFile(file, newRaw, 'utf8');
    }
  }

  // Print table
  const colW = [Math.max(8, ...rows.map(r => r.rel.length)), 28, 30, 30];
  const header = ['file', 'action', 'slug → (removed)', 'permalink (set)'];
  const sep = colW.map(w => '-'.repeat(w)).join('-+-');
  const fmt = row => [row.rel, row.action, row.slug, row.permalink]
    .map((v, i) => v.padEnd(colW[i])).join(' | ');

  console.log('');
  console.log(DRY_RUN ? '=== DRY RUN — no files written ===' : '=== APPLYING CHANGES ===');
  console.log('');
  console.log(fmt({ rel: header[0], action: header[1], slug: header[2], permalink: header[3] }));
  console.log(sep);
  for (const row of rows) console.log(fmt(row));
  console.log('');
  console.log(`Summary: ${migrated} migrated, ${skippedHasPermalink} skipped (permalink exists), ${skippedNoSlug} skipped (no slug/no frontmatter)`);
  console.log('');

  if (DRY_RUN && migrated > 0) {
    console.log('Run without --dry-run to apply these changes.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
