/* Where the app's code is. It was all in index.html; since the module split
   (r&d/notes/module-split.md) most of it is in js/*.js. Tools that find a line
   or a block by pattern ask here instead of naming a file, so they follow the
   code wherever it has moved.

     const { fileWith, source } = require('./app-source.cjs');
     const file = fileWith(/^(export )?const EXERCISE_CATALOGUE = /m);   // absolute path
     const code = source();   // every file's text joined, `export` and imports removed
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/* index.html first, then js/ in name order. */
function appFiles() {
  const js = path.join(ROOT, 'js');
  const mods = fs.existsSync(js) ? fs.readdirSync(js).filter(f => f.endsWith('.js')).sort().map(f => path.join(js, f)) : [];
  return [path.join(ROOT, 'index.html'), ...mods];
}
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');

/* The one file a pattern is in. Throws if it is in none, or in two. */
function fileWith(re, what) {
  const hits = appFiles().filter(f => new RegExp(re.source, re.flags.replace('g', '')).test(fs.readFileSync(f, 'utf8')));
  if (hits.length !== 1) throw new Error(`${what || re} ${hits.length ? 'is in more than one file: ' + hits.map(rel).join(', ') : 'not found in index.html or js/*.js'}`);
  return hits[0];
}

/* A module's text as a classic script would have it: no import lines, no
   `export` in front of declarations. For tools that cut a block out and run
   it in a sandbox. */
function plain(text) {
  return text.replace(/^import\s[^;]*?from\s+'[^']+';[ \t]*\n/gm, '').replace(/^export\s+(?=(async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, '');
}
function source() { return appFiles().map(f => plain(fs.readFileSync(f, 'utf8'))).join('\n'); }

module.exports = { ROOT, appFiles, fileWith, plain, source, rel };
