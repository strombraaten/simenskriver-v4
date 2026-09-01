#!/usr/bin/env node

// Generates branded Open Graph images (logo + post title) for posts that
// don't provide their own custom OG image (image + imageOG in frontmatter).
// Also regenerates the site-wide default OG image (public/open-graph.png)
// used for the homepage, tag pages, and other pages without a custom image.

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const isDev = process.env.NODE_ENV !== 'production';
const log = {
  info: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const COLORS = {
  background: '#101013',
  foreground: '#fcfcfc',
  accent: '#32cd99',
};

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public/og');
const DEFAULT_OG_PATH = path.join(process.cwd(), 'public/open-graph.png');
const SITE_LOGO_PATH = path.join(process.cwd(), 'src/components/SiteLogo.astro');

// Extract the raw <path> elements from the SiteLogo.astro wordmark SVG
// so they can be re-composited at arbitrary sizes/colors in raster output.
async function getLogoPaths() {
  const source = await fs.readFile(SITE_LOGO_PATH, 'utf-8');
  const paths = [...source.matchAll(/<path[^>]*d="[^"]*"[^>]*\/>/g)].map((m) => m[0]);
  if (paths.length === 0) {
    throw new Error(`No <path> elements found in ${SITE_LOGO_PATH}`);
  }
  return paths.join('\n');
}

function logoSvg(width, color) {
  const height = Math.round(width * (400 / 1696));
  const paths = getLogoPathsCache.replace(/currentColor/g, color);
  return { markup: `<svg width="${width}" height="${height}" viewBox="0 0 1696 400" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`, height };
}

let getLogoPathsCache = '';

// The post header wordmark ("Simen skriver om") is traced from an actual
// marker photo instead of hand-authored paths, so it matches the logo's
// handwriting exactly. The photo is thresholded into a black/white mask,
// then used as the alpha channel of a solid foreground-color fill.
const HEADER_WORDMARK_SOURCE = path.join(
  process.cwd(),
  'src/content/posts/attachments/simen-skriver-om-handtegna.jpg'
);

async function traceHeaderWordmark(color) {
  const mask = await sharp(HEADER_WORDMARK_SOURCE)
    .grayscale()
    .normalize()
    .threshold(150)
    .negate()
    .toBuffer();

  const { width, height } = await sharp(HEADER_WORDMARK_SOURCE).metadata();

  const rgba = await sharp({
    create: { width, height, channels: 3, background: color },
  })
    .png()
    .joinChannel(mask)
    .png()
    .toBuffer();

  const trimmed = await sharp(rgba).trim({ background: '#00000000' }).toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();

  return { buffer: trimmed, width: trimmedMeta.width, height: trimmedMeta.height };
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Rough word-wrap based on an estimated average glyph width for bold sans text.
function wrapTitle(title, maxWidth, fontSize) {
  const avgCharWidth = fontSize * 0.56;
  const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const MAX_LINES = 3;
  if (lines.length > MAX_LINES) {
    const truncated = lines.slice(0, MAX_LINES);
    truncated[MAX_LINES - 1] = truncated[MAX_LINES - 1].replace(/\s*\S*$/, '') + '…';
    return truncated;
  }
  return lines;
}

// Header row layout: the "Simen skriver om" wordmark sits above the title,
// so the whole thing reads "Simen skriver om {title}".
const PADDING_X = 90;
const HEADER_TOP = 190;
const HEADER_HEIGHT = 76;
const TITLE_TOP_GAP = 56;

function buildPostOgSvg(title) {
  const maxTextWidth = OG_WIDTH - PADDING_X * 2;
  const fontSize = title.length > 60 ? 56 : title.length > 32 ? 66 : 78;
  const lineHeight = fontSize * 1.2;
  const lines = wrapTitle(title, maxTextWidth, fontSize);

  const titleTop = HEADER_TOP + HEADER_HEIGHT + TITLE_TOP_GAP;
  const startY = titleTop + fontSize * 0.8;

  const textLines = lines
    .map(
      (line, i) =>
        `<text x="${PADDING_X}" y="${startY + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" fill="${COLORS.foreground}">${escapeXml(line)}</text>`
    )
    .join('\n');

  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${COLORS.background}"/>
  <rect x="0" y="0" width="${OG_WIDTH}" height="10" fill="${COLORS.accent}"/>
  ${textLines}
</svg>`.trim();
}

function buildDefaultOgSvg() {
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${COLORS.background}"/>
  <rect x="0" y="0" width="${OG_WIDTH}" height="10" fill="${COLORS.accent}"/>
</svg>`.trim();
}

// Minimal frontmatter reader for the handful of fields we need.
function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split('\n')) {
    const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!fieldMatch) continue;
    const [, key, rawValue] = fieldMatch;
    if (!['title', 'draft', 'image', 'imageOG'].includes(key)) continue;
    let value = rawValue.trim();
    value = value.replace(/^["']|["']$/g, '');
    if (value === 'true') data[key] = true;
    else if (value === 'false') data[key] = false;
    else if (value !== '') data[key] = value;
  }
  return data;
}

async function findPostFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'attachments') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findPostFiles(fullPath, base)));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      const id = path
        .relative(base, fullPath)
        .replace(/\.(md|mdx)$/, '')
        .split(path.sep)
        .join('/');
      files.push({ id, fullPath });
    }
  }

  return files;
}

// Same encoding used in src/utils/seo.ts to turn a post id into a filename.
export function ogFilenameForPostId(id) {
  return `${id.replace(/\//g, '--')}.png`;
}

async function generateDefaultOgImage() {
  await sharp(Buffer.from(buildDefaultOgSvg()))
    .composite([
      {
        input: Buffer.from(logoSvg(680, COLORS.foreground).markup),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(DEFAULT_OG_PATH);
  log.info('Generated default OG image → public/open-graph.png');
}

async function generatePostOgImages() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const postFiles = await findPostFiles(POSTS_DIR);

  const wordmark = await traceHeaderWordmark(COLORS.foreground);
  const headerBuffer = await sharp(wordmark.buffer)
    .resize({ height: HEADER_HEIGHT })
    .toBuffer();

  let generated = 0;
  let skipped = 0;

  for (const { id, fullPath } of postFiles) {
    const source = await fs.readFile(fullPath, 'utf-8');
    const frontmatter = parseFrontmatter(source);

    if (frontmatter.image && frontmatter.imageOG) {
      skipped++;
      continue;
    }

    const title = frontmatter.title || 'Untitled Post';
    const outputPath = path.join(OUTPUT_DIR, ogFilenameForPostId(id));

    await sharp(Buffer.from(buildPostOgSvg(title)))
      .composite([
        {
          input: headerBuffer,
          left: PADDING_X,
          top: HEADER_TOP,
        },
      ])
      .png()
      .toFile(outputPath);

    generated++;
  }

  log.info(`Generated ${generated} post OG image(s), skipped ${skipped} post(s) with a custom OG image.`);
}

async function main() {
  getLogoPathsCache = await getLogoPaths();
  await generateDefaultOgImage();
  await generatePostOgImages();
}

main().catch((error) => {
  log.error('Failed to generate OG images:', error);
  process.exit(1);
});
