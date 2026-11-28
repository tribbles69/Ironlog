#!/usr/bin/env python3
"""Build program.json for the One Heavy Lift A/B PPLUL block.

Written 20 Nov 2026 with Aaron in chat. It replaces the WDC Records block
(build-program-wdc.py), which he found exhausting: two heavy pulls a week,
rack pulls capped by the gym's plates, and too little accessory work.

What it keeps and what it learns from (his own words: "disability friendly,
not taking on way too much, plenty of technique"):
  - The A/B PPLUL shell, Mon-Fri Push/Pull/Legs/Upper/Lower.
  - ONE heavy lift a session: one top set and two back-offs, then accessories
    (June 2026's cable/machine-heavy accessory lists).
  - Heavy lifts land every other day: A week Mon bench / Wed squat /
    Fri high-handle trap bar; B week Tue row / Thu OHP / Fri hip thrust.
  - B-week technique sets (3x3 at ~65%) of bench, squat and trap bar, so the
    main lifts are practised every week without the fatigue.
  - Both rack pulls are gone (capped by plates); the high-handle trap bar
    pull replaces them. No RDL or back extension: the spinal erectors were
    the most overloaded group last block.
  - No flies (Aaron hates them). Cable crunch added to B Wednesday for abs.
  - The first fortnight carries guide weights from his recent bests; after
    that the plan is RIR-only and Ironlog loads it from his log.
  - Ends with a test in the gap after Christmas, as he planned in September.

Run from the repo root:  python3 "r&d/tools/build-program-hybrid.py"
It writes program.json and the manifest in program-manifest.json; earlier
programs stay listed under "names" so their sessions can still be removed.
"""
import json, os, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CAT = json.load(open(os.path.join(ROOT, 'r&d', 'data', 'exercises.json')))
BY_NAME = {}
for m in CAT['movements']:
    BY_NAME[m['name'].lower()] = m
    for a in m.get('aliases', []):
        BY_NAME.setdefault(a['name'].lower(), m)

START = datetime.date(2026, 11, 23)   # a Monday; the block opens on a B week
ORDER = ['B', 'A', 'B', 'A', 'B']     # 23 Nov - 25 Dec, then the test week
GUIDE_WEEKS = {1, 2}                  # the first B and first A carry weights


def ex(name, sets, notes='', equipment=None, attachment=None, iso=False, execution=None):
    m = BY_NAME.get(name.lower())
    if equipment and m and equipment not in m['equipment']:
        raise SystemExit(f'{name}: {equipment} not allowed ({m["equipment"]})')
    if attachment and m and attachment not in (m.get('attachments') or []):
        raise SystemExit(f'{name}: {attachment} not allowed ({m.get("attachments")})')
    if execution and m and execution not in m.get('execution', []):
        raise SystemExit(f'{name}: {execution} not allowed ({m.get("execution")})')
    if (equipment or attachment or execution) and not m:
        raise SystemExit(f'{name}: custom movement cannot pin equipment')
    e = {'name': name, 'notes': notes, 'sets': sets}
    if equipment: e['equipment'] = equipment
    if attachment: e['attachment'] = attachment
    if execution: e['execution'] = execution
    if iso: e['iso'] = True
    return e


class Week:
    """Builds sets for one week; weights only on guide weeks."""
    def __init__(self, n):
        self.guide = n in GUIDE_WEEKS

    def w(self, kg):
        return kg if self.guide else None

    def reps(self, n, r, t, kg=None, kind='working'):
        return [{'w': self.w(kg), 'r': r, 'type': kind, 't': t} for _ in range(n)]

    def heavy(self, r_top, top_kg, r_back, back_kg):
        # one top set and two back-offs: the only heavy work of the day
        return self.reps(1, r_top, 1, top_kg, 'top') + self.reps(2, r_back, 2, back_kg, 'backoff')

    def technique(self, kg):
        # 3x3 at about 65%: practice, not training stress. RIR 9 is the
        # lightest target Ironlog's load maths reads (reps + RIR caps at 12,
        # about 70% of e1), so later weeks land near the intended weight.
        return self.reps(3, 3, 9, kg)


def hold(n, sec=None):
    return [{'w': None, 'sec': sec, 'hold': 'test' if sec is None else 'planned'} for _ in range(n)]


def carry(n, metres, t, kg=None):
    return [{'w': kg, 'm': metres, 't': t} for _ in range(n)]


TECH = 'TECHNIQUE: about 65% of the A-week top set. Clean, fast reps; practice, not a workout.'
HEAVY = 'HEAVY LIFT of the day: one top set, then two back-offs about 10% lighter. Beat the RIR → add weight next time.'


def a_week(n):
    k = Week(n)
    return [
        ('Push', [
            ex('Bench Press', k.heavy(5, 82.5, 5, 75), HEAVY, equipment='smith'),
            ex('Incline Bench', k.reps(3, 8, 2, 22.5), 'dumbbells, 8-10 reps', equipment='dumbbells'),
            ex('Rope Pushdown', k.reps(3, 10, 1, 30)),
            ex('Cable Lat Raise', k.reps(3, 15, 1, 7.5), equipment='cable'),
            ex('Cable Crunch', k.reps(3, 12, 1), equipment='cable', attachment='rope'),
        ]),
        ('Pull', [
            ex('Lat Pulldown', k.reps(3, 10, 2, 55)),
            ex('Seated Cable Row', k.reps(3, 10, 2, 80)),
            ex('Smith Shrug', k.reps(3, 12, 2, 125), equipment='smith'),
            ex('Face Pull', k.reps(3, 15, 1, 50), 'two D-handles, seated on the floor', attachment='dual_handle'),
            ex('Hammer Curl', k.reps(3, 10, 1, 20)),
        ]),
        ('Legs', [
            ex('Back Squat', k.heavy(5, 130, 5, 117.5), HEAVY + ' Smith, full depth.', equipment='smith'),
            ex('Split Squat', k.reps(3, 8, 2, 12.5), 'dumbbells, per leg, left first', equipment='dumbbells', execution='unilateral'),
            ex('Leg Extension', k.reps(3, 12, 1, 62.5), 'superset with Leg Curl'),
            ex('Leg Curl', k.reps(3, 12, 1, 62.5), 'superset with Leg Extension'),
            ex('Smith Calf Raise', k.reps(3, 8, 1), 'single leg, left first; right matches the left’s reps. Superset with Tibialis Raise', execution='unilateral'),
            ex('Tibialis Raise', k.reps(3, 12, 1, 10), 'superset with Smith Calf Raise'),
        ]),
        ('Upper', [
            ex('Landmine Press', k.reps(3, 8, 2, 22.5), 'per arm, standing square-on'),
            ex('Chest Supported Row', k.reps(3, 10, 2, 45), 'Smith, on the bench'),
            ex('Face Pull', k.reps(3, 12, 1, 50), 'two D-handles, superset with Cable Lat Raise', attachment='dual_handle'),
            ex('Cable Lat Raise', k.reps(3, 12, 1, 7.5), 'superset with Face Pull', equipment='cable'),
            ex('Overhead Tricep Extension', k.reps(3, 10, 1, 20), 'superset with Hammer Curl'),
            ex('Hammer Curl', k.reps(3, 10, 1, 20), 'superset with Overhead Tricep Extension'),
            ex('Side Plank', hold(3, 30), 'per side', iso=True),
        ]),
        ('Lower', [
            ex('Deadlift', k.heavy(3, 185, 3, 167.5),
               HEAVY + ' High handles. Build up to the top set; straps on.' +
               (' First high-handle pull since September: treat the top set as a test.' if k.guide else ''),
               equipment='trap_bar', attachment='high_handles'),
            ex('Leg Curl', k.reps(3, 10, 1, 62.5)),
            ex('Hip Adduction', k.reps(2, 12, 1, 80), 'superset with Hip Abduction'),
            ex('Hip Abduction', k.reps(2, 12, 1, 80), 'superset with Hip Adduction'),
            ex('Farmers Carry', carry(3, 20, 1, 25 if k.guide else None), 'per hand, 20 m'),
        ]),
    ]


def b_week(n, christmas=False):
    k = Week(n)
    days = [
        ('Push', [
            ex('Bench Press', k.technique(62.5), TECH, equipment='smith'),
            ex('Machine Chest Press', k.reps(3, 10, 2, 72.5), equipment='machine'),
            ex('Rope Pushdown', k.reps(3, 10, 1, 30)),
            ex('DB Lat Raise', k.reps(3, 15, 1, 10)),
        ]),
        ('Pull', [
            ex('Deadlift', hold(2), 'GRIP, done first while fresh: double-overhand hold at bodyweight on the bar, max time. No straps, no hook.', iso=True),
            ex('Chest Supported Row', k.heavy(6, 87.5, 6, 80), HEAVY + ' Barbell, on the bench.'),
            ex('Lat Pulldown', k.reps(3, 10, 2, 55)),
            ex('Face Pull', k.reps(3, 15, 1, 50), 'two D-handles', attachment='dual_handle'),
            ex('Barbell Curl', k.reps(3, 10, 1, 25), equipment='barbell'),
        ]),
        ('Legs', [
            ex('Back Squat', k.technique(100), TECH + ' Smith, full depth.', equipment='smith'),
            ex('Sled Leg Press', k.reps(3, 10, 2, 215)),
            ex('Leg Extension', k.reps(3, 12, 1, 62.5), 'superset with Leg Curl'),
            ex('Leg Curl', k.reps(3, 12, 1, 62.5), 'superset with Leg Extension'),
            ex('Smith Calf Raise', k.reps(3, 10, 1, 125)),
            ex('Hip Adduction', k.reps(2, 12, 1, 80), 'superset with Hip Abduction'),
            ex('Hip Abduction', k.reps(2, 12, 1, 80), 'superset with Hip Adduction'),
            ex('Cable Crunch', k.reps(3, 12, 1), equipment='cable', attachment='rope'),
        ]),
        ('Upper', [
            ex('Strict Press', k.heavy(5, 52.5, 5, 47.5), HEAVY + ' From pins at collarbone, dead stop each rep.'),
            ex('Landmine Press', k.reps(3, 8, 2, 22.5), 'per arm, standing square-on'),
            ex('Seated Cable Row', k.reps(3, 10, 2, 80)),
            ex('Face Pull', k.reps(3, 12, 1, 50), 'two D-handles, superset with Cable Lat Raise', attachment='dual_handle'),
            ex('Cable Lat Raise', k.reps(3, 12, 1, 7.5), 'superset with Face Pull', equipment='cable'),
            ex('Hammer Curl', k.reps(3, 10, 1, 20)),
        ]),
        ('Lower', [
            ex('Deadlift', k.technique(135), TECH + ' High handles, done first.', equipment='trap_bar', attachment='high_handles'),
            ex('Hip Thrust', k.heavy(5, 225, 8, 195),
               HEAVY + ' The Smith fills at 235 kg: once there, add reps instead.', equipment='smith'),
            ex('Leg Curl', k.reps(3, 10, 1, 62.5)),
            ex('Hip Abduction', k.reps(3, 12, 1, 80)),
            ex('Sandbag Carry', carry(3, 20, 1), 'bear hug, 20 m'),
        ]),
    ]
    # Christmas week: Thu 24 and Fri 25 Dec won't happen. Keep Mon-Wed and
    # move the OHP heavy day onto Wednesday's accessory-only slot.
    if christmas:
        push, pull, legs, upper, _ = days
        days = [push, pull, ('Upper', upper[1])]
    return days


def test_week():
    return [
        # Mon 28 Dec
        ('Test · Squat + Bench', [
            ex('Back Squat', [{'w': None, 'r': 1, 'type': 'top', 't': 0}],
               'TEST: Smith, full depth. Build up in singles to a top single. Target 150+.', equipment='smith'),
            ex('Bench Press', [{'w': None, 'r': 1, 'type': 'top', 't': 0}],
               'TEST: Smith. Build up in singles. Target 100.', equipment='smith'),
        ]),
        # Wed 30 Dec
        ('Test · Trap Bar + Hip Thrust', [
            ex('Deadlift', [{'w': None, 'r': 1, 'type': 'top', 't': 0}],
               'TEST: high handles, straps on. Build up in singles. Target: beat 205.', equipment='trap_bar', attachment='high_handles'),
            ex('Hip Thrust', [{'w': 235, 'r': None, 'type': 'amrap', 't': 1}],
               'TEST: reps at the full Smith (235). Stop one shy.', equipment='smith'),
        ]),
    ]


# 000-F1 (Aaron, 2026-11-27): a Cossack-squat and ankle warm-up before every legs
# day, and hard cardio as its own morning session on Mondays and Thursdays.
# Program format: r&d/specs/planned-cardio-mobility-spec.md §4.
SQUAT_WARMUP = {'mobility': {'name': 'Squat warm-up', 'items': [
    {'id': 'cossack-mob', 'dose': {'sets': 2, 'reps': 6, 'perSide': True}},
    {'id': 'knee-to-wall'}, {'id': 'weighted-ankle-mob'}]}, 'at': 'start'}
MORNING_CARDIO = {   # weekday -> (label, plan)
    0: ('Bike intervals (morning)', {'machine': 'bike', 'iv': {'preset': '1-1', 'name': '1 min on / 1 off',
        'warm': 300, 'work': 60, 'rest': 60, 'rounds': 8, 'cool': 180}}),
    3: ('Row intervals (morning)', {'machine': 'rower', 'iv': {'preset': '30-30', 'name': '30 / 30',
        'warm': 300, 'work': 30, 'rest': 30, 'rounds': 10, 'cool': 180}}),
}
CARDIO_FROM = datetime.date(2026, 11, 30)
# Aaron, 2026-11-28: mobility every day — his Full Body Stretch, in the morning.
DAILY_MOBILITY_FROM = datetime.date(2026, 11, 28)

workouts = []
for i, kind in enumerate(ORDER):
    n = i + 1
    christmas = (n == 5)
    days = a_week(n) if kind == 'A' else b_week(n, christmas)
    for d, (label, exs) in enumerate(days):
        date = START + datetime.timedelta(days=i * 7 + d)
        block = ('A - HEAVY' if kind == 'A' else 'B - VOLUME + TECHNIQUE') + (' · CHRISTMAS' if christmas else '')
        if label == 'Legs':
            exs = [SQUAT_WARMUP] + exs
        workouts.append({'date': date.isoformat(), 'name': f'Wk {n} · {label}', 'block': block, 'exercises': exs})
        if date >= CARDIO_FROM and date.weekday() in MORNING_CARDIO:
            clabel, plan = MORNING_CARDIO[date.weekday()]
            workouts.append({'date': date.isoformat(), 'name': f'Wk {n} · {clabel}', 'block': block,
                             'kind': 'cardio', 'slot': 'am', 'plan': plan})

test_start = START + datetime.timedelta(days=len(ORDER) * 7)
for d, (label, exs) in zip((0, 2), test_week()):
    date = test_start + datetime.timedelta(days=d)
    workouts.append({'date': date.isoformat(), 'name': f'Wk 6 · {label}', 'block': 'TEST', 'exercises': exs})

# Daily stretch on every day of the block, training day or not, after that
# day's other sessions in the list so their ids don't shift.
last = max(datetime.date.fromisoformat(w['date']) for w in workouts)
day = max(START, DAILY_MOBILITY_FROM)
while day <= last:
    wk = (day - START).days // 7 + 1
    workouts.append({'date': day.isoformat(), 'name': f'Wk {wk} · Full Body Stretch', 'block': 'DAILY MOBILITY',
                     'kind': 'mobility', 'slot': 'am', 'plan': {'routine': 'morning-stretch'}})
    day += datetime.timedelta(days=1)
workouts.sort(key=lambda w: w['date'])   # stable: same-day order kept

program = {
    'id': 'one-heavy-ab-1',
    'name': 'One Heavy Lift · A/B PPLUL',
    'subtitle': '23 Nov – 30 Dec · one heavy lift a day, every other day · B-week technique · Mon/Thu morning intervals · daily stretch · test after Christmas',
    'loads': 'rir',
    'meets': [],
    'workouts': workouts,
}
with open(os.path.join(ROOT, 'program.json'), 'w') as f:
    json.dump(program, f, ensure_ascii=False, separators=(',', ':'))

manifest = {'id': program['id'], 'name': program['name'], 'subtitle': program['subtitle'],
            'sessions': len(workouts), 'meets': 0, 'weeks': len(ORDER) + 1}
mpath = os.path.join(ROOT, 'program-manifest.json')
try:
    with open(mpath, encoding='utf-8') as f:
        old = json.load(f)
    names = old.get('names', {})
    prev = old.get('manifest') or {}
    if prev.get('id') and prev['id'] != program['id']:
        names.setdefault(prev['id'], prev.get('name', prev['id']))
except (OSError, ValueError):
    names = {}
with open(mpath, 'w', encoding='utf-8') as f:
    json.dump({'manifest': manifest, 'names': names}, f, ensure_ascii=False, indent=1)
    f.write('\n')
print(json.dumps(manifest, ensure_ascii=False))
