#!/usr/bin/env python3
"""Build program.json from the Hunchback Hercules PPLUL text.

Source: r&d/data/hunchback-pplul-77wk.txt — `pdftotext -layout` of
Hunchback_Hercules_PPLUL_77wk.pdf, form feeds stripped. Kept in the repo so the
build doesn't need poppler.

Weights are deliberately dropped (Aaron, 6 Oct 2026): the program says what to
do and how hard, RIR picks the load. Every set carries `w: null` and a target
RIR `t`; the app's autoregulation fills the load from history when a session
starts, and the weight field shows last time's number until then.

Run from the repo root:  python3 "r&d/tools/build-program.py"
It writes program.json and prints the PROGRAM_MANIFEST line for index.html.
"""
import json, re, sys, datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'r&d' / 'data' / 'hunchback-pplul-77wk.txt'
CAT = ROOT / 'r&d' / 'data' / 'exercises.json'
WEEK1 = dt.date(2026, 7, 13)
DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
KINDS = {'PUSH': 'Push', 'PULL': 'Pull', 'LEGS': 'Legs', 'UPPER': 'Upper', 'LOWER': 'Lower'}

# ---------------------------------------------------------------- names
# PDF wording (lower case, after notes are stripped) -> catalogue name/alias.
NAMES = {
    'bench press': 'Bench Press', 'bench': 'Bench Press',
    'incline bench': 'Incline Bench', 'close-grip bench': 'Close Grip Bench',
    'bench pin press': 'Bench Pin Press', 'flat db press': 'Flat DB Press',
    'machine chest press': 'Machine Chest Press', 'chest press': 'Machine Chest Press',
    'rope pushdown': 'Rope Pushdown', 'tricep bar pushdown': 'Tricep Bar Pushdown',
    'bar pushdown': 'Tricep Bar Pushdown', 'pushdown': 'Tricep Bar Pushdown',
    'oh tricep ext': 'Overhead Tricep Extension',
    'db lat raise': 'DB Lat Raise', 'cable lat raise': 'Cable Lat Raise', 'lat raise': 'Cable Lat Raise',
    'front raise': 'Front Raise', 'face pull': 'Face Pull',
    'seated cable row': 'Seated Cable Row', 'cable row': 'Seated Cable Row', 'row': 'Seated Cable Row',
    'lat pulldown': 'Lat Pulldown', 'pulldown': 'Lat Pulldown',
    'barbell shrug': 'Barbell Shrug', 'smith shrug': 'Smith Shrug', 'shrug': 'Barbell Shrug',
    'barbell curl': 'Barbell Curl', 'reverse curl': 'Reverse Curl',
    'db hammer curl': 'DB Hammer Curl', 'hammer curl': 'DB Hammer Curl', 'cable hammer curl': 'Cable Hammer Curl',
    'back squat': 'Back Squat', 'squat': 'Back Squat',
    'sled leg press': 'Sled Leg Press', 'leg press': 'Sled Leg Press',
    'leg extension': 'Leg Extension', 'leg curl': 'Leg Curl',
    'smith calf raise': 'Smith Calf Raise', 'calf raise': 'Smith Calf Raise', 'calf': 'Smith Calf Raise',
    'hip abduction': 'Hip Abduction', 'hip adduction': 'Hip Adduction',
    'cable crunch': 'Cable Crunch', 'captain\'s chair knee raise': 'Knee Raise',
    'db side bend': 'DB Side Bend', 'side bend': 'DB Side Bend',
    'cable woodchopper': 'Cable Woodchopper', 'woodchopper': 'Cable Woodchopper',
    'strict press': 'Strict Press', 'press': 'Strict Press', 'smith shoulder press': 'Smith Shoulder Press',
    'deadlift': 'Deadlift', 'hex deadlift': 'Hex Deadlift', 'rdl': 'Romanian Deadlift',
    'barbell hip thrust': 'Barbell Hip Thrust', 'back extension': 'Back Extension',
    'cable kickback': 'Cable Kickback',
}
NAME_NOTES = {'captain\'s chair knee raise': 'captain\'s chair'}

# ---------------------------------------------------------------- RIR
# Whole-number targets from the doc's RPE anchors: volume RPE 8 = RIR 2,
# strength RPE 9 = RIR 1. Back-offs and accessories sit at RIR 2 (the doc's
# progression rule is "every set with 1+ RIR"). AMRAPs stop 1 shy = RIR 1.
# Light weeks ("half the sets, ~60%") are RIR 3-4.
def top_rir(wk):
    if wk in (9, 11) or 25 <= wk <= 31 or wk in (33, 54, 56) or 64 <= wk <= 68 or wk == 70:
        return 1
    return 2
EASY4 = {12, 13, 15, 24, 36, 38, 39, 40, 41, 73, 76, 77}     # deload / taper / meet week / recovery
EASY3 = {8, 16, 32, 34, 47, 53, 57, 69, 71}                  # light ramp, speed, machine deloads

# ---------------------------------------------------------------- layout
LABEL = re.compile(r'^(MON|TUE|WED|THU|FRI|SAT|SUN|ALL|ANY|OPTION|OTHER|WEEKE)')
def chunks(line):
    """(column, text) runs separated by 3+ spaces."""
    return [(m.start(), m.group(0).strip()) for m in re.finditer(r'\S.*?(?=\s{3,}|$)', line)]

def parse_weeks(text):
    weeks, cur = [], None
    for raw in text.splitlines():
        if raw.startswith('Hunchback Hercules'):
            continue
        m = re.match(r'^ WEEK (\d+) · (.*?) · (.*)$', raw)
        if m:
            cur = {'n': int(m.group(1)), 'block': m.group(3).strip(), 'days': []}
            weeks.append(cur); day = None
            continue
        if cur is None or not raw.strip():
            continue
        lab = raw[1:12].strip() if len(raw) > 1 and raw[1] != ' ' else ''
        body = raw[12:] if len(raw) > 12 else ''
        if lab and not (LABEL.match(lab) or lab in KINDS or re.fullmatch(r'[A-Z/*\-]{1,6}', lab)):
            day = None            # a footnote under the table
            continue
        if lab and LABEL.match(lab):
            day = {'label': lab, 'kind': '', 'left': [], 'right': []}
            cur['days'].append(day)
        elif lab and day is not None:
            if lab in KINDS: day['kind'] = KINDS[lab]
            else: day['label'] += lab            # TUE/TH + U, SAT 10 + OCT ...
        if day is None:
            continue
        for col, t in chunks(' ' * 12 + body):
            (day['left'] if col < 66 else day['right']).append(t)
    return weeks

def join_left(lines):
    return ' '.join(lines).strip()

def split_right(lines):
    """Lines into items: a line starts a new item unless it reads as the tail
    of the one before ("pause at stretch", "62.5", "(AMRAP)", "AMRAP @ 200")."""
    items = []
    for t in lines:
        cont = items and (not re.match(r'[A-Z]', t) or t.startswith('AMRAP')
                          or re.search(r'(@|x|\+|,|then|·)$', items[-1]))
        if cont: items[-1] += ' ' + t
        else: items.append(t)
    return items

# ---------------------------------------------------------------- items
SCHEME = re.compile(
    r'(\d+)\s*x\s*(AMRAP|\d+)(/side|/leg)?'
    r'(?:\s*\+\s*(\d+) pause reps)?'
    r'(?:\s*@\s*(?:(?P<kg>[\d.]+)|RPE \d))?(?:\s*kg)?'
    r'(?:\s*\((?P<ann>[^)]*)\))?(?:\s*kg)?(?:\s*BW)?')
DROP_NOTE = re.compile(r'^(=?\s*PR\b.*|PR .*|cap|bar cap|bar cap - reps era|cap - AMRAP era)$', re.I)

def clean_note(n):
    n = n.strip().strip(',').strip()
    n = re.sub(r'\bbar cap = your opener - ', '', n)
    n = re.sub(r'\s*-\s*AMRAP\b', '', n) if re.search(r'PR', n) else n
    return '' if not n or DROP_NOTE.match(n) else n

class Ex:
    def __init__(self, pdf_name, notes=()):
        key = re.sub(r'\s+', ' ', pdf_name.strip().lower())
        if key not in NAMES:
            raise SystemExit(f'unmapped exercise name: {pdf_name!r}')
        self.name = NAMES[key]
        self.notes = [NAME_NOTES[key]] if key in NAME_NOTES else []
        self.notes += [n for n in notes if n]
        self.sets = []
    def add(self, n, reps, t, kind='working', like=False):
        for _ in range(n):
            self.sets.append({'kind': kind, 'r': reps, 't': t, 'like': like})
    def json(self):
        notes = []
        for n in self.notes:
            if n and n not in notes: notes.append(n)
        return {'name': self.name, 'notes': ' · '.join(notes),
                'sets': [dict({'w': None, 'r': None if s['kind'] == 'amrap' else s['r'], 'type': s['kind'], 't': s['t']},
                              **({'like': 'prev'} if s.get('like') else {}))
                         for s in self.sets]}

def parse_item(text, wk, main):
    """One exercise phrase -> list of Ex (two for 'Hip abduction + adduction')."""
    text = text.strip().rstrip('.').strip()
    easy = 4 if wk in EASY4 else 3 if wk in EASY3 else None
    trail = ''
    m = re.search(r'\s+-\s+(?!AMRAP)([a-z0-9][^@()]*)$', text)        # "- 2 s pause at stretch", "- RPE 5-6"
    if m and SCHEME.search(text[:m.start()]):
        trail, text = m.group(1), text[:m.start()]
    # a single written without sets x reps
    text = re.sub(r'\bopener single @ ([\d.]+)( \(([^)]*)\))?', lambda g: f'1 x 1 @ {g.group(1)} (opener{", " + g.group(3) if g.group(3) else ""})', text)
    text = re.sub(r'\bsingle \(guide [^)]*\)', '1 x 1', text)
    first = SCHEME.search(text)
    if not first:
        raise SystemExit(f'week {wk}: no sets in {text!r}')
    head = text[:first.start()]
    notes = re.findall(r'\(([^)]*)\)', head)
    head = re.sub(r'\([^)]*\)', '', head)
    head = re.sub(r'\b(top set|singles?)\b|:', '', head, flags=re.I).strip(' ,')
    if trail: notes.append(trail)

    # "Hip abduction + adduction 2x15"
    pair = re.match(r'(.*)\s\+\s([a-z].*)$', head)
    names = [pair.group(1), pair.group(1).split()[0] + ' ' + pair.group(2)] if pair else [head]

    schemes = list(SCHEME.finditer(text))
    out = []
    for nm in names:
        ex = Ex(nm, [clean_note(n) for n in notes])
        for i, s in enumerate(schemes):
            n, reps, side, pause, ann = int(s.group(1)), s.group(2), s.group(3), s.group(4), s.group('ann') or ''
            between = text[schemes[i - 1].end():s.start()] if i else ''
            ann_l = ann.lower()
            if side: ex.notes.append('per side' if side == '/side' else 'per leg')
            if pause: ex.notes.append(f'+ {pause} paused reps')
            if 'speed' in between: ex.notes.append('back-offs: speed')
            extra = re.sub(r'\b(then|speed)\b|[,+]', ' ', between).strip()
            if extra: ex.notes.append(extra)
            if re.search(r'\bBW\b', s.group(0)): ex.notes.append('bodyweight')
            amrap_all = reps == 'AMRAP' or (ann_l in ('amrap', 'cap - amrap', 'cap - amrap era')) or ann_l.startswith('= pr - amrap')
            last_amrap = 'last amrap' in ann_l or 'amrap last' in ann_l
            for part in [p.strip() for p in ann.split(',')]:
                if part and not re.search(r'amrap|stop 1 shy', part, re.I):
                    ex.notes.append(clean_note(part))
            if ann_l in ('cap - amrap', 'cap - amrap era') or (ann_l == 'amrap' and reps != 'AMRAP'):
                ex.notes.append('at the stack cap: every set AMRAP, stop 1 shy')
                amrap_all = False                 # keep the rep target; the note says when to AMRAP
            r = None if reps == 'AMRAP' else int(reps)
            # targets
            if easy is not None and not ('opener' in ann_l or 'opener' in ' '.join(notes)):
                t_top = t_back = easy
            elif wk in (35, 37, 72) and n == 1 and r == 1 and i == 0:
                t_top = t_back = 2                # openers: "should feel like triples"
            else:
                t_top, t_back = top_rir(wk), 2
            # Back-offs: the doc prints them ~10 % under the top set. With no weights
            # in the plan, that gap becomes RIR — the RIR at which the back-off's reps
            # land on the doc's back-off load, given the top set at its own RIR. The
            # doc's kilos shape the targets here and are then thrown away.
            if main and i > 0 and r and schemes[0].group('kg') and s.group('kg'):
                r0 = schemes[0].group(2)
                if r0.isdigit():
                    t0 = t_top if (len(schemes) > 1) else t_back
                    eff = 30 * ((1 + min(int(r0) + t0, 12) / 30) * float(schemes[0].group('kg')) / float(s.group('kg')) - 1)
                    t_back = max(1, min(4, round(eff - r)))   # RIR guesses past ~4 are unreliable
            if not main:
                t_top = t_back = (easy if easy is not None else 2)
            heavy = main and i == 0 and len(schemes) > 1      # a top set / single with back-offs after it
            if reps == 'AMRAP' or (amrap_all and r is None):
                ex.add(n, None, 1 if easy is None else max(1, easy - 1), 'amrap')
            elif heavy:
                ex.add(n, r, t_top, 'top')
            else:
                kind = 'backoff' if main and i > 0 else 'working'
                t = t_back if (main and i > 0) else (t_top if main else t_back)
                if last_amrap:
                    ex.add(n - 1, r, t, kind); ex.add(1, None, 1 if easy is None else max(1, easy - 1), 'amrap', like=True)
                else:
                    ex.add(n, r, t, kind)
        tail = re.sub(r'\((=?\s*PR[^)]*|stop 1 shy|cap)\)|\bkg\b', '', text[schemes[-1].end():]).strip(' ,.-')
        if tail: ex.notes.append(tail)
        out.append(ex)
    return out

def items_of(day, wk):
    """The day's exercises in order: main column, then support column."""
    exs = []
    left = join_left(day['left'])
    left = re.sub(r'^(Light full body|Pump|Optional machine circuit|\d-\d easy full-body sessions):\s*', '', left)
    tests = re.match(r'^TEST: (.*)$', left)
    if tests:
        body = tests.group(1)
        mm = re.match(r'(\w[\w ]*?) - heavy single @ RPE 9 \(guide ([^)]*)\)$', body)
        parts = [f'{mm.group(1)} 1 x 1'] if mm else [p.strip() for p in body.split(', then ')]
        for p in parts:
            for ex in parse_item(re.sub(r'single \(guide [^)]*\)', '1 x 1', p), wk, True):
                ex.notes.append('test single @ RPE 9: one clean rep, one in the tank')
                for s in ex.sets: s['t'] = 1; s['kind'] = 'top'
                exs.append(ex)
    else:
        for p in [p for p in re.split(r'\s+·\s+', left) if p.strip()]:
            p = re.sub(r'^arms 2x12$', 'Barbell curl 2x12 · Bar pushdown 2x12', p)
            for q in p.split(' · '):
                exs += parse_item(q, wk, True)
    support = []
    for it in split_right(day['right']):
        if it in ('-',) or re.match(r'^(OFF|Nothing else|Optional: |Congratulations|Last truly heavy|Walk, eat|Openers alone|\*Placeholder|Christmas at|Two meets|1 set each)', it):
            continue
        sup = re.match(r'^SS:\s*(.*)$', it)
        group = re.split(r'\s+\+\s+(?=[A-Z])', sup.group(1)) if sup else re.split(r'\s+·\s+', it)
        made = []
        for g in group:
            made += parse_item(g, wk, False)
        if sup and len(made) > 1:
            for ex in made:
                others = [o.name for o in made if o is not ex]
                ex.notes.insert(0, 'superset with ' + ' + '.join(others))
        support += made
    return exs + support

# ---------------------------------------------------------------- sessions
def label_days(label):
    lab = label.replace(' ', '')
    if re.fullmatch(r'(MON|TUE|WED|THU|FRI)', lab): return [lab]
    if re.fullmatch(r'(MON|TUE|WED|THU|FRI)(/(MON|TUE|WED|THU|FRI))+', lab): return lab.split('/')
    return []

def main():
    weeks = parse_weeks(SRC.read_text())
    assert [w['n'] for w in weeks] == list(range(1, 78)), 'week headers out of order'
    workouts = []
    def add(wk, day, name_kind, block, exs):
        date = WEEK1 + dt.timedelta(days=(wk - 1) * 7 + DAYS.index(day))
        workouts.append({'date': date.isoformat(), 'name': f'Wk {wk} · {name_kind}', 'block': block,
                         'exercises': [e.json() for e in exs]})
    last = {}
    for w in weeks:
        wk = w['n']
        for d in w['days']:
            days = label_days(d['label'])
            left = join_left(d['left'])
            if d['label'].startswith('OPTION'): days = ['MON', 'THU']
            if not days or re.match(r'^(OFF|Bar feel|Walk|Write)', left):
                continue
            if left.startswith('Circuit as last week'):       # wk 41: last week's circuit +1 set each
                src = last.get(wk - 1)
                for day in days:
                    exs = []
                    for e in src:
                        c = Ex.__new__(Ex); c.name, c.notes = e.name, list(e.notes)
                        c.sets = [dict(s) for s in e.sets] + [dict(e.sets[-1])]
                        exs.append(c)
                    add(wk, day, 'Recovery circuit', w['block'], exs)
                continue
            if left.startswith('As last week'):                # wk 77: repeat wk 76
                for day in ('MON', 'THU'):
                    add(wk, day, 'Easy full body (optional)', w['block'], last[wk - 1])
                continue
            exs = items_of(d, wk)
            last[wk] = exs
            if d['label'].startswith('OPTION'):                # wk 76: "2-3 easy sessions"
                for day in ('MON', 'THU'):
                    add(wk, day, 'Easy full body (optional)', w['block'], exs)
                continue
            names = {(15, 'MON'): 'Re-entry', (16, 'WED'): 'Technique', (16, 'FRI'): 'Pump',
                     (38, 'MON'): 'Taper', (38, 'WED'): 'Taper', (39, 'MON'): 'Meet week', (73, 'MON'): 'Meet week'}
            if left.startswith('TEST'):
                names[(wk, days[0])] = 'Test · ' + ' + '.join(e.name for e in exs)
            kind = d['kind'] or names.get((wk, days[0])) or (('Recovery circuit' if wk in (40, 41) else
                                  'Test' if left.startswith('TEST') else
                                  {'MON': 'Mon', 'TUE': 'Tue', 'WED': 'Wed', 'THU': 'Thu', 'FRI': 'Fri'}[days[0]]))
            for day in days:
                add(wk, day, kind, w['block'], exs)
    workouts.sort(key=lambda x: x['date'])

    # every name must resolve in the catalogue, or the app makes a custom movement
    cat = json.loads(CAT.read_text())
    known = {m['name'].lower() for m in cat['movements']} | {a['name'].lower() for m in cat['movements'] for a in m.get('aliases', [])}
    bad = sorted({e['name'] for w in workouts for e in w['exercises'] if e['name'].lower() not in known})
    if bad: raise SystemExit(f'not in catalogue: {bad}')

    old = json.loads((ROOT / 'program.json').read_text())
    P = {
        'id': old['id'], 'name': old['name'],
        'subtitle': '77 weeks · 13 Jul 2026 – 2 Jan 2028 · 93 kg Raw Classic · RIR-driven',
        'priority': old['priority'], 'meets': old['meets'],
        'loads': 'rir',
        'workouts': workouts,
    }
    (ROOT / 'program.json').write_text(json.dumps(P, ensure_ascii=False, separators=(',', ':')))
    man = {'id': P['id'], 'name': P['name'], 'subtitle': P['subtitle'], 'sessions': len(workouts),
           'meets': len(P['meets']), 'from': workouts[0]['date'], 'to': workouts[-1]['date']}
    print('const PROGRAM_MANIFEST = ' + json.dumps(man, ensure_ascii=False) + ';')

if __name__ == '__main__':
    main()
