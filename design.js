// Turns DESIGN.md into the CSS variables the dashboard and login pages use.
// See DESIGN.md for the token tables; this file only parses them.
const fs = require('fs');
const path = require('path');

const DESIGN_FILE = path.join(__dirname, 'DESIGN.md');
const PLACEHOLDER = '<!-- design-tokens -->';

// Every `| \`name\` | \`value\` | ... |` row of every table. A table whose header has a
// "Dark" column gives each token a separate dark value; otherwise one value serves both.
function parseDesign(markdown) {
  const light = {};
  const dark = {};
  let valueCol = -1;
  let darkCol = -1;
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) { valueCol = -1; darkCol = -1; continue; }
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (/^-+$/.test(cells[0].replace(/:/g, ''))) continue;
    const name = (cells[0].match(/^`([a-z][a-z0-9-]*)`$/) || [])[1];
    if (!name) {
      const header = cells.map((c) => c.toLowerCase());
      valueCol = header.findIndex((c) => c === 'light' || c === 'value');
      darkCol = header.indexOf('dark');
      continue;
    }
    const read = (i) => (i > 0 && cells[i] ? (cells[i].match(/^`(.*)`$/) || [])[1] : undefined);
    const value = read(valueCol);
    if (value === undefined) continue;
    const darkValue = read(darkCol) !== undefined ? read(darkCol) : value;
    for (const v of [value, darkValue]) {
      if (name === 'font-url') {
        if (v !== 'none' && !/^https:\/\/[^\s"'<>]+$/.test(v)) throw new Error('DESIGN.md: font-url must be an https:// URL or none');
      } else if (/[;{}<>]/.test(v)) {
        throw new Error(`DESIGN.md: value for "${name}" may not contain ; { } < or >`);
      }
    }
    light[name] = value;
    dark[name] = darkValue;
  }
  return { light, dark };
}

function declarations(tokens) {
  return Object.entries(tokens)
    .filter(([name]) => name !== 'font-url')
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n');
}

// Light is the default; html.dark-mode switches to dark. Anything marked .theme-light
// (the setup wizard, login pages) always stays light; anything marked .theme-dark (brand
// black panels) always uses the dark values. Phones always use light, as before.
function buildCss({ light, dark }) {
  const l = declarations(light);
  const d = declarations(dark);
  return [
    `:root, .theme-light {\n${l}\n  color-scheme: light;\n}`,
    `html.dark-mode {\n${d}\n  color-scheme: dark;\n}`,
    `html.dark-mode .theme-light {\n${l}\n  color-scheme: light;\n}`,
    `.theme-dark {\n${d}\n  color-scheme: dark;\n}`,
    `@media (max-width: 760px) {\n  html.dark-mode {\n${l}\n    color-scheme: light;\n  }\n}`,
  ].join('\n');
}

function buildHead(tokens) {
  const fontUrl = tokens.light['font-url'];
  const fontLink = fontUrl && fontUrl !== 'none'
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="${fontUrl.replace(/&/g, '&amp;')}">\n`
    : '';
  return `${fontLink}<style id="design-tokens">\n${buildCss(tokens)}\n</style>`;
}

function loadDesignHead(file = DESIGN_FILE) {
  return buildHead(parseDesign(fs.readFileSync(file, 'utf8')));
}

// Puts the tokens into a page at its <!-- design-tokens --> placeholder.
function injectDesign(html, head) {
  if (!html.includes(PLACEHOLDER)) throw new Error(`Page is missing the ${PLACEHOLDER} placeholder`);
  return html.replace(PLACEHOLDER, () => head);
}

module.exports = { parseDesign, buildCss, buildHead, loadDesignHead, injectDesign, PLACEHOLDER };
