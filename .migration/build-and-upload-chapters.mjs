/*
 * For each chapter page: take the imported .plain.html (section divs only),
 * wrap it as a full DA document, append a metadata block carrying the Nav
 * fields (Title / Group / Position), stage it, and POST it to Document Authoring.
 *
 * Usage: node .migration/build-and-upload-chapters.mjs [--dry]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { execSync } from 'child_process';

const DRY = process.argv.includes('--dry');
const ORG = 'vidobe';
const REPO = 'ahwftpoc';
const navMap = JSON.parse(readFileSync('.migration/nav-map.json', 'utf8'));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function navRows({ navTitle, navGroup, navPosition }) {
  return [
    ['Nav Title', esc(navTitle)],
    ['Nav Group', esc(navGroup)],
    ['Nav Position', esc(navPosition)],
  ].map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
}

function newMetadataBlock(nav) {
  return `    <div>\n      <div class="metadata">\n        ${navRows(nav)}\n      </div>\n    </div>`;
}

const results = [];
for (const [path, nav] of Object.entries(navMap)) {
  if (path === 'content/overview') continue; // already uploaded with nav metadata
  const plainPath = `${path}.plain.html`;
  if (!existsSync(plainPath)) {
    results.push({ path, status: 'MISSING plain.html' });
    continue;
  }
  let inner = readFileSync(plainPath, 'utf8').trim();

  // Merge the Nav rows INTO the existing metadata block (EDS only honors ONE
  // metadata block per page). Insert them right after the block's opening tag;
  // row order within a metadata block doesn't matter. If no metadata block
  // exists, append a fresh one.
  const hasMeta = /<div class="metadata">/.test(inner);
  if (hasMeta) {
    inner = inner.replace('<div class="metadata">', `<div class="metadata">${navRows(nav)}`);
  }
  const doc = `<body>\n  <header></header>\n  <main>\n    ${inner}\n${hasMeta ? '' : newMetadataBlock(nav)}\n  </main>\n  <footer></footer>\n</body>\n`;

  const stagePath = `.migration/da-upload/${path}.html`;
  mkdirSync(dirname(stagePath), { recursive: true });
  writeFileSync(stagePath, doc);

  if (DRY) {
    results.push({ path, status: 'staged (dry)' });
    continue;
  }

  const url = `https://admin.da.live/source/${ORG}/${REPO}/${path}.html`;
  try {
    const out = execSync(
      `curl -s -o /dev/null -w "%{http_code}" -X POST -F "data=@${stagePath};type=text/html" "${url}"`,
      { encoding: 'utf8' },
    );
    results.push({ path, status: `HTTP ${out.trim()}` });
  } catch (e) {
    results.push({ path, status: `ERR ${e.message}` });
  }
}

let ok = 0;
for (const r of results) {
  if (/HTTP 20[01]/.test(r.status) || r.status.includes('dry')) ok += 1;
  console.log(`${r.status.padEnd(16)} ${r.path}`);
}
console.log(`\n${ok}/${results.length} ok`);
