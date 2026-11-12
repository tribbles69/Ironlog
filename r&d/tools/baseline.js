/* Baseline checks for the module split (r&d/notes/module-split.md): a
   click-through of every page and a CSV round trip. Both give a fingerprint,
   so "nothing changed" is a string comparison before and after a move.

   Run in the page, after smoke.js is loaded (it does the seeding):

     for (const f of ['smoke', 'baseline']) await fetch(`r&d/tools/${f}.js`).then(r => r.text()).then(t => (0, eval)(t));
     await baseline()          // → { csv: {...}, clicks: { empty: {...}, migrated: {...} } }

   Start each pass from a wiped install, one seed per pass:

     await baseline.wipe(); location.reload();     // then load the two scripts again
     await baseline({ seeds: ['empty'] })          // wipe + reload, then ['migrated']

   The wipe matters twice over. The service worker serves cached files first,
   so without it the page under test is whatever was cached, not what is on
   disk. And the click-through changes state as it goes (it presses
   everything), so a second pass on the same install presses different things.
   It deletes this origin's Ironlog data: only run it on a dev server.

   What to compare: errors (should be none), clicks per page, and on the
   empty seed the signature, which is the same every run on the same day
   (labels can carry the date). The migrated seed has live timers in it and
   varies by a few clicks from run to run.

   The click-through finds things to click from the DOM alone. The only app
   names it needs are looked up through app() below, which is the one place to
   change when a name stops being a global.
*/
(() => {
  /* App names. Today every one is a global of the page's single script.
     After a module is split out, names are looked up in window.__ironlogModules
     (a list of module paths set by the caller, or the default below). */
  const MODULES = ['./js/core.js', './js/database.js', './js/exercises.js', './js/stats.js', './js/ui.js', './js/health.js',
    './js/tools.js', './js/events.js', './js/workout.js', './js/vbt.js', './js/coach.js'];
  let spaces = null;
  async function app(name) {
    try { const v = (0, eval)(`typeof ${name} === 'undefined' ? undefined : ${name}`); if (v !== undefined) return v; } catch (e) { /* not a global */ }
    if (!spaces) {
      spaces = [];
      for (const m of (window.__ironlogModules || MODULES)) { try { spaces.push(await import(new URL(m, location.href).href)); } catch (e) { /* not split out yet */ } }
    }
    for (const ns of spaces) if (name in ns) return ns[name];
    throw new Error(`baseline: app name ${name} not found`);
  }

  const yieldTask = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
  const wait = async n => { for (let i = 0; i < (n || 4); i++) await yieldTask(); };
  async function sha(text) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }
  const sorted = v => Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted(v[k])])) : v;

  /* ---------------- CSV round trip ---------------- */
  /* Fixed sessions, the awkward shapes included: no exercises key, no sets, an
     odd leaf, nulls, nested fields, and text that needs quoting. */
  function csvFixture() {
    const leaf = { movement: 'bench-press', equipment: 'barbell', execution: 'bilateral', attachment: 'none' };
    const set = (w, r, x) => Object.assign({ w, r, rpe: 8, done: true, setType: 'working' }, x || {});
    return [
      { id: 'b1', date: '2026-08-10', name: 'Plain', status: 'completed', source: 'logged', start: 1786000000000, end: 1786002700000,
        exercises: [{ leaf, legacyName: 'Bench Press', notes: 'comp pause', mods: [], sets: [set(60, 5, { setType: 'warmup' }), set(85, 5), set(85.5, 4, { rpe: 9.5 })] }],
        summary: { mins: 45, prs: [], volume: 1192 } },
      { id: 'b2', date: '2026-08-11', name: 'Quotes, "commas"\nand a new line', status: 'completed', source: 'imported',
        exercises: [{ leaf: { ...leaf, equipment: 'dumbbell' }, legacyName: ' leading space', notes: 'said "easy", then 2,5 kg more\r\nnext line', mods: ['paused', 'tempo'],
          sets: [set(32.5, 10, { note: 'ünïcödé — 力', vbt: { reps: [{ v: 0.41, rom: 0.38 }, { v: 0.36, rom: 0.37 }], est: { rpe: 8.5 } } })] }] },
      { id: 'b3', date: '2026-08-12', name: '', status: 'planned', source: 'program', programId: 'p1', exercises: [] },
      { id: 'b4', date: '2026-08-13', name: 'No exercises key', status: 'missed', missReason: 'ill' },
      { id: 'b5', date: '2026-08-14', name: 'Odd leaves', status: 'completed', source: 'logged', end: null,
        exercises: [
          { leaf: null, legacyName: 'Mystery Lift', sets: [set(20, 10)] },
          { leaf: { ...leaf, extra: 'x' }, sets: [] },
          { leaf: 'custom-123', notes: null, sets: [set(0, 0, { done: false, rpe: null, w: null }), set(100, 1, { setType: 'drop', sides: { l: 5, r: 6 } })] },
          { legacyName: 'No leaf at all', timed: true, sets: [{ secs: 45, done: true }, { secs: 0, done: false, w: 10 }] },
        ] },
      { id: 'b6', date: '2026-08-14', name: 'Same day', status: 'completed', source: 'backfill', cardio: { machine: 'treadmill', mins: 30, hr: [120, 131, 140] },
        exercises: [{ leaf, sets: [set(1e-7, 1), set(102.05828, 3, { unit: 'lb' }), set(-5, 12)] }], tags: [], flags: { a: true, b: false, c: 0, d: '' } },
    ];
  }
  async function csvRoundTrip() {
    const [workoutsToCSV, csvToWorkouts] = [await app('workoutsToCSV'), await app('csvToWorkouts')];
    const S = await app('S');
    const run = async (label, list) => {
      const csv = workoutsToCSV(list), back = csvToWorkouts(csv);
      /* differences by path, key order aside (an import builds each record's keys in column order) */
      const diffs = [];
      const walk = (a, b, p) => {
        if (a === b) return;
        if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], `${p}.${k}`); return; }
        diffs.push(`${p}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
      };
      walk(list, back, '');
      /* the fixture's fingerprints are fixed; the state's are not (the seed stamps today's date) */
      const r = { label, sessions: list.length, rows: csv.split('\r\n').length - 2, diffs };
      return label === 'fixture' ? { ...r, csv: await sha(csv), back: await sha(JSON.stringify(sorted(back))), bytes: csv.length } : r;
    };
    return [await run('fixture', csvFixture()), await run('state', JSON.parse(JSON.stringify(S.workouts)))];
  }

  /* ---------------- click-through ---------------- */
  const SKIP = /erase|reload|sign in|connect|google|drive|sync now|install|update now|share|print|camera|record|photo|microphone|dictate|speak|bluetooth|pair|strap|notif/i;
  function stub() {
    if (window.__baselineStubbed) return; window.__baselineStubbed = true;
    window.print = () => {}; window.open = () => null; window.alert = () => {}; window.confirm = () => false; window.prompt = () => null;
    const click = HTMLElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download') || /^(blob|data|https?):/.test(this.getAttribute('href') || '')) return; return click.call(this); };
    HTMLInputElement.prototype.click = function () { if (this.type === 'file') return; return click.call(this); };
    const f = window.fetch.bind(window);
    window.fetch = (u, o) => { const url = new URL(typeof u === 'string' ? u : u.url, location.href); return url.origin === location.origin ? f(u, o) : Promise.reject(new TypeError('baseline: network off')); };
    try { navigator.share = () => Promise.reject(new DOMException('baseline', 'AbortError')); } catch (e) { /* read-only */ }
    try { navigator.vibrate = () => false; } catch (e) { /* read-only */ }
    /* no camera, microphone or speech: the same refusal every run */
    try { navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('baseline', 'NotAllowedError')); } catch (e) { /* read-only */ }
    try { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; } catch (e) { /* read-only */ }
  }
  const visible = el => !!(el.offsetParent || el.getClientRects().length) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
  /* Things a finger would try: buttons and anything showing a pointer cursor
     that is not inside another such thing. */
  function clickables(root) {
    const out = [];
    for (const el of root.querySelectorAll('*')) {
      if (!visible(el)) continue;
      const tag = el.tagName;
      const isCtl = tag === 'BUTTON' || tag === 'SUMMARY' || el.getAttribute('role') === 'button' || (tag === 'INPUT' && /checkbox|radio/.test(el.type));
      const pointer = !isCtl && tag !== 'A' && getComputedStyle(el).cursor === 'pointer' && !(el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') && !el.closest('button, summary, [role=button], label');
      if (!isCtl && !pointer) continue;
      if (SKIP.test(label(el))) continue;
      out.push(el);
    }
    return out;
  }
  const label = el => ((el.getAttribute('aria-label') || el.title || el.textContent || el.id || el.className || el.tagName) + '').replace(/\s+/g, ' ').trim().replace(/\d+/g, '#').slice(0, 40);
  const modalRoot = () => document.getElementById('modalRoot');
  const topModal = () => { const m = modalRoot().children; return m.length ? m[m.length - 1] : null; };

  async function clickthrough(opts) {
    const o = Object.assign({ perScope: 120, perModal: 40 }, opts);
    stub();
    const closeAllModals = await app('closeAllModals');
    const errors = [], seq = [];
    const onErr = e => errors.push({ at: seq[seq.length - 1] || '(start)', msg: String(e.message || (e.reason && e.reason.message) || e.reason || e) });
    window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
    const cerr = console.error; let consoleErrors = 0; console.error = (...a) => { consoleErrors++; cerr.apply(console, a); };
    const entries = [...document.querySelectorAll('#nav button, #topbar button')].map(b => ({ sel: b.id ? '#' + b.id : `#nav button[data-page="${b.dataset.page}"]`, name: label(b) }));
    const perPage = {};
    const enter = async e => {
      closeAllModals(); await wait(2);
      const home = document.querySelector('#nav button[data-page="home"]'); if (home) { home.click(); await wait(2); }
      const b = document.querySelector(e.sel); if (b) { b.click(); await wait(4); }
      return topModal() || document.getElementById('view');
    };
    const press = async (el, tag) => { seq.push(tag); try { el.click(); } catch (err) { errors.push({ at: tag, msg: 'threw: ' + err.message }); } await wait(4); };
    for (const e of entries) {
      let n = 0;
      const depth0 = (await enter(e)) === document.getElementById('view') ? 0 : 1;
      const count = Math.min(o.perScope, clickables(await enter(e)).length);
      for (let k = 0; k < count; k++) {
        const scope = await enter(e);
        const el = clickables(scope)[k]; if (!el) break;
        const tag = `${e.name} › ${label(el)}`;
        const before = modalRoot().children.length;
        await press(el, tag); n++;
        /* one level into whatever sheet that opened */
        if (modalRoot().children.length > before && depth0 === 0) {
          const m = Math.min(o.perModal, clickables(topModal()).length);
          for (let j = 0; j < m; j++) {
            const sc = await enter(e);
            const again = clickables(sc)[k]; if (!again || label(again) !== label(el)) break;
            again.click(); await wait(4);
            const tm = topModal(); if (!tm) break;
            const inner = clickables(tm)[j]; if (!inner) break;
            await press(inner, `${tag} › ${label(inner)}`); n++;
          }
        }
      }
      perPage[e.name] = n;
    }
    closeAllModals();
    window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr); console.error = cerr;
    return { clicks: seq.length, perPage, errors, consoleErrors, signature: await sha(seq.join('\n')), seq };
  }

  /* Both checks on the smoke test's seeds. Skin: pass { skins: ['', 'win98'] } to do each. */
  window.baseline = async function baseline(opts) {
    const o = Object.assign({ seeds: ['empty', 'migrated'] }, opts);
    if (typeof window.smoke !== 'function') throw new Error('load smoke.js first — it does the seeding');
    const out = { version: await app('APP_VERSION'), csv: null, clicks: {} };
    for (const seed of o.seeds) {
      await window.smoke({ seed });
      if (seed === 'migrated') out.csv = await csvRoundTrip();
      const r = await clickthrough(o);
      out.clicks[seed] = { clicks: r.clicks, errors: r.errors, consoleErrors: r.consoleErrors, signature: r.signature, perPage: r.perPage };
      (window.__baselineSeq = window.__baselineSeq || {})[seed] = r.seq;
    }
    console.log('baseline', JSON.stringify(out, null, 1));
    return out;
  };
  /* Back to a first install: service worker, its caches, the stored log and the settings mirror. */
  window.baseline.wipe = async function wipe() {
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) throw new Error('baseline.wipe: dev server only');
    if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    for (const k of await caches.keys()) await caches.delete(k);
    Object.keys(localStorage).filter(k => k.startsWith('ironlog')).forEach(k => localStorage.removeItem(k));
    for (const d of await indexedDB.databases()) indexedDB.deleteDatabase(d.name);
    return 'wiped — reload now';
  };
  window.baseline.clickthrough = clickthrough;
  window.baseline.csvRoundTrip = csvRoundTrip;
  return 'baseline loaded';
})();
