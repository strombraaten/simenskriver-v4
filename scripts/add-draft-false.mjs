#!/usr/bin/env node
// One-off migration: adds `draft: false` to posts that have no `draft:` field.
// Posts with any existing `draft:` value are left untouched.
//
// Usage:
//   node scripts/add-draft-false.mjs           # apply changes
//   node scripts/add-draft-false.mjs --dry-run # preview only

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const DRY_RUN = process.argv.includes('--dry-run');

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

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

  let modified = 0;
  let skippedHasDraft = 0;
  let skippedNoFrontmatter = 0;

  for (const file of files.sort()) {
    const rel = path.relative(POSTS_DIR, file);
    const raw = await fs.readFile(file, 'utf8');
    const match = raw.match(FRONTMATTER_RE);

    if (!match) {
      console.log(`SKIP (no frontmatter)  ${rel}`);
      skippedNoFrontmatter++;
      continue;
    }

    if (/^draft:/m.test(match[1])) {
      skippedHasDraft++;
      continue;
    }

    console.log(`ADD draft: false       ${rel}`);
    modified++;

    if (!DRY_RUN) {
      const newRaw = raw.replace(/^---(\r?\n)/, `---$1draft: false$1`);
      await fs.writeFile(file, newRaw, 'utf8');
    }
  }

  console.log('');
  console.log(DRY_RUN ? '=== DRY RUN — no files written ===' : '=== DONE ===');
  console.log(`  Modified:                 ${modified}`);
  console.log(`  Skipped (draft exists):   ${skippedHasDraft}`);
  console.log(`  Skipped (no frontmatter): ${skippedNoFrontmatter}`);
  if (DRY_RUN && modified > 0) {
    console.log('\nRun without --dry-run to apply changes.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
