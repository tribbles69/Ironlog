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
  await openCheck('modal: profile', () => openProfile(), 300);
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

  /* Timed movements were unloggable: the tick refused without reps, and finish
     dropped every set without one. Both failures were silent — the second
     deleted the entry from the saved session. Worth its own check. */
  await step('flow: timed exercise — log, tick, finish, keep', async () => {
    close(); S.active = null; save();
    newBlank();
    const plank = resolveName('Plank').leaf;
    if (!isTimed(plank)) throw new Error('Plank is not a timed movement');
    S.active.exercises.push({ leaf: plank, legacyName: 'Plank', notes: '', mods: [], sets: [{ w: 0, r: null, sec: null, rpe: null, done: false, setType: 'working' }] });
    // a squat alongside it, so the mixed case is covered too
    S.active.exercises.push({ leaf: resolveName('Back Squat').leaf, legacyName: 'Back Squat', notes: '', mods: [], sets: [{ w: 100, r: 5, rpe: 8, done: false, setType: 'working' }] });
    save(); render(); await wait(160);

    const heads = [...document.querySelectorAll('.ex-card')[0].querySelectorAll('thead th')].map(t => t.textContent.trim()).filter(Boolean);
    if (!heads.includes('Time')) throw new Error(`no Time column: ${heads.join('|')}`);
    if (heads.some(h => /reps|rpe/i.test(h))) throw new Error(`timed card still offers reps/RPE: ${heads.join('|')}`);
    const inp = document.querySelector('[data-f="sec"]');
    if (!inp) throw new Error('no duration input');
    if (document.querySelector('[data-f="r"][data-k="0.0"]')) throw new Error('timed card still has a reps input');

    inp.value = '90'; inp.oninput(); inp.onblur();
    if (S.active.exercises[0].sets[0].sec !== 90) throw new Error('duration not stored');
    if (inp.value !== '1:30') throw new Error(`did not reformat on blur: "${inp.value}"`);

    document.querySelector('[data-done="0.0"]').click(); await wait(240); close();
    if (!S.active.exercises[0].sets[0].done) throw new Error('timed set would not tick');
    document.querySelector('[data-done="1.0"]').click(); await wait(240); close();

    finishWorkout(); await wait(360); close();
    if (S.active) throw new Error('workout did not finish');
    const wo = S.workouts.filter(w => w.status === 'completed').slice(-1)[0];
    const kept = wo.exercises.find(e => e.legacyName === 'Plank');
    if (!kept) throw new Error('the timed entry was dropped when the session was saved');
    if (kept.sets[0].sec !== 90) throw new Error('the duration did not survive finishing');
    if (!Number.isFinite(totalVolume(wo))) throw new Error('volume went non-finite');
    return 'logs, ticks, finishes, survives';
  });

  /* Every display surface used to render a timed set as "0kg × null". */
  await step('timed sets render as time everywhere', async () => {
    close();
    const wo = S.workouts.filter(w => w.status === 'completed')
      .find(w => w.exercises.some(e => isTimed(e.leaf)));
    if (!wo) return 'no timed session (skipped)';
    const junk = /\bnull\b|\bNaN\b|\bundefined\b/;
    const bad = [];
    for (const p of ['home', 'calendar', 'analytics']) {
      go(p); await wait(140);
      if (junk.test(document.querySelector('#view').textContent)) bad.push(p);
    }
    for (const [label, open] of [['summary', () => showSummary(wo)], ['detail', () => viewCompleted(wo.id)], ['edit', () => openEditWorkout(wo.id)]]) {
      close(); await wait(50); open(); await wait(200);
      const b = document.querySelector('.modal-body');
      if (b && junk.test(b.textContent)) bad.push(label);
    }
    close();
    if (bad.length) throw new Error(`renders null/NaN in: ${bad.join(', ')}`);
    return 'home, calendar, analytics, summary, detail, edit all clean';
  });

  /* The profile edits S.settings live so the derived figures recompute as you
     type, which makes Cancel the interesting case: it has to put back what was
     there. And "use these targets" has to actually reach the food targets. */
  await step('profile: derives, applies, and cancels cleanly', async () => {
    close();
    const st = S.settings;
    const before = { sex: st.sex, dob: st.dob, heightCm: st.heightCm, bodyweight: st.bodyweight, kcalTarget: st.kcalTarget };

    // a complete profile should produce a calorie figure and a macro split
    st.sex = 'male'; st.dob = '1990-06-01'; st.heightCm = 180; st.bodyweight = 90;
    st.activity = 'moderate'; st.nutritionGoal = 'maintain';
    const age = ageFrom(st.dob);
    if (age == null || age < 30 || age > 60) throw new Error(`age came out ${age}`);
    if (!ageCategory(age)) throw new Error('no age category');
    const t = suggestedTargets();
    if (!t) throw new Error('a complete profile derived no targets');
    if (!(t.bmr > 1200 && t.bmr < 2600)) throw new Error(`BMR ${t.bmr} is not plausible`);
    if (!(t.tdee > t.bmr)) throw new Error('maintenance below BMR');
    if (t.c < 0) throw new Error('negative carbs');
    const kcalFromMacros = t.p * 4 + t.c * 4 + t.f * 9;
    if (Math.abs(kcalFromMacros - t.kcal) > 25) throw new Error(`macros sum to ${kcalFromMacros}, target is ${t.kcal}`);

    // an incomplete profile must decline rather than invent a number
    const h = st.heightCm; st.heightCm = 0;
    if (suggestedTargets()) throw new Error('derived targets with no height');
    st.heightCm = h;

    // applying writes through to the food targets
    openProfile(); await wait(200);
    const use = document.querySelector('#pfUseTargets');
    if (!use) throw new Error('no "use these targets" button on a complete profile');
    use.click(); await wait(220); close();
    if (S.settings.kcalTarget !== t.kcal) throw new Error(`kcal target is ${S.settings.kcalTarget}, expected ${t.kcal}`);
    if (S.settings.proteinTarget !== t.p) throw new Error('protein target not applied');

    // cancel restores what was there on opening
    openProfile(); await wait(180);
    const sel = document.querySelector('#pfSex');
    sel.value = sel.value === 'male' ? 'female' : 'male';
    sel.onchange(); await wait(200);
    const cancel = document.querySelector('#pfCancel');
    if (!cancel) throw new Error('no cancel button');
    cancel.click(); await wait(180); close();
    if (S.settings.sex !== 'male') throw new Error(`cancel left sex as ${S.settings.sex}`);

    Object.assign(st, before);
    return `age ${age}, ${t.kcal} kcal, ${t.p}/${t.c}/${t.f}`;
  });

  /* Velocity. The engine is Slew's, bundled rather than reimplemented, so what
     is checked here is the JOIN: that it loaded, that leaves map to the right
     velocity profile, that a measured set attaches to the right place, and that
     a set taken to failure calibrates the profile. */
  const vbtSignal = (ups, miss) => {
    const HZ = 60, DT = 1000 / HZ;
    let t = 0, x = 0; const out = [];
    const hold = s => { for (let i = 0; i < s * HZ; i++) out.push({ t: t += DT, x, conf: 1 }); };
    const move = (d, s) => {
      const x0 = x, n = Math.round(s * HZ);
      for (let i = 1; i <= n; i++) { const p = i / n; x = x0 + d * (p - Math.sin(2 * Math.PI * p) / (2 * Math.PI)); out.push({ t: t += DT, x, conf: 1 }); }
    };
    hold(0.8);
    for (const up of ups) { move(-0.5, 1.4); hold(0.25); move(0.5, up); hold(1.0); }
    if (miss) { move(-0.5, 1.4); hold(0.25); move(0.26, 1.6); move(-0.26, 0.9); hold(1.2); }
    return out;
  };
  const vbtRun = (liftId, ups, miss, loadKg) => {
    const p = slewProfile(liftId);
    const o = Slew.analyse(vbtSignal(ups, miss), { targetHz: 60, minRom: p.minRom, loadKg });
    const reps = Slew.withRpe(o.reps, p);
    const est = Slew.estimateSet(reps, p, o.failure);
    return { o, reps, est, p, v: packVbt({ timestamp: Date.now(), reps, summary: o.summary, provenance: { mode: 'sensor', sampleRate: 60, sourceRate: 60 } }, est, liftId) };
  };

  await step('velocity: engine loaded and leaves map to profiles', async () => {
    if (!window.Slew) throw new Error('slew-core.js did not load');
    for (const fn of ['analyse', 'withRpe', 'estimateSet', 'MotionCapture', 'defaultProfile', 'integrateMotion']) {
      if (typeof Slew[fn] === 'undefined') throw new Error(`engine is missing ${fn}`);
    }
    const want = [['Back Squat', 'Squat (free bar)'], ['Bench Press', 'Bench press'], ['Deadlift', 'Deadlift (conv.)'], ['Overhead Press', 'Overhead press']];
    for (const [name, id] of want) {
      const got = slewLiftFor(resolveName(name).leaf);
      if (got !== id) throw new Error(`${name} mapped to ${got}, expected ${id}`);
    }
    // a movement with no sensible velocity bucket must map to nothing, not to the nearest one
    if (slewLiftFor(resolveName('Plank').leaf)) throw new Error('Plank was given a velocity profile');
    return `${Object.keys(Slew.DEFAULT_PROFILES).length} profiles`;
  });

  await step('velocity: a set measures, decays and attaches', async () => {
    close(); S.active = null; save();
    const { v, est } = vbtRun('Squat (free bar)', [0.8, 0.95, 1.15, 1.45], false, 140);
    if (v.reps.length !== 4) throw new Error(`${v.reps.length} reps detected, expected 4`);
    if (!(v.best > 0.4 && v.best < 1.5)) throw new Error(`best velocity ${v.best} is not plausible`);
    for (let i = 1; i < v.reps.length; i++) {
      if (v.reps[i].v >= v.reps[i - 1].v) throw new Error('velocity did not fall across a set that slowed down');
    }
    if (!(v.loss > 20)) throw new Error(`velocity loss only ${v.loss}%`);
    if (!v.est) throw new Error('no effort estimate for a mapped lift');
    if (!v.est.because) throw new Error('an estimate with no explanation');
    // samples must never be stored — the whole state is one blob rewritten on every save
    const json = JSON.stringify(v);
    if (/"samples"|"x":/.test(json)) throw new Error('raw samples got stored');
    if (json.length > 4000) throw new Error(`stored payload is ${json.length} bytes`);

    newBlank();
    S.active.exercises.push({ leaf: resolveName('Back Squat').leaf, legacyName: 'Back Squat', notes: '', mods: [], sets: [{ w: 140, r: 0, rpe: null, done: false, setType: 'working' }] });
    save(); render(); await wait(150);
    if (!document.querySelector('[data-vbt="0"]')) throw new Error('no measure button on the card');
    attachVbt(0, v, est);
    await wait(180);
    const s = S.active.exercises[0].sets[0];
    if (!s.vbt) throw new Error('nothing attached to the set');
    if (s.r !== 4) throw new Error(`rep count not filled from the sensor (got ${s.r})`);
    if (!document.querySelector('.vbtstrip')) throw new Error('measured set not shown on the card');

    /* Finishing and editing both rebuild the exercise list, and that is exactly
       how timed sets were silently discarded. Measured sets go the same way if
       nobody checks. */
    S.active.exercises[0].sets.forEach(x => { x.done = true; });
    const woId = S.active.id;
    /* force: on an empty history a heavy single trips the plausibility prompt,
       which stops the finish and would leave this checking some earlier
       session. Find the workout by id for the same reason. */
    save(); finishWorkout(true); await wait(360); close();
    const wo = S.workouts.find(w => w.id === woId);
    if (!wo || wo.status !== 'completed') throw new Error('the session did not finish');
    if (!wo.exercises[0].sets[0].vbt) throw new Error('velocity data was dropped when the session was finished');
    openEditWorkout(wo.id); await wait(200); saveEdit(true); await wait(240); close();
    const after = S.workouts.find(w => w.id === woId);
    if (!after || !after.exercises[0].sets[0].vbt) throw new Error('velocity data was dropped when the session was edited');

    S.active = null; save();
    return `${v.reps.length} reps, ${v.best.toFixed(2)} m/s, ▾${v.loss.toFixed(0)}%, ${json.length} bytes, survives finish+edit`;
  });

  await step('velocity: a failed rep calibrates the profile', async () => {
    close();
    const before = S.settings.slewProfiles;
    S.settings.slewProfiles = {};
    const { o, est, v } = vbtRun('Squat (free bar)', [0.8, 0.95, 1.15, 1.45], true, 140);
    if (!o.failure.failedAttempt) throw new Error('a missed rep was not detected');
    if (o.reps.length !== 4) throw new Error(`the miss was counted as a rep (${o.reps.length})`);
    if (est.method !== 'observed-failure') throw new Error(`method was ${est.method}`);
    if (est.rir !== 0) throw new Error(`RIR ${est.rir} after an observed failure`);
    if (!est.measuredV0) throw new Error('failure did not measure a 0-RIR velocity');

    S.active = null; newBlank();
    S.active.exercises.push({ leaf: resolveName('Back Squat').leaf, legacyName: 'Back Squat', notes: '', mods: [], sets: [{ w: 140, r: 0, rpe: null, done: false, setType: 'working' }] });
    attachVbt(0, v, est);
    const cal = slewProfile('Squat (free bar)').v0Observed;
    if (!cal) throw new Error('the measured velocity was not written back to the profile');

    // and the payoff: the next estimate should be less uncertain than it was
    const after = vbtRun('Squat (free bar)', [0.8, 0.95, 1.15], false, 140).est;
    S.settings.slewProfiles = {};
    const raw = vbtRun('Squat (free bar)', [0.8, 0.95, 1.15], false, 140).est;
    if (!(after.spread < raw.spread)) throw new Error(`calibration did not narrow the spread (${after.spread} vs ${raw.spread})`);

    S.settings.slewProfiles = before; S.active = null; save();
    return `v0 ${cal.toFixed(2)} m/s, spread ${raw.spread.toFixed(1)} -> ${after.spread.toFixed(1)} RIR`;
  });

  await step('picker: equipment icon row', async () => {
    close();
    let got = null;
    pickExercise(l => { got = l; }); await wait(220);
    const rows = [...document.querySelectorAll('.pickitem')];
    if (!rows.length) throw new Error('picker listed nothing');
    const withIcons = rows.filter(r => r.querySelector('.eqrow'));
    if (!withIcons.length) throw new Error('no equipment icon row on any item');
    if (withIcons.some(r => !r.querySelector('.eqi.on'))) throw new Error('an icon row has nothing lit as current');
    /* Assert a glyph actually draws, not just that the box is there — an empty
       EQ_ICON leaves the markup intact and the row invisible, and a structural
       check alone passes straight through that. */
    const blank = withIcons.filter(r => r.querySelectorAll('.eqi').length !== r.querySelectorAll('.eqi svg').length);
    if (blank.length) throw new Error(`${blank.length} row(s) have equipment slots with no icon in them`);
    // tapping an icon picks that equipment, not the row's default
    const multi = withIcons.find(r => r.querySelectorAll('.eqi').length > 1);
    const off = [...multi.querySelectorAll('.eqi')].find(e => !e.classList.contains('on'));
    off.click(); await wait(200);
    if (!got) throw new Error('tapping an equipment icon picked nothing');
    if (got.equipment !== off.dataset.pickeq.split('|')[1]) {
      throw new Error(`icon tap gave ${got.equipment}, wanted ${off.dataset.pickeq.split('|')[1]}`);
    }
    close();
    return `${withIcons.length}/${rows.length} rows show equipment`;
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
