/* Ironlog — the log itself. S is the whole state: settings, sessions, check-ins,
   everything. It lives here, below everything else, so the helpers in core.js and
   the UI kit can read it without importing storage. database.js loads, saves,
   syncs and migrates it; nothing else replaces it (setState is the one way). */

export const DEFAULT_STATE = {
  settings: {
    units: 'kg',            // kg | lb
    skin: 'ironlog',        // ironlog | win98 — paint only, no behaviour changes with it
    bodySkin: 'template',   // muscle map skin: an id from BODY_SKINS, or 'custom' (imported sheet)
    // --- profile. Deliberately still settings fields rather than a new S.profile:
    // sex already drives DOTS from here and handle already reaches the share card,
    // so moving them would mean a migration and a second place to look for the
    // same fact. Profile is a view over these, not another copy of them.
    sex: 'male',            // for DOTS
    bodyweight: 0,          // kg (fallback if no check-ins)
    dob: '',                // YYYY-MM-DD -> age, for masters category and BMR
    heightCm: 0,            // for BMR
    activity: 'moderate',   // sedentary | light | moderate | high | athlete
    nutritionGoal: 'maintain',   // lose | maintain | gain
    priority: ['Back Squat', 'Bench Press', 'Deadlift'],
    restDefault: 180,       // rest after a main lift's working set, seconds
    restAccessory: 90,      // rest after anything else
    restWarn: 10,           // warning beep this many seconds before rest ends; 0 = off
    restAuto: true,         // start the rest timer when a set is ticked
    restBy: {},             // exKey -> seconds, a per-exercise default set from its menu
    cardio: null,           // last cardio setup (see CARDIO_DEF); null = defaults
    sound: true,            // timer beeps (hold count-in, rest end)
    vibrate: true,          // timer haptics, where the phone supports them
    openerPct: 90,          // opener as a % of the latest tested single
    barKg: 20,              // empty bar, for warm-up ramps
    smithKg: null,          // Smith carriage; null = not measured yet. Logged Smith
                            // loads already include it, so this is only used to work
                            // out which plates to hang on.
    platformPct: 96,        // gym max -> platform estimate
    bars: [{ name: 'Barbell', kg: 20 }],
    plates: null,           // null = DEFAULT_PLATES
    // Slew velocity profiles, keyed by its lift id. Population defaults until a
    // set taken to failure measures this lifter's own 0-RIR velocity.
    slewProfiles: {},
  },
  checkins: [],   // {date,'YYYY-MM-DD', weight(kg), sleepH, sleepQ, energy, soreness, stress, kcal, notes}
  workouts: [],   // {id,date,name,status,source,exercises:[{name,notes,sets:[{w,r,rpe,done,warm}]}],start,end,summary,edited?}
                  // source: 'logged' | 'backfill' | 'imported' — only 'backfill' is the plan's prescription
  misses: [],     // {id,wid,date,name,prog,reason,note,movedTo,at,mt,wo?} — a planned session that didn't happen, and why.
                  // date = the day it was planned for; movedTo = the day it went to (null = skipped);
                  // wo = a copy of a skipped session, so Undo can put it back
  goals: [],      // {id,name,type,exercise,startVal,target,deadline,current(for custom)}
  meets: [],      // {id,name,date,fed,loc,wclass,bwTarget,lifts:{squat,bench,deadlift},pct:{o,s}}
  customEx: [],   // extra exercise names
  exAliases: {},  // imported exercise name -> Ironlog name, so a re-import doesn't re-ask
  active: null,   // active workout object
  programs: [],   // ids of installed training programs
  programStarts: {},  // program id -> the start date it was installed against
  imports: [],    // {id,source,at,sessions,replaced:[backfills it displaced]} — so an import can be taken back out
  measures: [],   // {id,date,cm:{site:cm},custom:{name:cm},mt} — E4 body measurements
  calipers: [],   // {id,date,method:'jp3'|'jp7'|'dw4',sex,age,mm:{site:[readings]},mt} — E4; results derived when shown
  mobTests: [],   // {id,date,test,side:'L'|'R'|null,v,mt} — E5 mobility and balance tests (MOB_TESTS)
  routines: [],   // {id,name,items:[{id,dose?}],mt} — the lifter's own mobility routines, made from MOBILITY_LIBRARY
  bp: [],         // {id,date,time,sys,dia,pulse?,arm?,note?,mt} — D16 blood pressure, mmHg
  glucose: [],    // {id,date,time,mmol,ctx,note?,mt} — D16 blood glucose, always stored in mmol/L
  fitTests: [],   // {id,date,mode:'home'|'full',bw,sex,age,home,power,ladder:{pattern:{variation,sets:[{kg,r,rpe}]}},tol,grip,engine,mt} — E12
  fitDraft: null, // the fitting test in progress, this device only (not synced)
  coach: { setupDone: false, answers: {}, notes: [] },   // D9 coach memory: answers, notes, plan — synced
  programNames: {},   // program id -> name, for coach-built and imported programs (PROGRAM_NAMES covers shipped ones)
  exNotes: {},    // movement id -> {text, mt} — Your notes on the Info tab (exercise-demo-spec §4), synced
};

export let S = structuredClone(DEFAULT_STATE);   // replaced by the real state in boot()
export function setState(v) { return S = v; }   // S is assigned from other modules; an import is read-only
