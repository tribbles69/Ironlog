#!/usr/bin/env node
/* Find identifiers a function uses but never declares.

   Every silent failure in this app so far has been the same shape: a parameter
   or local gets renamed, one reference is missed, and the stale name happens to
   resolve to something — a browser global like `name` or `top`, or nothing at
   all until that branch runs. `node --check` is happy. The page looks fine.
   The feature quietly stops working.

   This is not a real scope analyser. It strips strings and comments (keeping
   the code inside template `${}`), collects what each top-level function
   declares, and reports what it reads without declaring. False positives are
   expected and listed; the point is that the list should be short and every
   entry explainable.

   Usage:  node tools/lint-scope.js
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* Every script block, joined. They share one global scope in the page, so
   analysing only the biggest one made globals declared in another block — like
   PROGRAM_MANIFEST — look undefined. */
const blocks = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const src = blocks.join('\n;\n');

/* Blank out comments and string bodies, but keep the code inside `${ }` — most
   of this app's logic lives inside template literals. */
function stripNonCode(s) {
  const out = new Array(s.length).fill('');
  let i = 0;
  const tpl = [];                      // stack: are we inside a template literal?
  let state = 'code';
  let depth = 0;                       // brace depth inside ${ }
  let lastSig = '';                    // last significant code char, for regex detection
  let inClass = false;                 // inside [...] of a regex, where / is literal
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    const keep = () => { out[i] = c; if (!/\s/.test(c)) lastSig = c; i++; };
    const skip = () => { out[i] = c === '\n' ? '\n' : ' '; i++; };
    if (state === 'code') {
      if (c === '/' && n === '/') { state = 'line'; skip(); continue; }
      if (c === '/' && n === '*') { state = 'block'; skip(); continue; }
      /* A regex literal, not division. Division can only follow a value, so a
         slash after an identifier, number, ) or ] is division; anything else
         starts a regex. Without this, a pattern like /[&<>"']/ opens a string
         state and every declaration after it disappears — which is exactly how
         this tool lied the first time it ran. */
      if (c === '/' && !/[\w$)\]]/.test(lastSig)) { state = 'regex'; inClass = false; skip(); continue; }
      if (c === "'") { state = 'sq'; skip(); continue; }
      if (c === '"') { state = 'dq'; skip(); continue; }
      if (c === '`') { tpl.push(depth); state = 'tpl'; skip(); continue; }
      /* Closing a `${ }`: the brace depth is one above what it was when the
         template opened. Comparing without the +1 never matches, so the scanner
         stays in code state for the rest of the file and every later
         declaration vanishes. */
      if (c === '}' && tpl.length && depth === tpl[tpl.length - 1] + 1) { depth--; state = 'tpl'; skip(); continue; }
      if (c === '{') depth++;
      if (c === '}') depth--;
      keep(); continue;
    }
    if (state === 'regex') {
      if (c === '\\') { skip(); skip(); continue; }
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) {
        state = 'code'; lastSig = '/'; skip();
        while (i < s.length && /[gimsuyd]/.test(s[i])) skip();   // flags, not identifiers
        continue;
      }
      else if (c === '\n') { state = 'code'; }        // unterminated: bail out safely
      skip(); continue;
    }
    if (state === 'line') { if (c === '\n') state = 'code'; skip(); continue; }
    if (state === 'block') { if (c === '*' && n === '/') { out[i] = ' '; out[i + 1] = ' '; i += 2; state = 'code'; continue; } skip(); continue; }
    if (state === 'sq') { if (c === '\\') { skip(); skip(); continue; } if (c === "'") state = 'code'; skip(); continue; }
    if (state === 'dq') { if (c === '\\') { skip(); skip(); continue; } if (c === '"') state = 'code'; skip(); continue; }
    if (state === 'tpl') {
      if (c === '\\') { skip(); skip(); continue; }
      if (c === '`') { tpl.pop(); state = 'code'; skip(); continue; }
      /* Blank BOTH characters of `${`. Keeping the brace while its partner is
         blanked leaves the output with unbalanced braces, and the brace-matching
         that extracts function bodies then stops early — which made this tool
         report a clean file while reading only a fraction of each function. */
      if (c === '$' && n === '{') { out[i] = ' '; out[i + 1] = ' '; i += 2; depth++; state = 'code'; continue; }
      skip(); continue;
    }
  }
  return out.join('');
}

const code = stripNonCode(src);
const lineOf = idx => code.slice(0, idx).split('\n').length;

/* Top-level declarations are the app's globals. */
const appGlobals = new Set();
for (const m of code.matchAll(/^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/gm)) appGlobals.add(m[1]);
/* Multi-declarator statements are common here — `let saveTimer = null,
   savePending = false;` declares two globals, and taking only the first is how
   the first run of this tool reported savePending as undefined. */
/* Only the FIRST LINE of the statement. A multi-line object literal declares
   exactly one global; reading identifiers out of its whole body registers every
   key and nested variable as a global, which silently whitelists real findings —
   that is how this tool first failed to notice `name` used undeclared. */
for (const m of code.matchAll(/^(?:const|let|var)\s+([^\n]*)/gm)) {
  let d = 0, cur = '';
  const parts = [];
  for (const ch of m[1]) {
    if ('([{'.includes(ch)) d++;
    else if (')]}'.includes(ch)) d--;
    if (ch === ',' && d === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  for (const p of parts) {
    const lhs = p.split('=')[0].trim();
    if (/^[A-Za-z_$][\w$]*$/.test(lhs)) appGlobals.add(lhs);
    else if (/^[{[]/.test(lhs)) for (const id of lhs.matchAll(/([A-Za-z_$][\w$]*)/g)) appGlobals.add(id[1]);
  }
}

const BUILTINS = new Set(`
Object Array String Number Boolean Math JSON Date RegExp Map Set WeakMap WeakSet Promise Symbol BigInt Proxy Reflect
Error TypeError RangeError SyntaxError ReferenceError Intl isNaN isFinite parseInt parseFloat encodeURIComponent
decodeURIComponent encodeURI decodeURI structuredClone queueMicrotask
window document navigator location history localStorage sessionStorage indexedDB caches fetch console
setTimeout setInterval clearTimeout clearInterval requestAnimationFrame cancelAnimationFrame
Blob File FileReader FormData Headers Request Response URL URLSearchParams AbortController
Image Audio Event CustomEvent MutationObserver IntersectionObserver ResizeObserver
HTMLElement Element Node NodeList DOMParser XMLSerializer TextEncoder TextDecoder
SpeechRecognition webkitSpeechRecognition speechSynthesis SpeechSynthesisUtterance
performance crypto alert confirm prompt self globalThis undefined NaN Infinity
arguments this super new target import export await async of in instanceof typeof void delete
if else for while do switch case break continue return function class const let var try catch finally throw
true false null with yield static get set extends implements interface package private protected public
`.trim().split(/\s+/));

/* Identifiers a function body declares: params, const/let/var, inner functions,
   catch bindings, for-of/in bindings, and destructuring in any of those. */
function declaredIn(body, params) {
  const d = new Set(params);
  const add = s => { for (const p of s.split(',')) { const id = p.split(/[:=]/)[0].replace(/[[\]{}.\s]|\.\.\./g, '').trim(); if (/^[A-Za-z_$][\w$]*$/.test(id)) d.add(id); } };
  /* Plain per-identifier pass first: a nested `const k = …` inside an arrow on
     the same line as its parent declaration is otherwise swallowed by the
     multi-declarator match and reported as undeclared. */
  for (const m of body.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) d.add(m[1]);
  for (const m of body.matchAll(/(?:const|let|var)\s+([^;\n]*)/g)) {
    let depth = 0, cur = '';
    const parts = [];
    for (const ch of m[1]) {
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    for (const p of parts) {
      const lhs = p.split('=')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(lhs)) d.add(lhs);
      else for (const id of lhs.matchAll(/([A-Za-z_$][\w$]*)/g)) d.add(id[1]);
    }
  }
  for (const m of body.matchAll(/(?:const|let|var)\s*\{([^}]*)\}/g)) add(m[1]);
  for (const m of body.matchAll(/(?:const|let|var)\s*\[([^\]]*)\]/g)) add(m[1]);
  for (const m of body.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) d.add(m[1]);
  for (const m of body.matchAll(/catch\s*\(\s*([A-Za-z_$][\w$]*)/g)) d.add(m[1]);
  for (const m of body.matchAll(/for\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) d.add(m[1]);
  // arrow and function-expression parameters, incl. destructured
  for (const m of body.matchAll(/\(([^()]*)\)\s*=>/g)) add(m[1]);
  for (const m of body.matchAll(/(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*=>/g)) d.add(m[1]);
  for (const m of body.matchAll(/function\s*\*?\s*[A-Za-z_$\w$]*\s*\(([^)]*)\)/g)) add(m[1]);
  /* Object-literal shorthand methods — `onOpen(bg) { … }` — declare both the
     method name and its parameters. */
  for (const m of body.matchAll(/(?:[{,]|^)\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{/gm)) { d.add(m[1]); add(m[2]); }
  return d;
}

/* Walk top-level functions by brace matching. */
const findings = [];
const fnRe = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{/gm;
let m;
while ((m = fnRe.exec(code))) {
  const name = m[1];
  const params = m[2].split(',').map(p => p.split('=')[0].replace(/[[\]{}.\s]|\.\.\./g, '').trim()).filter(Boolean);
  let i = m.index + m[0].length - 1, depth = 0, end = i;
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = code.slice(m.index, end + 1);
  const declared = declaredIn(body, params);
  const seen = new Set();
  for (const idm of body.matchAll(/(?:^|[^\w$.'"`])([A-Za-z_$][\w$]*)\s*(?![\w$]*\s*:)/g)) {
    const id = idm[1];
    if (seen.has(id) || declared.has(id) || appGlobals.has(id) || BUILTINS.has(id)) continue;
    if (id === name) continue;
    seen.add(id);
    findings.push({ fn: name, id, line: lineOf(m.index + idm.index) });
  }
}

if (!findings.length) { console.log('no undeclared identifiers found'); process.exit(0); }
const byFn = {};
findings.forEach(f => (byFn[f.fn] = byFn[f.fn] || []).push(f));
console.log(`${findings.length} undeclared identifier(s) across ${Object.keys(byFn).length} function(s):\n`);
for (const [fn, list] of Object.entries(byFn)) {
  console.log(`  ${fn}()  —  ${list.map(f => `${f.id} (script line ~${f.line})`).join(', ')}`);
}
process.exit(1);
