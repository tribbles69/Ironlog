#!/usr/bin/env python3
"""Build program.json for the WDC Records A/B PPLUL block.

Written 19 Oct 2026 with Aaron in chat, after he moved his goals from IPF
powerlifting to the World Deadlifting Council 90 kg class records:
16" trap bar deadlift (500 kg) and 21" Viking deadlift (400 kg), plus big back
strength and pressing (incline on A Monday, OHP on A Thursday).

Rules agreed in that chat:
  - A week heavy, B week volume/skill, Mon-Fri Push/Pull/Legs/Upper/Lower.
  - A Monday push stays chest-focused; OHP is the A Thursday main lift.
  - Trap bar and leg press never share a day, so B Legs is leg-press focused
    and the fast trap bar pulls live on B Lower.
  - 45-minute sessions. No weights in the plan: RIR decides (loads: "rir").
  - The gym caps out near 225 kg, so the record heights are trained as raised
    pulls up to the cap, then isometrics into the pins.

Run from the repo root:  python3 "r&d/tools/build-program-wdc.py"
Then paste the printed manifest over PROGRAM_MANIFEST in index.html.
"""
import json, os, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CAT = json.load(open(os.path.join(ROOT, 'r&d', 'data', 'exercises.json')))
MOVES = {m['id']: m for m in CAT['movements']}
BY_NAME = {}
for m in CAT['movements']:
    BY_NAME[m['name'].lower()] = m
    for a in m.get('aliases', []):
        BY_NAME.setdefault(a['name'].lower(), m)

WEEKS = 8
# Fixed start so installing lands sessions on real dates with no question.
# Aaron chose to start (and test) the week of 19 Oct 2026, going into a bulk.
START = datetime.date(2026, 10, 19)   # a Monday


def ex(name, sets, notes='', equipment=None, attachment=None, iso=False):
    m = BY_NAME.get(name.lower())
    if equipment and m and equipment not in m['equipment']:
        raise SystemExit(f'{name}: {equipment} not allowed ({m["equipment"]})')
    if (equipment or attachment) and not m:
        raise SystemExit(f'{name}: custom movement cannot pin equipment')
    e = {'name': name, 'notes': notes, 'sets': sets}
    if equipment: e['equipment'] = equipment
    if attachment: e['attachment'] = attachment
    if iso: e['iso'] = True
    return e


def reps(n, r, t, kind='working'):
    return [{'w': None, 'r': r, 'type': kind, 't': t} for _ in range(n)]


def amrap(t=1):
    return [{'w': None, 'r': None, 'type': 'amrap', 't': t, 'like': 'prev'}]


def top_then_backoff(r_top, t_top, n_back, r_back, t_back):
    return reps(1, r_top, t_top, 'top') + reps(n_back, r_back, t_back, 'backoff')


def hold(n, sec=None):
    # sec None = max-time hold (test mode); a number = planned target hold
    return [{'w': None, 'sec': sec, 'hold': 'test' if sec is None else 'planned'} for _ in range(n)]


def carry(n, metres, t):
    return [{'w': None, 'm': metres, 't': t} for _ in range(n)]


# ---------------- A week (heavy) ----------------
def a_week(wk):
    base = wk == 1
    peak = wk == 7
    t = {1: 2, 3: 2, 5: 1, 7: 1}[wk]
    if base:
        rec = lambda h: (top_then_backoff(1, 1, 2, 3, 3),
                         f'BASELINE. {h}. Work up to a top single, stop at the gym plate cap. Log the height in the note.')
    elif peak:
        rec = lambda h: (top_then_backoff(1, 0, 2, 3, 2),
                         f'HEAVY SINGLE. {h}. New baseline for the next block. At the cap, add a 3 s pause at the start instead.')
    else:
        rec = lambda h: (top_then_backoff(3, t, 2, 3, t + 1),
                         f'{h}. At the plate cap: add reps, then a 2 s pause at the start, then a lockout hold.')
    trap_sets, trap_note = rec('16 in from floor to underside of the bar, plates raised on mats')
    vik_sets, vik_note = rec('21 in (53 cm) to underside of the bar, blocks or pins')

    push = ('Push', [
        ex('Incline Bench', reps(4, 5, t) + (amrap(1) if wk >= 5 else []), 'main lift', equipment='smith'),
        ex('Machine Chest Press', reps(3, 8, t), equipment='machine'),
        ex('Low to High Cable Fly', reps(3, 10, 1), 'superset with Rope Pushdown', equipment='cable', attachment='single_handle'),
        ex('Rope Pushdown', reps(3, 10, 1), 'superset with Low to High Cable Fly'),
    ])
    pull = ('Pull', [
        # No shrugs or grip hold here (19 Oct): the pull's lockout out-loads any
        # shrug, and grip work after it only measures fatigue.
        ex('Rack Pull', trap_sets, trap_note + ' Straps on.', equipment='trap_bar'),
        ex('Chest Supported Row', reps(4, 6, t)),
        ex('Lat Pulldown', reps(3, 8, 2), 'superset with Hammer Curl'),
        ex('Hammer Curl', reps(2, 10, 1), 'superset with Lat Pulldown'),
    ])
    legs = ('Legs', [
        ex('Back Squat', reps(4, 5, t), 'Smith, full depth. Gym has no hack squat.', equipment='smith'),
        ex('Farmers Carry', carry(3, 20, 1), 'heavy, 20 m'),
        ex('Smith Calf Raise', reps(3, 8, 1), 'superset with Tibialis Raise'),
        ex('Tibialis Raise', reps(3, 12, 1), 'superset with Smith Calf Raise'),
    ])
    upper = ('Upper', [
        ex('Strict Press', reps(4, 5, t) + (amrap(1) if wk >= 5 else []), 'main lift. From pins at collarbone, dead stop each rep'),
        ex('Landmine Press', reps(3, 8, 2), 'per arm, standing square-on'),
        ex('Chest Supported Row', reps(3, 8, 2)),
        ex('Face Pull', reps(3, 12, 1), 'two D-handles, seated on the floor, superset with Cable Lat Raise', attachment='dual_handle'),
        ex('Cable Lat Raise', reps(3, 12, 1), 'superset with Face Pull', equipment='cable'),
    ])
    lower = ('Lower', [
        ex('Rack Pull', vik_sets, vik_note + ' Straps on.'),
        ex('Rack Pull', hold(3, 5), 'ISOMETRIC: bar under the pins at the 21 in start height, pull as hard as you can for 5 s. No plates needed. Rest 2 min.', iso=True),
        ex('Hip Thrust', reps(3, 5, 1), equipment='smith'),
    ])
    return [push, pull, legs, upper, lower]


# ---------------- B week (volume and skill) ----------------
def b_week(wk):
    light = wk == 8
    t = {2: 2, 4: 2, 6: 1, 8: 3}[wk]
    n = 2 if light else 3

    push = ('Push', [
        ex('Strict Press', [{'w': None, 'r': None, 'type': 'amrap', 't': 1}] * (1 if light else 2),
           '60-second AMRAP at about 70% of your A-week top set. Reps against the clock.'),
        ex('Incline Bench', reps(n, 10, t), equipment='smith'),
        ex('Overhead Tricep Extension', reps(n, 10, 1), 'superset with DB Lat Raise'),
        ex('DB Lat Raise', reps(n, 15, 1), 'superset with Overhead Tricep Extension'),
    ])
    pull = ('Pull', [
        ex('Deadlift', hold(2), 'GRIP, done first while fresh: double-overhand hold at bodyweight on the bar, max time. No straps, no hook.', iso=True),
        ex('Lat Pulldown', reps(n, 10, t), 'straps if grip is gone'),
        ex('Seated Cable Row', reps(n, 10, t), 'straps if grip is gone'),
        ex('Smith Shrug', reps(n, 12, t), 'traps volume day'),
        ex('Face Pull', reps(n, 15, 1), 'two D-handles', attachment='dual_handle'),
    ])
    legs = ('Legs', [
        ex('Sled Leg Press', top_then_backoff(6, t, n - 1, 8, t + 1), 'main lift'),
        ex('Leg Extension', reps(n, 10, 1), 'superset with Leg Curl'),
        ex('Leg Curl', reps(n, 10, 1), 'superset with Leg Extension'),
        ex('Smith Calf Raise', reps(n, 10, 1)),
        ex('Hip Adduction', reps(2, 12, 1), 'superset with Hip Abduction'),
        ex('Hip Abduction', reps(2, 12, 1), 'superset with Hip Adduction'),
    ])
    upper = ('Upper', [
        ex('Landmine Press', reps(n, 6, t), 'per arm, heavier than A week'),
        ex('Chest Supported Row', reps(n, 8, t)),
        ex('Sandbag Carry', carry(n, 20, 1), 'bear hug, 20 m'),
        ex('Hammer Curl', reps(2, 10, 1)),
    ])
    lower = ('Lower', [
        ex('Hex Deadlift', reps(4 if light else 6, 2, 4), 'SPEED: from the floor at about 60%, every rep as fast as you can. Power work.'),
        ex('Romanian Deadlift', reps(n, 8, t)),
        ex('Hip Thrust', reps(n, 8, t), equipment='smith'),
        ex('Farmers Carry', carry(2, 40, 2), 'medley finisher, 40 m'),
    ])
    return [push, pull, legs, upper, lower]


def block(wk):
    if wk == 1: return 'A - HEAVY · BASELINE'
    if wk == 7: return 'A - HEAVY · TEST'
    if wk == 8: return 'B - LIGHT'
    return 'A - HEAVY' if wk % 2 else 'B - VOLUME'


workouts = []
for wk in range(1, WEEKS + 1):
    days = a_week(wk) if wk % 2 else b_week(wk)
    for d, (label, exs) in enumerate(days, 1):
        date = START + datetime.timedelta(days=(wk - 1) * 7 + (d - 1))
        workouts.append({'date': date.isoformat(), 'name': f'Wk {wk} · {label}', 'block': block(wk), 'exercises': exs})

program = {
    'id': 'wdc-records-ab-1',
    'name': 'WDC Records · A/B PPLUL',
    'subtitle': '8 weeks from 19 Oct · bulk · 16 in trap 500 kg / 21 in Viking 400 kg · 90 kg class · RIR-driven',
    'loads': 'rir',
    'meets': [],
    'workouts': workouts,
}
with open(os.path.join(ROOT, 'program.json'), 'w') as f:
    json.dump(program, f, ensure_ascii=False, separators=(',', ':'))

manifest = {'id': program['id'], 'name': program['name'], 'subtitle': program['subtitle'],
            'sessions': len(workouts), 'meets': 0, 'weeks': WEEKS}
print(json.dumps(manifest, ensure_ascii=False))
