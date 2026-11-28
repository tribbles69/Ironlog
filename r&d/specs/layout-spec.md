# Layout rework — Home · Calendar · Train · Stats · Health (roadmap D12)

Written 2026-10-31. Aaron's call on the shape (roadmap D12); this spec is how
it's built. Covers both skins: the 98 menu bar is a second door onto the same
pages, so it changes with them.

## 1. The bottom bar

| Before | After | Internal page id |
| --- | --- | --- |
| Home | Home | `home` |
| Calendar | Calendar | `calendar` (and `meets`, see §3) |
| Workout | **Train** | `workout` |
| Stats | Stats | `analytics` |
| Events | **Health** | `health` (new) |

Still five tabs. **Page ids don't change** where a page survives: `workout`
stays `workout` and `meets` stays `meets`. Only the label and the way in
change. That way every existing `go('workout')`, `data-go="workout"`,
`go('meets')` and the smoke test keep working with no redirect table, and a
live session resumes from Train exactly as before.

The nav button that lights up for a page: `meets` → Calendar. Everything else
lights its own tab. `aria-current="page"` follows the lit tab.

## 2. Train (`workout`)

The landing page (no live session) is titled **Train**, with the starts:

- **Lift** — today's *Start empty workout*, then the planned sessions and
  *Repeat a session* lists, unchanged.
- **Cardio** — opens the cardio setup (`openCardioSetup`). D15 turns that
  into a machine picker.
- **Mobility** — **not shown until E5 ships.** A greyed button that does
  nothing is noise; E5 adds the button and its routine picker here.

A live lifting or cardio session renders exactly as it does now.

## 3. Events move into Calendar

Calendar gets a two-way switch at the top: **Calendar | Events**.

- *Calendar* is today's month grid and day panel (`page = 'calendar'`).
- *Events* is today's Events page, unchanged (`page = 'meets'`): priority
  lifts, tests, upcoming events with **+ Add event**, past events, meet day.
  Nothing in C2/C3 is removed or rewritten.
- The month grid marks event days with a gold dot (legend: *Event*), and the
  day panel lists any event on that day with an **Open** button
  (`openMeet`) and, inside 14 days, a **Meet day** button.
- `go('meets')` from anywhere (98 menu, old links) lands on Calendar's Events
  switch.

## 4. Home

- **Event countdown card:** when the next event is 0–14 days away, Home shows
  a card under the date: name, type, "in N days" (or "today"), and a
  **Meet day** button that opens `openMeetDay`. One card, the nearest event.
- The mobility line ("Morning stretch 8 / 25") arrives with E5.

## 5. Health (`health`)

New page. Until D13 builds it out, it is the body composition page that was
Stats → Body (`viewBody()` + `wireBody()`), under an `h1` of *Health*. No data
moves and there's no schema change.

Stats loses its Body tab: Exercises / Rankings / Muscles. If anything still
sets `analyticsTab = 'body'`, rendering Stats sends it to Health instead.

## 6. Tools in the top bar

A **Tools** button (wrench icon, labelled "Tools") sits in the top bar before
Profile and Settings, in both skins. It opens a Tools sheet. Until D11 fills
it with calculators, it holds what already exists:

- **Plate loader** — `openPlates` with an empty target.
- **Warm-up ramp** — `openRamp` for a typed weight.

D11 adds its calculators to the same sheet (`openTools`).

## 7. The 98 skin

- *View* menu: Home, Calendar, Train, Stats, Health, Events.
- *Tools* menu gains **Tools…** at the top (the same `openTools`).
- *File → New workout* still goes to Train.

## 8. Accessibility (C4)

- Nav buttons keep visible text labels; the icons stay `aria-hidden`.
- Top-bar buttons get `aria-label`s and a 40 px minimum target.
- The Calendar | Events switch is a `.seg` of real buttons with
  `aria-pressed` (set by `a11yPass`, as for the other switches).
- Re-run the axe check on Home, Calendar, Events, Train, Stats, Health and
  the Tools sheet in both skins.

## 9. Not in this item

- Health's own content (summary row, history, other data) — D13.
- Calculators — D11.
- Mobility routines and the Home mobility line — E5.
- Cardio machine picker — D15.
