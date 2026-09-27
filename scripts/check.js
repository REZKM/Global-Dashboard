// npm run check -- validates DESIGN.md and syntax-checks every inline <script> in the dashboard.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadDesignHead, PLACEHOLDER } = require('../design');

const page = fs.readFileSync(path.join(__dirname, '..', 'public', 'dashboard', 'index.html'), 'utf8');
let failed = false;

try {
  loadDesignHead();
  console.log('DESIGN.md: ok');
} catch (err) {
  failed = true;
  console.error('DESIGN.md:', err.message);
}

if (!page.includes(PLACEHOLDER)) {
  failed = true;
  console.error(`index.html: missing ${PLACEHOLDER} in <head>`);
}

const scripts = [...page.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter((m) => !/application\/json/.test(m[1]) && m[2].trim());
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-check-'));
scripts.forEach((m, i) => {
  const file = path.join(tmp, `script-${i}.js`);
  fs.writeFileSync(file, m[2]);
  const label = (m[2].match(/^\s*\/\* vendor: ([\w.-]+)/) || [])[1] || 'dashboard app';
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`script ${i + 1} (${label}): ok`);
  } catch (err) {
    failed = true;
    console.error(`script ${i + 1} (${label}):\n${err.stderr}`);
  }
});
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
