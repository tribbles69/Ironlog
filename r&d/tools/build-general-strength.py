"""Builds r&d/data/program-general-strength.json — the 18-week general-strength PPLUL.

Run from the repo root:  python3 "r&d/tools/build-general-strength.py"
Written in weeks/days (no dates), so installing it asks for a start date.
Not loaded by the app yet — see r&d/notes/general-strength-program.md.
"""
import json, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "r&d/data/program-general-strength.json"

def S(r, t, n=1, typ="working"):
    return [{"w": None, "r": r, "type": typ, "t": t} for _ in range(n)]

def E(name, sets, notes=""):
    return {"name": name, "notes": notes, "sets": sets}

def ss(a, b):
    short = lambda n: n.replace("Seated Cable Row", "cable row")   # "seated" in a note would tag the Seated modifier
    return f"superset with {short(b)}", f"superset with {short(a)}"

# ---------- A week (heavy) ----------
def push_a(heavy):
    r, t = heavy
    n1, n2 = ss("Rope Pushdown", "DB Lat Raise")
    return [
        E("Strict Press", S(r, t, 3), "main lift · rest 3 min · log RIR"),
        E("Flat DB Press", S(6, 2, 3), "or Machine Chest Press if wrists complain"),
        E("Rope Pushdown", S(12, 2, 2), n1),
        E("DB Lat Raise", S(12, 2, 2), n2),
    ]

def pull_a():
    n1, n2 = ss("Seated Cable Row", "Face Pull")
    return [
        E("Seated Cable Row", S(6, 2, 3), n1),
        E("Face Pull", S(15, 2, 2), n2),
        E("Smith Shrug", S(6, 2, 3), "tracked secondary"),
        E("Lat Pulldown", S(10, 2, 2), "long range: full stretch at the top"),
    ]

def legs_a(heavy):
    r, t = heavy
    n1, n2 = ss("Leg Extension", "Leg Curl")
    return [
        E("Smith Squat", S(r, t, 3), "main lift · to your filmed depth standard · squat shoes · rest 3–4 min · log RIR"),
        E("Leg Extension", S(12, 2, 2), n1),
        E("Leg Curl", S(12, 2, 2), n2),
        E("Smith Calf Raise", S(10, 2, 3), "2 s pause at stretch"),
    ]

def upper_a():
    n1, n2 = ss("Cable Crossover", "Face Pull")
    return [
        E("Flat DB Press", S(5, 1, 3), "tracked secondary press · rest 2.5 min"),
        E("Smith Close Grip Bench", S(6, 2, 3), "triceps focus · rest 2 min"),
        E("Cable Crossover", S(12, 2, 2), n1 + " · work from the stretched position"),
        E("Face Pull", S(15, 2, 2), n2),
    ]

def lower_a(heavy):
    r, t = heavy
    n1, n2 = ss("Leg Curl", "Hip Adduction")
    return [
        E("Trap Bar Deadlift", S(r, t, 3), "main lift · strip plates rather than reload · rest 3–4 min · log RIR"),
        E("Romanian Deadlift", S(8, 3, 2), "the variant you tolerate; swap equipment freely"),
        E("Leg Curl", S(10, 2, 2), n1),
        E("Hip Adduction", S(15, 2, 2), n2),
    ]

# ---------- B week (technique + volume) ----------
def push_b(tech_sets):
    n1, n2 = ss("Tricep Bar Pushdown", "Cable Lat Raise")
    return [
        E("Strict Press", S(4, 3, 4), "technique volume · rest 2.5 min"),
        E("Machine Chest Press", S(8, 2, 2)),
        E("Tricep Bar Pushdown", S(10, 2, 2), n1),
        E("Cable Lat Raise", S(12, 2, 2), n2),
    ]

def pull_b():
    n1, n2 = ss("Lat Pulldown", "Face Pull")
    return [
        E("Lat Pulldown", S(8, 2, 3), n1),
        E("Face Pull", S(15, 2, 2), n2),
        E("Chest Supported Row", S(10, 2, 2)),
        E("DB Hammer Curl", S(10, 2, 2)),
    ]

def legs_b(tech_sets):
    n1, n2 = ss("Leg Extension", "Smith Calf Raise")
    return [
        E("Smith Squat", S(3, 4, tech_sets),
          "technique · 2 s pause at depth · squat shoes · rest 2.5 min · drop a set if the session runs past 45 min"),
        E("Split Squat", S(8, 3, 2), "heels elevated · per leg"),
        E("Leg Extension", S(12, 2, 2), n1),
        E("Smith Calf Raise", S(12, 2, 2), n2),
    ]

def upper_b():
    n1, n2 = ss("Rope Pushdown", "Rear Delt Fly")
    return [
        E("Smith Shoulder Press", S(6, 2, 3), "rest 2.5 min"),
        E("Flat DB Press", S(8, 2, 2)),
        E("Rope Pushdown", S(12, 2, 2), n1),
        E("Rear Delt Fly", S(15, 2, 2), n2),
    ]

def lower_b(tech_sets):
    return [
        E("Trap Bar Deadlift", S(3, 4, tech_sets),
          "technique · 2 s pause just below the knee · rest 2.5 min · drop a set if the session runs past 45 min"),
        E("Smith Hip Thrust", S(6, 2, 2), "tracked secondary"),
        E("Suitcase Carry", [{"w": None, "r": None, "type": "working", "t": 3} for _ in range(2)],
          "2 × ~30 m per side, moderate · skip after any back or shoulder flare"),
    ]

# ---------- mobility (from week 5) ----------
MOB_LOWER = E("Goblet Squat", S(None, 4, 3),
              "mobility warm-up · heels raised · 3 × 20–30 s hold at depth · then pain-free wall ankle rocks ×10 per side, never forced to end range")
MOB_UPPER = E("External Rotation", S(15, 4, 2),
              "mobility warm-up · light cable, per arm · then wall slides ×10 · no dislocates, no end-range pulling")

def with_mob(exs, kind):
    return ([MOB_LOWER] if kind == "lower" else [MOB_UPPER]) + exs

# ---------- test week ----------
def test_day(lift, note):
    return [E(lift, [{"w": None, "r": 1, "type": "top", "t": 1}], note)]

TEST_NOTE = "test single @ RIR 1: same bar, plates and shoes every test · or estimate from a heavy triple's RIR"

def test_week(week, label):
    return [
        dict(week=week, day=1, name=f"Wk {week} · Test · Smith Squat", block=label,
             exercises=test_day("Smith Squat", TEST_NOTE + " · film for depth")),
        dict(week=week, day=2, name=f"Wk {week} · Light pull", block=label,
             exercises=[E("Lat Pulldown", S(10, 4, 2)), E("Face Pull", S(15, 4, 2))]),
        dict(week=week, day=3, name=f"Wk {week} · Test · Trap Bar Deadlift", block=label,
             exercises=test_day("Trap Bar Deadlift", TEST_NOTE)),
        dict(week=week, day=4, name=f"Wk {week} · Light lower", block=label,
             exercises=[E("Leg Extension", S(12, 4, 2)), E("Leg Curl", S(12, 4, 2))]),
        dict(week=week, day=5, name=f"Wk {week} · Test · Strict Press", block=label,
             exercises=test_day("Strict Press", TEST_NOTE)),
    ]

workouts = []
def training_week(week, phase_week, mobility):
    """phase_week 1..8 within a block; odd = A, even = B."""
    is_a = phase_week % 2 == 1
    heavy = (3, 2) if phase_week <= 4 else (2, 1)       # 3×3 @RIR2, then 3×2 @RIR1
    tech = 3 if phase_week <= 4 else 4                   # 3×3 then 4×3 @RIR4
    days = (
        [("Push", push_a(heavy), "upper"), ("Pull", pull_a(), "upper"), ("Legs", legs_a(heavy), "lower"),
         ("Upper", upper_a(), "upper"), ("Lower", lower_a(heavy), "lower")]
        if is_a else
        [("Push", push_b(tech), "upper"), ("Pull", pull_b(), "upper"), ("Legs", legs_b(tech), "lower"),
         ("Upper", upper_b(), "upper"), ("Lower", lower_b(tech), "lower")]
    )
    label = ("A - HEAVY" if is_a else "B - VOLUME") + (" + MOBILITY" if mobility else "")
    for i, (nm, exs, kind) in enumerate(days, start=1):
        if mobility and nm != "Pull":
            exs = with_mob(exs, kind)
        workouts.append(dict(week=week, day=i, name=f"Wk {week} · {nm} {'A' if is_a else 'B'}",
                             block=label, exercises=exs))

for w in range(1, 9):
    training_week(w, w, mobility=w >= 5)
workouts += test_week(9, "TEST 1")
for w in range(10, 18):
    training_week(w, w - 9, mobility=True)
workouts += test_week(18, "TEST 2")

program = {
    "id": "hunchback-hercules-general-strength",
    "name": "Hunchback Hercules · General Strength",
    "subtitle": "18 weeks · PPLUL A/B · trap bar, Smith squat, strict press total · RIR-driven",
    "priority": ["Smith Squat", "Strict Press", "Trap Bar Deadlift"],
    "meets": [],
    "loads": "rir",
    "weekdays": [1, 2, 3, 4, 5],
    "workouts": workouts,
}
json.dump(program, open(OUT, "w"), ensure_ascii=False, indent=1)
print(len(workouts), "sessions")
