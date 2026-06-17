// Cache-bust stamper. Rewrites the ?v= token on every local JS/CSS reference
// in the HTML pages to a short hash of that file's current contents.
//
//   node version.mjs          stamp all pages, print what changed
//   node version.mjs --check   exit 1 if anything is out of date (CI/pre-commit)
//
// Only references that ALREADY carry a ?v= are touched, so nothing new is
// versioned and the service worker keeps seeing every tool asset as immutable.
// Files whose contents are unchanged keep their hash, so only what actually
// changed gets re-downloaded.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const check = process.argv.includes('--check');
const hashes = new Map();

function hashOf(file) {
  if (hashes.has(file)) return hashes.get(file);
  const h = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);
  hashes.set(file, h);
  return h;
}

const pages = readdirSync('.').filter((f) => f.endsWith('.html'));
const ref = /\b(src|href)="([^"?]+\.(?:js|css))\?v=[^"]*"/g;

let changed = 0;
const stale = [];

for (const page of pages) {
  const src = readFileSync(page, 'utf8');
  const out = src.replace(ref, (whole, attr, file) => {
    if (!existsSync(file)) return whole; // leave unknown/remote refs alone
    const stamped = `${attr}="${file}?v=${hashOf(file)}"`;
    if (stamped !== whole) stale.push(`${page}: ${file}`);
    return stamped;
  });
  if (out !== src) {
    changed++;
    if (!check) writeFileSync(page, out);
  }
}

if (check) {
  if (stale.length) {
    console.error('Out-of-date cache-bust tokens:\n  ' + stale.join('\n  '));
    process.exit(1);
  }
  console.log('All cache-bust tokens are current.');
} else {
  console.log(changed ? `Stamped ${stale.length} reference(s) across ${changed} page(s).` : 'Nothing to stamp — all current.');
}
