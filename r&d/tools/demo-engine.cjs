/* Load the exercise-demo engine out of index.html into a sandbox, so tools
   can pose and draw figures without a browser.

   The engine is the block that starts at the "EXERCISE DEMOS" header comment
   and ends just before `let _mvTab`. It only touches the page (esc, $, S,
   save, EQ_TITLE) when its widget functions run, never at load, so a few
   stubs are enough.

     const { engine } = require('./demo-engine.cjs');
     const E = engine();          // E.demoSVG, E.DEMO_MAP, E.demoPose, …
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const { fileWith, plain } = require('./app-source.cjs');
/* index.html until the module split, js/exercises.js after it */
const INDEX = fileWith(/EXERCISE DEMOS — r&d\/specs\/exercise-demo-spec\.md/, 'the exercise demo block');
const START = 'EXERCISE DEMOS — r&d/specs/exercise-demo-spec.md';
const END = "let _mvTab = 'info';";

function engineSource(html) {
  html = plain(html || fs.readFileSync(INDEX, 'utf8'));   // a module's `export` and imports mean nothing in the sandbox
  const s = html.indexOf(START), e = html.indexOf(END);
  if (s < 0 || e < 0 || e < s) throw new Error('exercise demo block not found');
  return html.slice(html.lastIndexOf('/*', s), e);
}

const EXPORTS = ['DEMO_L', 'DEMO_W', 'DEMO_MID', 'DEMO_PLATE', 'DEMO_HOLDS', 'DEMO_BASES', 'DEMO_MUSCLES',
  'DEMO_PATTERNS', 'DEMO_MAP', 'DEMO_TEXT', 'demoFor', 'demoPose', 'demoSVG', 'demoBox', 'demoTimeline', 'demoAt', 'demoIK', 'dKF', 'demoTarget'];

function engine(html) {
  const src = engineSource(html);
  const ctx = {
    esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    $: () => null, S: { exNotes: {} }, save: () => {}, EQ_TITLE: {}, console,
  };
  vm.createContext(ctx);
  vm.runInContext(`${src}\n;globalThis.__demo = { ${EXPORTS.join(', ')} };`, ctx, { filename: 'index.html#demos' });
  return ctx.__demo;
}

module.exports = { engine, engineSource, ROOT, INDEX };
