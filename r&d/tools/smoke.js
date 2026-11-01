/* Runtime smoke test. Drives every view, modal and main flow in a real page and
   reports anything that throws or renders empty.

   The scope linter catches identifiers that do not exist. This catches the rest:
   wrong argument shapes, null dereferences, and branches that only run for
   particular data — the Events crash lived in a block that only executes for a
   meet whose name matches one regex, so every synthetic fixture missed it.

   Run it in the page:

     fetch('r&d/tools/smoke.js').then(r => r.text()).then(eval).then(smoke)

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
    S.workouts = []; S.meets = []; S.goals = []; S.checkins = []; delete S.foods;
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
    }
    save(); bust();
  }

  // ---------------------------------------------------------------- views
  for (const p of ['home', 'calendar', 'workout', 'analytics', 'meets', 'health']) {
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
  await openCheck('modal: profile', () => openProfile(), 300);
  /* Food left in 0.25.0; a leftover log still has to export. */
  await openCheck('modal: food export (leftover log)', () => {
    S.foods = [{ id: 'f1', date: today(), meal: 'Lunch', name: 'Rice', serving: '100 g', kcal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, src: 'table' }];
    openFoodExport();
  });
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

  await step('flow: set role picker', async () => {
    close(); S.active = null; save();
    newBlank();
    S.active.exercises.push({ leaf: resolveName('Bench Press').leaf, legacyName: 'Bench Press', notes: '', mods: [], sets: [{ w: 60, r: 5, rpe: null, done: false, setType: 'working' }] });
    save(); render(); await wait(150);
    const pick = async role => {
      const btn = document.querySelector('[data-warm="0.0"]');
      if (!btn) throw new Error('no set-number button rendered');
      btn.click(); await wait(160);
      const opt = document.querySelector(`.modal [data-role="${role}"]`);
      if (!opt) throw new Error(`no "${role}" option in the role picker`);
      opt.click(); await wait(160);
      const t = S.active.exercises[0].sets[0].setType;
      if (t !== role) throw new Error(`setType is "${t}", expected ${role}`);
    };
    await pick('warmup');
    await pick('working');
    S.active = null; save(); render();
    return 'warm-up and back via the picker';
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
     there. */
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

    // the derived figures render on a complete profile
    openProfile(); await wait(200);
    if (!document.querySelector('.modal-body').textContent.includes(String(t.tdee))) throw new Error('maintenance figure not shown');
    close();

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
    // an icon that isn't current and is at the current place (D6 greys the rest)
    const pickable = e => !e.classList.contains('on') && !e.classList.contains('na');
    const multi = withIcons.find(r => [...r.querySelectorAll('.eqi')].some(pickable));
    if (!multi) throw new Error('no row has a second icon that can be picked here');
    const off = [...multi.querySelectorAll('.eqi')].find(pickable);
    off.click(); await wait(200);
    if (!got) throw new Error('tapping an equipment icon picked nothing');
    if (got.equipment !== off.dataset.pickeq.split('|')[1]) {
      throw new Error(`icon tap gave ${got.equipment}, wanted ${off.dataset.pickeq.split('|')[1]}`);
    }
    close();
    return `${withIcons.length}/${rows.length} rows show equipment`;
  });

  /* Every cardio machine (D15): a low heart rate cues harder, a high one
     easier, in the knob's own direction (a split gets smaller to go harder),
     and a session on each starts, renders and finishes. */
  /* Mobility (E5): ticking writes today's session, untick-all removes it, and
     the player, Home line and calendar card all render. */
  await step('flow: mobility routine', async () => {
    close();
    const r = BUILTIN_ROUTINES[0];
    if (!r) throw new Error('no built-in routine');
    const d = today(), before = S.workouts.length;
    const ids = r.zones[0].items.map(x => x.id);
    ids.forEach(id => mobTick(r.id, id, true, d));
    const wo = mobSession(r.id, d);
    if (!wo || Object.keys(wo.mobility.done).length !== ids.length) throw new Error('ticks not saved');
    openMobility(r.id); await wait(80);
    if (document.querySelectorAll('.mobrow').length !== r.zones.flatMap(z => z.items).length) throw new Error('player rows');
    close(); go('home'); await wait(60);
    if (!document.querySelector('[data-mobopen]')) throw new Error('no Home line');
    ids.forEach(id => mobTick(r.id, id, false, d));
    if (mobSession(r.id, d) || S.workouts.length !== before) throw new Error('untick-all left a session');
    return `${mobTotal(r)} items`;
  });

  /* Blood pressure and glucose (D16): bands, units and the Health cards. */
  await step('flow: blood pressure and glucose', async () => {
    close();
    if (bpBand(118, 76).id !== 'ideal' || bpBand(138, 82).id !== 'high' || bpBand(85, 55).id !== 'low') throw new Error('BP bands');
    if (gluBand(3.6, 'before').id !== 'low' || gluBand(8.8, 'after').id !== 'in' || gluBand(7.6, 'before').id !== 'over') throw new Error('glucose bands');
    const bp0 = (S.bp || []).length, g0 = (S.glucose || []).length, unit = S.settings.glucoseUnit;
    S.bp = [...(S.bp || []), { id: 'smoke-bp', date: today(), time: '08:00', sys: 120, dia: 78, mt: 1 }];
    S.glucose = [...(S.glucose || []), { id: 'smoke-glu', date: today(), time: '08:00', mmol: 5.5, ctx: 'fasting', mt: 1 }];
    S.settings.glucoseUnit = 'mgdl';
    go('health'); await wait(60);
    const txt = (document.querySelector('#hlGlu') || {}).textContent || '';
    S.settings.glucoseUnit = unit;
    S.bp = S.bp.filter(x => x.id !== 'smoke-bp'); S.glucose = S.glucose.filter(x => x.id !== 'smoke-glu');
    if (!document.querySelector('#hlBp')) throw new Error('no BP card');
    if (!txt.includes('99')) throw new Error('mg/dL not shown (5.5 mmol/L = 99)');
    if (S.bp.length !== bp0 || S.glucose.length !== g0) throw new Error('cleanup');
    render();
    return 'bands, units, cards';
  });

  await step('flow: cardio machines', async () => {
    close(); S.active = null; save();
    const base = { lo: 120, hi: 140, ceiling: 170, interval: 30, preset: 'custom', warmMin: 0 };
    const st = (v, hr) => ({ el: 600, hr5: hr, hr20: hr, v, lastCheck: 500, lastChange: 400, lastCeil: null, warmStep: 0, warmDone: true });
    const bad = [];
    Object.entries(CARDIO_MACHINES).forEach(([id, M]) => {
      Object.entries(M.knobs).forEach(([k, K]) => {
        const v = {}; Object.entries(M.knobs).forEach(([k2, K2]) => { v[k2] = K2.def; });
        const up = cardioDecide({ ...base, machine: id, cue: k }, st(v, 110)).cue;
        const down = cardioDecide({ ...base, machine: id, cue: k }, st(v, 150)).cue;
        if (!up || Math.sign(up.target - K.def) !== K.harder) bad.push(`${id}.${k} low HR`);
        if (!down || Math.sign(down.target - K.def) !== -K.harder) bad.push(`${id}.${k} high HR`);
      });
      startCardio({ ...base, machine: id, cue: cardioPrimary(M), warm: M.knobs[cardioPrimary(M)].def, work: M.knobs[cardioPrimary(M)].def, start: {} });
      render();
      if (!document.querySelector('#cdClock')) bad.push(`${id} live view`);
      S.active.cardio.t0 -= 60000;
      finishCardio();
      close();
      const wo = S.workouts.filter(w => w.kind === 'cardio').slice(-1)[0];
      if (!wo || wo.cardio.machine !== id) bad.push(`${id} not saved`);
      else { cardioBlock(wo, true); cardioCardCanvas(wo); S.workouts = S.workouts.filter(w => w !== wo); }
    });
    S.active = null; save(); render();
    if (bad.length) throw new Error(bad.join(', '));
    return `${Object.keys(CARDIO_MACHINES).length} machines`;
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
    /* Unusual equipment is greyed but still pickable (B9): class "odd", with
       data-axpick. Execution stays locked: class "off", disabled. */
    const odd = rows.filter(r => r.classList.contains('odd'));
    if (!rows.length) throw new Error('picker had no rows');
    if (!odd.length) throw new Error('nothing greyed — unusual equipment should be visible');
    if (odd.some(r => r.disabled || !r.dataset.axpick)) throw new Error('greyed equipment should still be selectable');
    document.querySelector('[data-axtab="execution"]').click(); await wait(100);
    const off = [...document.querySelectorAll('.axrow.off')];
    if (off.some(r => !r.disabled)) throw new Error('invalid executions should be unselectable');
    close(); S.active = null; save(); render();
    return `${rows.length} options, ${odd.length} unusual, ${off.length} executions locked`;
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

  await step('flow: coach report and PR card (E1, E2)', async () => {
    openTool('report'); await wait(200);
    if (modalTitle() !== 'Coach report') throw new Error(`report opened "${modalTitle()}"`);
    const prev = document.querySelector('#rpPrev').textContent;
    close(); await wait(60);
    const R = reportData('2000-01-01', today(), { warm: false, notes: true, checkins: true });
    const txt = reportText(R), html = reportHtml(R);
    if (!txt.startsWith('TRAINING REPORT') || !html.includes('<h1>')) throw new Error('report text/html malformed');
    const wo = S.workouts.find(w => w.status === 'completed' && w.exercises.some(e => e.leaf));
    if (!wo) return `report ${R.count} sessions (no session for a PR card)`;
    const e = wo.exercises.find(x => x.leaf), s = e.sets[0] || { w: 100, r: 5 };
    const c = prCardCanvas({ name: exName(e), key: exKey(e), w: s.w || 100, r: s.r || 5, e1: e1rm(s.w || 100, s.r || 5) }, wo);
    if (c.width !== 1080 || c.height !== 1350) throw new Error('PR card wrong size');
    return `report ${R.count} sessions, ${txt.split('\n').length} lines, preview ${prev.length} chars; PR card ${c.width}x${c.height}`;
  });

  await step('flow: debug mode traces (E11)', async () => {
    const was = S.settings.debug;
    S.settings.debug = false;
    if (why('e1', 100, 5, 8) !== '') throw new Error('why() drew a button with debug off');
    S.settings.debug = true;
    try {
      if (!why('e1', 100, 5, 8).includes('data-why="e1"')) throw new Error('no how? button with debug on');
      const bad = [], ran = [];
      const run = (k, ...a) => {
        const t = WHY[k].fn(...a);
        if (!t) return;
        ran.push(k);
        t.checks.filter(c => !c.same).forEach(c => bad.push(`${k}: ${c.what} ${c.mine} vs ${c.app}`));
        if (!traceText(t).startsWith('How:')) bad.push(`${k}: text`);
      };
      run('e1', 100, 5, 8); run('e1', 140, 1, null); run('e1', 60, 15, 7); run('rir', 7.5);
      run('dots', 600, 93, 'male', false); run('dots', 120, 60, 'female', true);
      const rk = allRanks()[0]; if (rk) run('rank', rk.key);
      const wo = S.workouts.find(w => w.status === 'completed' && prsFor(w).length); if (wo) run('pr', wo.id, 0);
      Object.keys(fatigueMap()).slice(0, 3).forEach(k => run('rec', k));
      (S.calipers || []).slice(0, 2).forEach(c => run('cal', c.id));
      MOB_TESTS.forEach(T => run('mob', T.id));
      run('vbt', { place: 'bar', reps: [{ v: .62, peak: .9 }, { v: .55, peak: .8 }, { v: .48, peak: .7 }], loss: 22.6, conf: .8, est: null });
      const leaf = (S.workouts.flatMap(w => w.exercises).find(e => e.leaf && slewLiftFor(e.leaf)) || {}).leaf;
      if (leaf) run('lv', { leaf, lvp: { points: [{ kg: 60, v: 1 }, { kg: 80, v: .85 }, { kg: 100, v: .7 }, { kg: 120, v: .56 }] } });
      run('range', { range: [5, 8], notes: 'rir 2', leaf }, [{ w: 100, r: 8, rpe: 8, done: true }, { w: 100, r: 7, rpe: 8, done: true }], today());
      cardioWhyLast = { cfg: { machine: 'treadmill', lo: 130, hi: 145, ceiling: 170, interval: 60, cue: 'speed', work: 8, warm: 8, warmMin: 0 },
        st: { el: 400, hr5: 152, hr20: 150, v: { speed: 8, incline: 1 }, lastCheck: 330, lastChange: 200, lastCeil: null, warmDone: true }, d: null };
      run('cardio');
      cardioWhyLast = null;
      openWhy('e1', [100, 5, 8]); await wait(80);
      if (!/^How:/.test(modalTitle())) throw new Error(`trace sheet opened "${modalTitle()}"`);
      close();
      if (bad.length) throw new Error(bad.join('; '));
      return `${ran.length} traces, all agree (${[...new Set(ran)].join(', ')})`;
    } finally { S.settings.debug = was; }
  });

  await step('flow: fitting test (E12)', async () => {
    const keep = { w: S.workouts.length, m: (S.mobTests || []).length, f: (S.fitTests || []).length, d: S.fitDraft };
    const D = fitNewDraft('full');
    D.bw = 93; D.sex = 'male'; D.age = 40;
    Object.assign(D.home, { k2w: { L: 9, R: 13 }, scratch: { L: 5, R: 20 }, ohs: { flat: 1, heels: 2 }, bal: { L: 6, R: 12 } });
    D.power = { mode: 'jump', cm: 45 };
    // the spec's worked example (§4): 93 kg, trap bar high handles
    const L = D.ladder.hinge;
    if (fitLadderNext(L, 'hinge', 93).kg !== 47.5) throw new Error('hinge should start at 47.5');
    [[47.5, 8, 6], [92.5, 5, 5], [140, 3, 3], [162.5, 2, 1]].forEach(([kg, r, rir]) => L.sets.push({ kg, r, rpe: rirToRpe(rir) }));
    const nx = fitLadderNext(L, 'hinge', 93);
    if (!nx.stop || !nx.canExtra) throw new Error('RIR 1 should offer a stop or +10%');
    L.done = true;
    D.ladder.press.sets.push({ kg: 70, r: 5, rpe: rirToRpe(1) });
    D.tol = { kg: 200, r: 11 }; D.grip = { mode: 'bar', sec: 25 }; D.engine = { sec: 105, hrEnd: 170, hr60: 150 };
    const R = fitResults(D), hinge = R.strength.find(s => s.id === 'hinge');
    if (Math.abs(hinge.e1 - 178.75) > 0.01) throw new Error(`hinge e1RM ${hinge.e1}, spec says 178.8`);
    if (hinge.score !== 2) throw new Error(`hinge score ${hinge.score}`);
    // ankles and balance both score 2 at age 40; ties go to the first non-strength test
    if (!/lagging/.test(R.type) || !/work on ankles/.test(R.type)) throw new Error(`profile "${R.type}"`);
    if (!R.flags.some(f => f.id === 'ohs') || !R.flags.some(f => f.id === 'k2w_gap')) throw new Error('missing ohs / asymmetry flags');
    S.fitDraft = D;
    const t = fitSave(D);
    try {
      const wo = S.workouts.find(w => w.fitTest === t.id);
      if (!wo || wo.exercises.length !== 3) throw new Error('ladder session not logged');
      if (S.mobTests.filter(m => m.fit === t.id).length !== 8) throw new Error('home results not in mobility tests');
      S.settings.debug = true;
      const tr = WHY.fit.fn(t.id, 'balance');
      if (!tr || tr.checks.some(c => !c.same)) throw new Error('fit trace disagrees');
      openFitResults(t.id); await wait(80);
      if (modalTitle() !== 'Fitting test results') throw new Error(`results opened "${modalTitle()}"`);
      close();
      return `${R.strength.length} patterns, ${R.others.length} tests, ${R.flags.length} flags — "${R.type}"`;
    } finally {
      S.settings.debug = false;
      S.workouts = S.workouts.filter(w => w.fitTest !== t.id);
      S.mobTests = S.mobTests.filter(m => m.fit !== t.id);
      S.fitTests = S.fitTests.filter(x => x.id !== t.id);
      S.fitDraft = keep.d; bust(); save();
      if (S.workouts.length !== keep.w || S.mobTests.length !== keep.m || S.fitTests.length !== keep.f) throw new Error('cleanup left data behind');
    }
  });

  await step('flow: AI on your own key — meter and cap (D8)', async () => {
    const realFetch = window.fetch, oldKey = aiKey(), oldUse = localStorage.getItem('ironlog.aiUsage'), oldCap = S.settings.aiCap;
    let sent = null, hits = 0;
    window.fetch = async (url, o) => {
      if (!String(url).includes('api.anthropic.com')) return realFetch(url, o);
      hits++; sent = JSON.parse(o.body);
      return new Response(JSON.stringify({ model: AI_MODEL, content: [{ type: 'text', text: '{"exercise":"bench","kg":100,"reps":5,"rpe":8}' }],
        stop_reason: 'end_turn', usage: { input_tokens: 450, output_tokens: 40 } }), { status: 200 });
    };
    try {
      setAiKey(''); localStorage.removeItem('ironlog.aiUsage');
      if (aiStatus() !== 'nokey') throw new Error('no key should read as nokey');
      try { await aiCall({ feature: 'voice', user: 'x' }); throw new Error('called without a key'); } catch (e) { if (!e.nokey) throw e; }
      setAiKey('sk-ant-smoke'); S.settings.aiCap = 1;
      const r = await claudeParseSet('bench a hundred for five');
      if (r.kg !== 100 || sent.model !== AI_MODEL || sent.thinking.type !== 'disabled') throw new Error('bad request or parse');
      const u = aiUsage();
      if (u.calls !== 1 || u.inTok !== 450 || Math.abs(u.usd - aiPrice(AI_MODEL, 450, 40)) > 1e-12) throw new Error('usage not recorded');
      S.settings.aiCap = u.usd;   // spent == cap → paused
      try { await aiCall({ feature: 'voice', user: 'x' }); throw new Error('cap not enforced'); } catch (e) { if (!e.capped) throw e; }
      if (hits !== 1) throw new Error(`${hits} network calls, expected 1`);
      return `1 call, ${usd(u.usd)} recorded; no key and cap both block before the network`;
    } finally {
      window.fetch = realFetch; setAiKey(oldKey); S.settings.aiCap = oldCap;
      oldUse ? localStorage.setItem('ironlog.aiUsage', oldUse) : localStorage.removeItem('ironlog.aiUsage');
    }
  });

  await step('flow: coach — setup chat, plan builder, accept (D9)', async () => {
    const keep = { coach: JSON.stringify(S.coach || {}), places: JSON.stringify(S.settings.places || []), programs: [...S.programs], n: S.workouts.length };
    let pid = null;
    try {
      const gym = { id: 'zzgym', name: 'Gym', kit: ['bodyweight', ...PLACE_PRESETS[1].kit] };
      const home = { id: 'zzhome', name: 'Home', kit: ['bodyweight', 'dumbbells', 'resistance_band'], extras: ['bench'] };
      S.settings.places = [...JSON.parse(keep.places), gym, home];
      // the spec's two test cases
      const aaron = coachBuild({ goal: 'strongman', where: 'gym', gymPlace: 'zzgym', days: ['mon', 'tue', 'wed', 'thu', 'fri'], minutes: 45,
        experience: 'over2y', priority: ['deadlift/trap_bar/bilateral/none'], easy: [] }, null);
      const lower = aaron.days.find(d => d.name === 'Lower');
      if (lower.A[0].key !== 'deadlift/trap_bar') throw new Error(`Lower main ${lower.A[0].key}`);
      if (!lower.A.some(x => x.event)) throw new Error('no strongman event on Lower');
      if (aaron.days.some(d => d.A.length !== 7)) throw new Error('45 min should hold 7');
      aaron.days.forEach(d => ['A', 'B'].forEach(w => { const ks = (d[w] || []).map(x => x.key);
        if (ks.some(k => k.startsWith('leg-press/')) && ks.some(k => k.startsWith('back-squat/') || k === 'deadlift/trap_bar')) throw new Error(`${d.name} ${w}: leg press with squat or trap bar`); }));
      const chelsea = coachBuild({ goal: 'general', where: 'both', gymPlace: 'zzgym', homePlace: 'zzhome', days: ['mon', 'wed', 'fri'],
        dayPlace: { wed: 'home' }, minutes: 45, experience: 'under6m', easy: ['knees'] }, null);
      if (chelsea.days.some(d => d.B)) throw new Error('beginners get no B week');
      if (chelsea.days.some(d => d.A.some(x => x.rir != null && x.rir < 2))) throw new Error('beginner RIR under 2');
      if (chelsea.days[0].A[0].key !== 'bench-press/dumbbells') throw new Error(`beginner bench ${chelsea.days[0].A[0].key}`);
      const homeDay = chelsea.days.find(d => d.placeName === 'Home');
      if (homeDay.A.some(x => !kitHas(x.key.split('/')[1], home))) throw new Error('home day uses kit that isn\'t at home');
      // the chat: open, answer the first step, accept a plan
      S.coach = { setupDone: false, answers: {}, notes: [] };
      openCoach(); await wait(80);
      if (modalTitle() !== 'Coach') throw new Error(`coach opened "${modalTitle()}"`);
      const chip = document.querySelector('#coAns [data-cov="strength"]');
      if (!chip) throw new Error('first question has no Strength chip');
      chip.click(); await wait(40);
      if (S.coach.answers.goal !== 'strength') throw new Error('answer not stored');
      close();
      let n = 0;
      coachAccept(aaron, k => { n = k; });
      await wait(40);
      if (modalTitle() === 'Other planned sessions') { document.querySelector('#coKeep').click(); await wait(40); }
      pid = S.coach.planProg;
      const ws = S.workouts.filter(w => w.prog === pid);
      if (!n || ws.length !== n || ws[0].loads !== 'rir' || ws[0].exercises.some(e => !e.leaf)) throw new Error(`accept installed ${ws.length}/${n}`);
      return `Aaron: ${aaron.days.map(d => d.A[0].key.split('/')[0]).join(', ')}; Chelsea starts ${chelsea.days.map(d => d.A[0].key.split('/')[0]).join(', ')}; accept → ${n} sessions`;
    } finally {
      if (pid) removeProgram(pid);
      S.coach = JSON.parse(keep.coach); S.settings.places = JSON.parse(keep.places); S.programs = keep.programs; bust(); save(); close();
      if (S.workouts.length !== keep.n) throw new Error('cleanup left sessions behind');
    }
  });

  await step('food removed: tab gone, old route lands home', async () => {
    close();
    if (document.querySelector('#nav [data-page="food"]')) throw new Error('Food tab still in the nav');
    go('food'); await wait(100);
    if (page !== 'home') throw new Error(`go('food') landed on ${page}`);
    return `${document.querySelectorAll('#nav button').length} tabs`;
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
