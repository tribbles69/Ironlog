/* Runtime smoke test. Drives every view, modal and main flow in a real page and
   reports anything that throws or renders empty.

   The scope linter catches identifiers that do not exist. This catches the rest:
   wrong argument shapes, null dereferences, and branches that only run for
   particular data — the Events crash lived in a block that only executes for a
   meet whose name matches one regex, so every synthetic fixture missed it.

   Run it in the page:

     fetch('tools/smoke.js').then(r => r.text()).then(eval).then(smoke)

   smoke() seeds nothing. smoke({ seed: 'program' | 'migrated' | 'empty' })
   builds the state first. Returns { pass, fail, results }.
*/
window.smoke = async function smoke(opts) {
  const o = opts || {};
  const results = [];
  /* Let queued work run — deliberately not a wall-clock sleep.

     A browser clamps setTimeout in a hidden tab and throttles it harder the
     longer the tab stays hidden. Measured on the deployed build in a background
     tab: setTimeout(40) fired at 936 ms, so a suite that sleeps between every
     check stopped making visible progress after six of them. It was not
     hanging, it was crawling — which is worse, because it looks like a fault in
     the app.

     Nothing here needs real time. Renders and modals are synchronous (a modal's
     title and 2436 bytes of body are readable in the same turn as the open
     call); these waits only ever existed to let queued tasks run. A
     MessageChannel round-trip is a macrotask that background throttling does
     not clamp: 50 of them cost 15 ms in the same tab where one setTimeout(40)
     cost 936. Rounds scale with the requested delay so relative ordering is
     preserved. */
  const yieldTask = () => new Promise(r => {
    const c = new MessageChannel();
    c.port1.onmessage = () => r();
    c.port2.postMessage(0);
  });
  const wait = async ms => {
    const rounds = Math.max(2, Math.round((ms == null ? 90 : ms) / 20));
    for (let i = 0; i < rounds; i++) await yieldTask();
  };

  const step = async (name, fn) => {
    try {
      const v = await fn();
      results.push({ name, ok: true, note: typeof v === 'string' ? v : '' });
    } catch (e) {
      results.push({ name, ok: false, note: (e && e.message) || String(e) });
    }
  };
  const close = () => { try { closeAllModals(); } catch (e) {} };
  const modalTitle = () => {
    const h = document.querySelector('.modal-head h2');
    return h ? h.textContent.trim() : null;
  };
  /* A modal that opens with no title, or a view that renders almost nothing, is
     as broken as one that throws — and does it quietly. */
  const openCheck = async (label, fn, minLen) => step(label, async () => {
    close(); await wait(40);
    await fn(); await wait(160);
    const t = modalTitle();
    if (!t) throw new Error('no modal opened');
    const len = (document.querySelector('.modal-body') || { innerHTML: '' }).innerHTML.length;
    if (len < (minLen || 40)) throw new Error(`modal body only ${len} chars`);
    close();
    return `"${t}" ${len} chars`;
  });

  // ---------------------------------------------------------------- seeding
  if (o.seed && o.seed !== 'keep') {
    S.workouts = []; S.meets = []; S.goals = []; S.checkins = []; S.foods = [];
    S.customMovements = []; S.programs = []; S.active = null; S.exAliases = {};
    S.checkins = [{ date: today(), weight: 90 }];
    if (o.seed === 'program' || o.seed === 'migrated') {
      const P = await loadProgram();
      if (P) installProgram(P);
    }
    if (o.seed === 'migrated') {
      // tested singles, a completed session, a goal, an unresolved movement
      [['Back Squat', 200], ['Bench Press', 140], ['Deadlift', 240], ['Overhead Press', 95]]
        .forEach(([n, kg], i) => logTest(`2026-08-0${i + 1}`, [{ leaf: resolveName(n).leaf, legacyName: n, kg }], ''));
      const mk = (date, n, sets, extra) => Object.assign({
        id: 'smoke-' + date + n, date, name: 'Smoke', status: 'completed', source: 'logged',
        exercises: [{
          leaf: leafForName(n), legacyName: n, notes: 'comp pause', mods: [],
          sets: sets.map(([w, r, t]) => ({ w, r, rpe: 8, done: true, setType: t || 'working' })),
        }],
        start: null, end: Date.now(), summary: { mins: 45, prs: [], volume: 0 },
      }, extra || {});
      S.workouts.push(
        mk('2026-08-10', 'Bench Press', [[60, 5, 'warmup'], [85, 5], [85, 5]]),
        mk('2026-08-11', 'Flat DB Press', [[32.5, 10]]),
        mk('2026-08-12', 'Cable Lat Raise', [[11, 12]]),
        mk('2026-08-13', 'Smoke Test Movement', [[20, 10]]),
        mk('2026-08-14', 'Bench Press', [[80, 5]], { source: 'imported' }),
        mk('2026-08-15', 'Bench Press', [[75, 5]], { source: 'backfill' }));
      S.goals.push({ id: 'g1', type: 'lift', name: 'squat 220', exercise: 'back-squat/barbell/bilateral/none', target: 220, startVal: 200, deadline: '' });
      S.foods.push({ id: 'f1', date: today(), meal: 'Lunch', name: 'Rice', serving: '100 g', kcal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, src: 'table' });
    }
    save(); bust();
  }

  // ---------------------------------------------------------------- views
  for (const p of ['home', 'calendar', 'workout', 'food', 'analytics', 'meets']) {
    await step(`view: ${p}`, async () => {
      go(p); await wait(120);
      const len = document.querySelector('#view').innerHTML.length;
      if (len < 200) throw new Error(`rendered only ${len} chars`);
      return `${len} chars`;
    });
  }

  // ---------------------------------------------------------------- modals
  await openCheck('modal: settings', () => openSettings(), 400);
  await openCheck('modal: clear data', () => openClearData());
  await openCheck('modal: check-in', () => openCheckin());
  await openCheck('modal: goal (new)', () => openGoal());
  await openCheck('modal: planner', () => openPlanner(today()));
  await openCheck('modal: exercise picker', () => pickExercise(() => {}));
  await openCheck('modal: plates', () => openPlates(100, null, resolveName('Back Squat').leaf));
  await openCheck('modal: warm-up ramp', () => openRamp('back-squat/barbell/bilateral/none', 150));
  await openCheck('modal: test log', () => openTestLog());
  await openCheck('modal: priority lifts', () => openPriority());
  await openCheck('modal: add event', () => openAddEvent());
  await openCheck('modal: food targets', () => openFoodTargets());
  await openCheck('modal: food entry', () => openFoodEntry(null));
  /* A real Liftoff export shape — header plus a few rows, lb weights like the
     app expects to guess. Passing nothing here only proved the harness could
     call the function, not that the importer works. */
  const LIFTOFF_CSV = [
    'Date,Duration,Workout Name,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,RPE,Notes',
    '2026-06-12 14:08:13,00 hours 30 minutes 19 seconds,,Hip Adduction,0,176.369809748,16,0,0,,',
    '2026-06-12 14:08:13,00 hours 30 minutes 19 seconds,,Hip Adduction,1,176.369809748,10,0,0,,',
    '2026-06-12 14:08:13,00 hours 30 minutes 19 seconds,,Bench Press,0,185.0,5,0,0,8,',
    '2026-06-12 14:08:13,00 hours 30 minutes 19 seconds,,Zercher Wallball,0,44.0,10,0,0,,',
  ].join('\n');
  await openCheck('modal: liftoff import', () => openLiftoffImport(LIFTOFF_CSV), 200);

  await step('flow: liftoff import end to end', async () => {
    close();
    const before = S.workouts.length;
    const p = parseLiftoff(LIFTOFF_CSV);
    if (!p.sessions.length) throw new Error('parsed no sessions');
    const mapping = {};
    p.sessions.forEach(s => s.exercises.forEach(e => { mapping[e.raw] = (matchExercise(e.raw).name) || e.raw; }));
    const r = importLiftoff(p.sessions, mapping, p.unit);
    save(); bust();
    const added = S.workouts.length - before;
    if (!added) throw new Error('imported nothing');
    const imported = S.workouts.filter(w => w.source === 'imported');
    const bad = imported.flatMap(w => w.exercises).filter(e => !e.leaf);
    if (bad.length) throw new Error(`${bad.length} imported entries have no leaf`);
    return `${added} session(s), ${imported.flatMap(w => w.exercises).length} entries, all with leaves`;
  });
  await openCheck('modal: program', () => openProgram(), 200);

  for (const t of Object.keys(EVENT_TYPES)) {
    const type = EVENT_TYPES[t];
    await openCheck(`modal: new ${t} event`, () => {
      if (type.chooseLift) return openMeet(null, t, [{ slot: 'deadlift', label: 'Deadlift', movement: 'deadlift', equipment: 'barbell' }]);
      return openMeet(null, t);
    }, 300);
  }

  // ---------------------------------------------------------------- movement page
  await step('movement page: all three tabs', async () => {
    close();
    const st = allStats()[0];
    if (!st) return 'no stats to open (skipped)';
    openMovementPage(keyLeaf(st.key).movement, st.key); await wait(200);
    const tabs = [...document.querySelectorAll('[data-mvtab]')];
    if (tabs.length !== 3) throw new Error(`${tabs.length} tabs, expected 3`);
    for (const tab of tabs) {
      tab.click(); await wait(140);
      const len = document.querySelector('#mvTabs').parentElement.innerHTML.length;
      if (len < 200) throw new Error(`${tab.dataset.mvtab} tab rendered ${len} chars`);
    }
    close();
    return '3 tabs render';
  });

  // ---------------------------------------------------------------- flows
  await step('flow: start, log a set, PR, finish', async () => {
    close(); S.active = null; save();
    newBlank();
    const leaf = resolveName('Back Squat').leaf;
    S.active.exercises.push({ leaf, legacyName: 'Back Squat', notes: '', mods: [], sets: [{ w: 100, r: 5, rpe: 8, done: false, setType: 'working' }] });
    save(); render(); await wait(150);
    const tick = document.querySelector('[data-done="0.0"]');
    if (!tick) throw new Error('no set row rendered');
    tick.click(); await wait(220);
    close();
    if (!S.active.exercises[0].sets[0].done) throw new Error('set did not tick');
    finishWorkout(); await wait(320);
    close();
    if (S.active) throw new Error('workout did not finish');
    return 'ticked and finished';
  });

  await step('flow: warm-up toggle', async () => {
    close(); S.active = null; save();
    newBlank();
    S.active.exercises.push({ leaf: resolveName('Bench Press').leaf, legacyName: 'Bench Press', notes: '', mods: [], sets: [{ w: 60, r: 5, rpe: null, done: false, setType: 'working' }] });
    save(); render(); await wait(150);
    const btn = document.querySelector('[data-warm="0.0"]');
    if (!btn) throw new Error('no warm-up toggle rendered');
    btn.click(); await wait(180);
    const t = S.active.exercises[0].sets[0].setType;
    if (t !== 'warmup') throw new Error(`setType is "${t}" after toggling, expected warmup`);
    btn2: { const b2 = document.querySelector('[data-warm="0.0"]'); if (b2) { b2.click(); await wait(160); } }
    if (S.active.exercises[0].sets[0].setType !== 'working') throw new Error('did not toggle back');
    S.active = null; save(); render();
    return 'toggles both ways';
  });

  await step('flow: equipment chip and picker', async () => {
    close(); S.active = null; save();
    newBlank();
    S.active.exercises.push({ leaf: resolveName('Back Squat').leaf, legacyName: 'Back Squat', notes: '', mods: [], sets: [{ w: 100, r: 5, rpe: null, done: false, setType: 'working' }] });
    save(); render(); await wait(150);
    const chip = document.querySelector('[data-axis]');
    if (!chip) throw new Error('no equipment chip rendered');
    chip.click(); await wait(200);
    const rows = [...document.querySelectorAll('.axrow')];
    const off = rows.filter(r => r.classList.contains('off')).length;
    if (!rows.length) throw new Error('picker had no rows');
    if (!off) throw new Error('nothing greyed — invalid options should be visible but unselectable');
    close(); S.active = null; save(); render();
    return `${rows.length} options, ${off} greyed`;
  });

  await step('flow: completed session — view, edit, share', async () => {
    close();
    const wo = S.workouts.find(w => w.status === 'completed');
    if (!wo) return 'no completed session (skipped)';
    viewCompleted(wo.id); await wait(200);
    if (!modalTitle()) throw new Error('viewCompleted opened nothing');
    close(); await wait(60);
    openEditWorkout(wo.id); await wait(200);
    if (!modalTitle()) throw new Error('edit opened nothing');
    close(); await wait(60);
    const quick = quickCardCanvas(wo), full = fullCardCanvas(wo);
    if (!quick.width || !full.height) throw new Error('share card had no size');
    return `share cards ${quick.width}x${quick.height} and ${full.width}x${full.height}`;
  });

  await step('flow: food parse (tables only, no key)', async () => {
    close(); go('food'); await wait(150);
    const box = document.querySelector('#foodInput');
    if (!box) throw new Error('no food input');
    const before = S.foods.length;
    box.value = '100g rice, 2 eggs';
    document.querySelector('#foodParse').click(); await wait(900);
    if (S.foods.length <= before) throw new Error('nothing logged from the local tables');
    return `${S.foods.length - before} items`;
  });

  await step('flow: migration dry run', async () => {
    const R = migrationDryRun(S);
    if (!R || !R.invariants) throw new Error('no report');
    return `${R.invariants.entries.before} entries, ${R.orphans.length} orphans`;
  });

  await step('flow: update check', async () => {
    const v = await fetchLatestVersion();
    if (!v) return 'version.json unreachable (offline?)';
    return `latest ${v.version}, running ${APP_VERSION}`;
  });

  close();
  const fail = results.filter(r => !r.ok);
  const out = { pass: results.length - fail.length, fail: fail.length, results };
  console.log(`smoke: ${out.pass} passed, ${out.fail} failed`);
  fail.forEach(f => console.error('  FAIL', f.name, '—', f.note));
  return out;
};
'smoke harness loaded';
