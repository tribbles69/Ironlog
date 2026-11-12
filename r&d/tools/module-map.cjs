#!/usr/bin/env node
/* Map of index.html's main script for the module split (r&d/notes/module-split.md).

   Parses every inline <script> block, lists each top-level statement (what it
   declares, where, how big), and works out which other top-level names it
   reads and writes. With a plan file it rolls that up into modules: sizes, the
   module-to-module dependency graph, cycles, the exports each module needs,
   and the top-level `let`s that are written from outside their own module
   (an imported binding is read-only, so each of those needs a setter or a
   state object before its code can move).

   Needs the TypeScript parser, which is not a dependency of this repo:
     NODE_PATH=../slew-v2/node_modules node "r&d/tools/module-map.cjs" [options]

   Options
     --outline            every top-level statement, one line each
     --plan <file.json>   [{ "module": "storage", "ranges": [[1433, 2446], …] }, …]
                          line ranges are index.html lines, inclusive; first match wins
     --json <out.json>    write the full analysis
     --deps <name>        who reads / writes one top-level name

   Scope analysis is approximate: a name counts as local to a top-level
   statement if anything inside that statement declares it. That can hide a
   real global read when a nested function shadows the name. lint-scope.js
   stays the check that nothing is undeclared; this is for drawing the map.
*/
const fs = require('fs'), path = require('path');
let ts;
try { ts = require('typescript'); } catch (e) {
  console.error('typescript not found — run with NODE_PATH=../slew-v2/node_modules'); process.exit(1);
}
const ROOT = path.resolve(__dirname, '..', '..');
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const has = k => process.argv.includes(k);
const html = fs.readFileSync(path.join(ROOT, arg('--file') || 'index.html'), 'utf8');

/* Inline script blocks, each padded with newlines so AST lines are index.html lines. */
const blocks = [];
for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  const start = m.index + m[0].indexOf('>') + 1;
  const line = html.slice(0, start).split('\n').length;
  blocks.push({ line, code: m[1] });
}

const SK = ts.SyntaxKind;
const stmts = [];   // { block, kind, names[], declKind, line, end, bytes, node }
const decl = new Map();   // name -> stmt index

function bindingNames(name, out) {
  if (ts.isIdentifier(name)) out.push(name.text);
  else for (const el of name.elements) if (!ts.isOmittedExpression(el)) bindingNames(el.name, out);
  return out;
}

blocks.forEach((b, bi) => {
  const sf = ts.createSourceFile('b' + bi + '.js', '\n'.repeat(b.line - 1) + b.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  b.sf = sf;
  for (const node of sf.statements) {
    const names = []; let kind = SK[node.kind], declKind = '';
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) { names.push(node.name.text); declKind = ts.isClassDeclaration(node) ? 'class' : 'function'; }
    else if (ts.isVariableStatement(node)) {
      declKind = node.declarationList.flags & ts.NodeFlags.Const ? 'const' : node.declarationList.flags & ts.NodeFlags.Let ? 'let' : 'var';
      for (const d of node.declarationList.declarations) bindingNames(d.name, names);
    }
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    const end = sf.getLineAndCharacterOfPosition(node.end).line + 1;
    const s = { block: bi, kind, names, declKind, line, end, bytes: node.end - node.getStart(sf), node, sf };
    for (const n of names) decl.set(n, stmts.length);
    stmts.push(s);
  }
});

/* Per statement: names declared anywhere inside it (params, locals, nested
   function names, catch variables), then identifiers read and written that
   are top-level names and not shadowed. */
function analyse(s) {
  const local = new Set();
  const top = s.node;
  (function collect(n) {
    if (n !== top) {
      if ((ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isClassDeclaration(n) || ts.isClassExpression(n)) && n.name) local.add(n.name.text);
      if (ts.isVariableDeclaration(n)) bindingNames(n.name, []).forEach(x => local.add(x));
    } else if (ts.isVariableStatement(n)) { /* its own names are the top-level ones */ }
    if (ts.isParameter(n)) bindingNames(n.name, []).forEach(x => local.add(x));
    if (ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, []).forEach(x => local.add(x));
    if (n !== top && ts.isVariableDeclaration(n)) { /* done above */ }
    ts.forEachChild(n, collect);
  })(top);
  // top-level variable statements: their declarators were skipped as "n === top" children are VariableDeclarationList → VariableDeclaration, which are not top; undo that
  if (ts.isVariableStatement(top)) for (const n of s.names) local.delete(n);

  const reads = new Set(), writes = new Set();
  (function walk(n, parent) {
    if (ts.isIdentifier(n)) {
      const name = n.text;
      if (!decl.has(name) || local.has(name)) return;
      // not a reference: property name, object key, declaration name, label
      if (parent) {
        if (ts.isPropertyAccessExpression(parent) && parent.name === n) return;
        if (ts.isPropertyAssignment(parent) && parent.name === n) return;
        if (ts.isMethodDeclaration(parent) && parent.name === n) return;
        if (ts.isPropertyDeclaration(parent) && parent.name === n) return;
        if ((ts.isGetAccessor(parent) || ts.isSetAccessor(parent)) && parent.name === n) return;
        if (ts.isBindingElement(parent) && parent.propertyName === n) return;
        if (ts.isLabeledStatement(parent) || ts.isBreakStatement(parent) || ts.isContinueStatement(parent)) return;
        if ((ts.isFunctionDeclaration(parent) || ts.isClassDeclaration(parent) || ts.isVariableDeclaration(parent)) && parent.name === n) return;
      }
      let w = false;
      if (parent) {
        if (ts.isBinaryExpression(parent) && parent.left === n && parent.operatorToken.kind >= SK.FirstAssignment && parent.operatorToken.kind <= SK.LastAssignment) w = true;
        if ((ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) && (parent.operator === SK.PlusPlusToken || parent.operator === SK.MinusMinusToken)) w = true;
        if (ts.isShorthandPropertyAssignment(parent) && parent.name === n) { /* a read (or a destructuring write, rare) */ }
        // destructuring assignment targets: [a, b] = …  /  ({ a } = …)
        let p = parent, c = n;
        while (p && (ts.isArrayLiteralExpression(p) || ts.isObjectLiteralExpression(p) || ts.isShorthandPropertyAssignment(p) || ts.isPropertyAssignment(p) || ts.isSpreadElement(p) || ts.isParenthesizedExpression(p))) { c = p; p = p.parent; }
        if (p && p !== parent && ts.isBinaryExpression(p) && p.left === c && p.operatorToken.kind === SK.EqualsToken) w = true;
      }
      (w ? writes : reads).add(name);
      if (w && !(ts.isBinaryExpression(parent) && parent.operatorToken.kind === SK.EqualsToken)) reads.add(name);
      return;
    }
    ts.forEachChild(n, c => walk(c, n));
  })(top, null);
  for (const n of s.names) { reads.delete(n); }
  /* Eager reads: names read while the statement itself runs, i.e. not inside a
     nested function body. Between modules these fix the load order — a module
     that reads another's binding while it is being evaluated must load after it. */
  const eager = new Set();
  const isFn = n => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n) || ts.isConstructorDeclaration(n);
  (function walkE(n) {
    if (isFn(n)) return;
    if (ts.isIdentifier(n) && reads.has(n.text) && !(n.parent && ts.isPropertyAccessExpression(n.parent) && n.parent.name === n) && !(n.parent && ts.isPropertyAssignment(n.parent) && n.parent.name === n)) eager.add(n.text);
    ts.forEachChild(n, walkE);
  })(top);
  s.reads = reads; s.writes = writes; s.eager = eager;
}
stmts.forEach(analyse);

/* ---------- output ---------- */
if (has('--outline')) {
  for (const s of stmts) {
    const label = s.names.length ? `${s.declKind} ${s.names.slice(0, 6).join(', ')}${s.names.length > 6 ? ` … (+${s.names.length - 6})` : ''}` : `[${s.kind}] ${s.node.getText(s.sf).slice(0, 70).replace(/\s+/g, ' ')}`;
    console.log(`${String(s.line).padStart(5)}-${String(s.end).padEnd(5)} ${String(s.bytes).padStart(7)}  ${label}`);
  }
}

if (arg('--deps')) {
  const name = arg('--deps');
  const d = decl.get(name);
  if (d == null) { console.error('no such top-level name'); process.exit(1); }
  console.log(`${name}: declared at line ${stmts[d].line} (${stmts[d].declKind})`);
  const who = k => stmts.filter(s => s[k].has(name)).map(s => `${s.line} ${s.names[0] || '[' + s.kind + ']'}`);
  console.log(`written by ${who('writes').length}:\n  ` + who('writes').join('\n  '));
  console.log(`read by ${who('reads').length}:\n  ` + who('reads').slice(0, 200).join('\n  '));
}

let plan = null;
if (arg('--plan')) {
  plan = JSON.parse(fs.readFileSync(arg('--plan'), 'utf8'));
  const modOf = s => { for (const m of plan) for (const [a, b] of m.ranges) if (s.line >= a && s.line <= b) return m.module; return '(unassigned)'; };
  stmts.forEach(s => { s.module = modOf(s); });
  const mods = [...new Set(stmts.map(s => s.module))];
  const info = Object.fromEntries(mods.map(m => [m, { bytes: 0, stmts: 0, decls: 0, sideEffects: [], exports: new Set(), imports: {}, writesIn: {} }]));
  for (const s of stmts) {
    const I = info[s.module]; I.bytes += s.bytes; I.stmts++; I.decls += s.names.length;
    if (!s.names.length) I.sideEffects.push(s.line);
    for (const [set, isWrite] of [[s.reads, false], [s.writes, true]]) for (const n of set) {
      const t = stmts[decl.get(n)];
      if (t.module === s.module) continue;
      info[t.module].exports.add(n);
      (I.imports[t.module] = I.imports[t.module] || new Set()).add(n);
      if (isWrite) (info[t.module].writesIn[n] = info[t.module].writesIn[n] || new Set()).add(s.module);
    }
  }
  console.log('\nMODULES');
  for (const m of mods) {
    const I = info[m];
    console.log(`\n${m}: ${(I.bytes / 1024).toFixed(0)} kB, ${I.stmts} statements, ${I.decls} names, ${I.exports.size} exported, ${I.sideEffects.length} top-level side-effect statements`);
    for (const [k, v] of Object.entries(I.imports).sort((a, b) => b[1].size - a[1].size)) console.log(`   imports ${String(v.size).padStart(4)} from ${k}`);
    const w = Object.entries(I.writesIn);
    if (w.length) console.log(`   written from outside (${w.length}): ` + w.map(([n, s]) => `${n}←${[...s].join('/')}`).join(', '));
  }
  // cycles between modules (pairs)
  /* Followed through functions: a statement that names a function while it
     runs may call it, so everything that function reads counts too (and so
     on). Conservative — naming a function is not always calling it. */
  console.log('\nLOAD-TIME READS ACROSS MODULES (these fix the load order)');
  for (const s of stmts) {
    if (s.declKind === 'function') continue;
    const seen = new Map();   // name -> via
    const queue = [...s.eager].map(n => [n, '']);
    while (queue.length) {
      const [n, via] = queue.shift();
      if (seen.has(n)) continue;
      seen.set(n, via);
      const t = stmts[decl.get(n)];
      if (t.declKind === 'function') for (const r of t.reads) queue.push([r, via ? via : n]);
    }
    for (const [n, via] of seen) {
      const t = stmts[decl.get(n)];
      if (t.module !== s.module) console.log(`  ${s.module}:${s.line} ${s.names[0] || '[' + s.kind + ']'}  reads ${n}${via ? ' via ' + via + '()' : ''}  (${t.module}:${t.line}, ${t.declKind})`);
    }
  }
  console.log('\nMUTUAL IMPORTS');
  for (let i = 0; i < mods.length; i++) for (let j = i + 1; j < mods.length; j++) {
    const a = info[mods[i]].imports[mods[j]], b = info[mods[j]].imports[mods[i]];
    if (a && b) console.log(`  ${mods[i]} ⇄ ${mods[j]}  (${a.size} / ${b.size})`);
  }
  if (arg('--json')) {
    const out = { modules: Object.fromEntries(mods.map(m => [m, { bytes: info[m].bytes, statements: info[m].stmts, exports: [...info[m].exports].sort(), imports: Object.fromEntries(Object.entries(info[m].imports).map(([k, v]) => [k, [...v].sort()])), writtenFromOutside: Object.fromEntries(Object.entries(info[m].writesIn).map(([k, v]) => [k, [...v]])), sideEffectLines: info[m].sideEffects }])) };
    fs.writeFileSync(arg('--json'), JSON.stringify(out, null, 1));
  }
}

if (!has('--outline') && !plan && !arg('--deps')) {
  const by = k => stmts.filter(s => s.declKind === k).reduce((a, s) => a + s.names.length, 0);
  console.log(`${blocks.length} inline script blocks, ${stmts.length} top-level statements`);
  console.log(`functions ${by('function')}, classes ${by('class')}, const ${by('const')}, let ${by('let')}, var ${by('var')}, other statements ${stmts.filter(s => !s.names.length).length}`);
  const lets = stmts.filter(s => s.declKind === 'let' || s.declKind === 'var');
  const reassigned = new Set(); stmts.forEach(s => s.writes.forEach(n => reassigned.add(n)));
  console.log(`top-level let/var names reassigned somewhere: ${lets.flatMap(s => s.names).filter(n => reassigned.has(n)).length}`);
}
