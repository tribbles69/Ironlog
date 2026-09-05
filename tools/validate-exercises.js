#!/usr/bin/env node
/* Validates docs/exercises.json and reproduces every figure quoted in
   docs/exercise-system-phase1.md.

   Three passes:
     1. catalogue integrity — ids, alias uniqueness, vocabulary references
     2. leaf-level migration dry run against the bundled program
     3. the numbers the Phase 1 document quotes

   Exits non-zero on any failure. Run from the repo root:
       node tools/validate-exercises.js
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/exercises.json'), 'utf8'));
const V = J.vocabularies;
const M = J.movements;

let fail = 0;
const ok = (cond, label, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (!cond && detail ? '  ' + detail : ''));
  if (!cond) fail++;
};

/* ---------------------------------------------------------------- 1. catalogue */
console.log('=== 1. CATALOGUE INTEGRITY ===');
ok(J.schemaVersion === 2, 'schemaVersion is 2');

const ids = M.map(m => m.id);
ok(new Set(ids).size === ids.length, `movement ids unique (${ids.length})`);

/* Alias uniqueness is a hard constraint: a duplicate makes import resolution
   non-deterministic, so it fails loudly rather than picking a winner. */
const seen = new Map(), dupes = [];
M.forEach(m => (m.aliases || []).forEach(a => {
  const k = a.name.toLowerCase();
  if (seen.has(k) && seen.get(k) !== m.id) dupes.push(`${a.name} [${seen.get(k)} & ${m.id}]`);
  else seen.set(k, m.id);
}));
ok(dupes.length === 0, 'no case-insensitive alias collisions', dupes.slice(0, 5).join('; '));

const inV = (set, v) => new Set(set).has(v);
const bad = [];
M.forEach(m => {
  (m.equipment || []).forEach(e => !inV(V.equipment, e) && bad.push(`${m.id} equipment:${e}`));
  (m.execution || []).forEach(e => !inV(V.execution, e) && bad.push(`${m.id} execution:${e}`));
  (m.attachments || []).forEach(e => !inV(V.attachment, e) && bad.push(`${m.id} attachment:${e}`));
  if (!inV(V.category, m.category)) bad.push(`${m.id} category:${m.category}`);
  if (!inV(V.type, m.type)) bad.push(`${m.id} type:${m.type}`);
  if (m.metric && !inV(V.metric, m.metric)) bad.push(`${m.id} metric:${m.metric}`);
  if (!(m.equipment || []).includes(m.defaultEquipment)) bad.push(`${m.id} defaultEquipment invalid`);
  if (!(m.execution || []).includes(m.defaultExecution)) bad.push(`${m.id} defaultExecution invalid`);
  const hasAtt = m.attachments && m.attachments.length;
  if (hasAtt && !m.attachments.includes(m.defaultAttachment)) bad.push(`${m.id} defaultAttachment invalid`);
  if (!hasAtt && m.defaultAttachment) bad.push(`${m.id} defaultAttachment without attachments`);
  Object.entries(m.executionDefaults || {}).forEach(([eq, ex]) => {
    if (!(m.equipment || []).includes(eq)) bad.push(`${m.id} executionDefaults key:${eq}`);
    if (!(m.execution || []).includes(ex)) bad.push(`${m.id} executionDefaults value:${ex}`);
  });
});
ok(bad.length === 0, 'all vocabulary and default references valid', bad.slice(0, 6).join('; '));

const badAlias = [];
M.forEach(m => (m.aliases || []).forEach(a => {
  if (a.equipment && !(m.equipment || []).includes(a.equipment)) badAlias.push(`${m.id}/${a.name} eq`);
  if (a.execution && !(m.execution || []).includes(a.execution)) badAlias.push(`${m.id}/${a.name} ex`);
  if (a.attachment && !(m.attachments || []).includes(a.attachment)) badAlias.push(`${m.id}/${a.name} att`);
}));
ok(badAlias.length === 0, 'every alias axis is legal for its movement', badAlias.slice(0, 5).join('; '));

ok(!V.metric.some(v => /[()]/.test(v)), 'metric vocabulary has no parenthetical values (E3)');
ok(!!V.load.order && !V.load.bilateral, 'load is the ordered rule, not the flat table (E4)');
ok(Array.isArray(V.setType) && V.setType.length === 4, 'setType vocabulary present (E5)');
ok(Array.isArray(V.modifier) && V.modifier.some(x => x.splitsPR), 'modifier vocabulary with splitsPR (E6)');
ok(!!V.attachmentKind && !!V.attachmentApplies, 'attachmentKind + attachmentApplies present (E7)');
ok(M.every(m => (m.aliases || []).every(a => typeof a === 'object' && a.name)), 'aliases are leaf-bearing (E8)');
ok(M.filter(m => m.attachments && m.attachments.length).every(m => m.defaultAttachment),
   'every attachment-bearing movement has a default (E9)');
ok(!M.some(m => m.review || m.reviewNote), 'no review flags remain (E10)');

/* ------------------------------------------------------- 2. leaf-level dry run */
console.log('\n=== 2. LEAF-LEVEL MIGRATION DRY RUN ===');
/* The program moved out of index.html in 0.7.0 — it is fetched on demand now. */
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'program.json'), 'utf8'));

const byName = new Map(M.map(m => [m.name.toLowerCase(), { m, a: null }]));
const byAlias = new Map();
M.forEach(m => (m.aliases || []).forEach(a => {
  const k = a.name.toLowerCase();
  if (!byName.has(k) && !byAlias.has(k)) byAlias.set(k, { m, a });
}));

/* Resolution order per spec section 8: exact name, then exact alias, else orphan.
   No fuzzy matching — that is what produced B3. */
function resolve(name) {
  const hit = byName.get(name.toLowerCase()) || byAlias.get(name.toLowerCase());
  if (!hit) return null;
  const { m, a } = hit;
  const equipment = (a && a.equipment) || m.defaultEquipment;
  const execution = (a && a.execution)
    || (m.executionDefaults && m.executionDefaults[equipment])
    || m.defaultExecution;
  // attachment is scoped by equipment, not by movement alone
  const applies = V.attachmentApplies[equipment] || V.attachmentApplies._default;
  const allowed = applies === 'none' ? []
    : (m.attachments || []).filter(x => applies === 'any' || V.attachmentKind[x] === 'bar');
  let attachment = 'none';
  if (allowed.length) {
    attachment = (a && a.attachment && allowed.includes(a.attachment)) ? a.attachment
      : (allowed.includes(m.defaultAttachment) ? m.defaultAttachment : allowed[0]);
  }
  const load = (['unilateral', 'alternating'].includes(execution)
    || (['dumbbells', 'kettlebell'].includes(equipment) && !m.singleImplement))
    ? 'per_side' : 'total';
  return { m, key: `${m.id}/${equipment}/${execution}/${attachment}`, via: a ? 'alias' : 'name', load };
}

const entries = {}, setCount = {};
P.workouts.forEach(w => w.exercises.forEach(e => {
  entries[e.name] = (entries[e.name] || 0) + 1;
  setCount[e.name] = (setCount[e.name] || 0) + e.sets.length;
}));
const names = Object.keys(entries);
const orphans = names.filter(n => !resolve(n));
ok(orphans.length === 0, `zero orphans across the ${names.length} program names`, orphans.join(', '));

const byLeaf = {};
names.forEach(n => { const r = resolve(n); if (r) (byLeaf[r.key] = byLeaf[r.key] || []).push({ n, c: entries[n] }); });
let ambiguous = 0; const collisions = [];
Object.entries(byLeaf).forEach(([key, ns]) => {
  if (ns.length > 1) { ambiguous += ns.reduce((a, x) => a + x.c, 0); collisions.push(`${key} <- ${ns.map(x => x.n).join(' + ')}`); }
});
ok(ambiguous === 0, 'zero leaf-ambiguous entries (was 489 / 34.9% before leaf-bearing aliases)',
   collisions.slice(0, 6).join(' | '));

const totalEntries = Object.values(entries).reduce((a, b) => a + b, 0);
console.log(`\n  ${names.length} names / ${totalEntries} entries resolved — ` +
            `${names.filter(n => resolve(n).via === 'alias').length} via alias, ` +
            `${names.filter(n => resolve(n).via === 'name').length} via name`);

/* --------------------------------------------- 3. figures quoted in the document */
console.log('\n=== 3. FIGURES QUOTED IN THE PHASE 1 DOCUMENT ===');
let sets = 0, zeroRep = 0, calfLast = 0, mcpZeros = 0, mcpAllZero = 0, amrapNote = 0, amrapReal = 0;
P.workouts.forEach(w => w.exercises.forEach(e => {
  sets += e.sets.length;
  const z = e.sets.filter(s => s.r === 0).length;
  zeroRep += z;
  if (/amrap/i.test(e.notes || '')) { amrapNote++; if (!z) amrapReal++; }
  if (e.name === 'Smith Calf Raise') e.sets.forEach((s, i) => { if (s.r === 0 && i === e.sets.length - 1) calfLast++; });
  if (e.name === 'Machine Chest Press' && z) { mcpZeros += z; if (e.sets.every(s => s.r === 0)) mcpAllZero++; }
}));
ok(P.workouts.length === 327, 'program sessions = 327');
ok(totalEntries === 1400, 'program exercise entries = 1400');
ok(sets === 4409, 'program sets = 4409');
ok(zeroRep === 143, 'zero-rep sets = 143 (the spec originally said 346)');
ok(calfLast === 100, 'Smith Calf Raise zero-rep sets that are the last set = 100');
ok(mcpZeros === 43 && mcpAllZero === 12, 'Machine Chest Press = 43 zeros across 12 entirely-zero entries');
ok(amrapNote === 355, 'entries mentioning AMRAP in notes = 355');
ok(amrapReal === 243, 'of those, storing a real rep count = 243');
ok(M.length === 104, 'catalogue movements = 104');
ok(M.filter(m => m.attachments).length === 29, 'movements with attachments = 29');
ok(M.filter(m => m.metric === 'time').length === 10, 'movements with metric:time = 10');
ok(M.filter(m => m.singleImplement).length === 8, 'movements with singleImplement = 8');
ok(M.filter(m => m.verified === true).length === 32, 'verified:true = 32');
ok(names.every(n => resolve(n).m.verified === true), 'all program names map to verified:true movements');
ok(V.modifier.filter(m => !m.splitsPR).every(m => m.evidence.programEntries > 0),
   'every splitsPR:false modifier is evidenced in the program notes');
ok(V.modifier.filter(m => m.splitsPR).every(m => m.evidence.programEntries === 0),
   'every splitsPR:true modifier has zero instances (stated in section 8)');

console.log(fail ? `\n${fail} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
