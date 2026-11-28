// Builds the coach plan templates (r&d/data/templates/*.json) into index.html
// as one line: const COACH_TPL = {...};
// Run after changing any template file:  node "r&d/tools/build-coach-templates.cjs"
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const dir = path.join(root, 'r&d', 'data', 'templates');
const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'note' || k === 'neverTogetherNote') ? undefined : v));

const P = strip(read('patterns.json')), G = strip(read('goals.json'));
const splits = {};
['full-body', 'upper-lower', 'ppl', 'ulul', 'pplul', 'pplppl'].forEach(id => {
  const t = strip(read(id + '.json'));
  splits[id] = { name: t.name, days: t.days, eventDay: t.eventDay, dayList: t.dayList };
});
const TPL = { patterns: P.patterns, rules: P.rules, needs: P.needs, goalOverrides: P.goalOverrides,
  experienceOverrides: P.experienceOverrides, easyOn: P.easyOn,
  goals: G.goals, sets: G.sets, experience: G.experience, minutes: G.minutes, splits };

const line = `const COACH_TPL = ${JSON.stringify(TPL)};   // built by r&d/tools/build-coach-templates.cjs from r&d/data/templates — don't edit here`;
/* the line is in js/coach.js since the module split; found by pattern, so it follows the code */
const re = /^(export )?const COACH_TPL = .*$/m;
const file = require('./app-source.cjs').fileWith(re, 'the "const COACH_TPL = " line');
fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(re, (m, ex) => (ex || '') + line));
console.log(`COACH_TPL: ${Object.keys(TPL.patterns).length} patterns, ${Object.keys(splits).length} splits, ${line.length} chars`);
