# Design pass — November 2026 (roadmap 00-D1)

What was changed in the UI and menus, and why. One area per version, so
anything Aaron dislikes can be reverted on its own (`git revert` the commit
named for the version).

Rules this pass kept to (from the roadmap): nothing added between a set and
its tick; the live set table's controls untouched; the nav unchanged (Home ·
Calendar · Train · Stats · Health, Coach in the middle, Tools in the top
bar); no feature removed.

## How it was checked

Every page and the main sheets were looked at at phone size (375 × 812) in
both skins, with a log that has history and with an empty one.

**The axe check was not run.** The roadmap asks for it after each change.
Loading axe-core into the preview was blocked in this session (it's code
from outside the project), and I didn't go round that. In its place a
script in the preview checked three things on every page and main sheet, in
both skins:
- every control has an accessible name;
- text contrast against its real background (WCAG AA: 4.5, or 3 for large
  text);
- tap size of every button.

That covers the C4 rules that have bitten before, but it is not axe: it
doesn't check ARIA roles, landmark structure, heading order or focus order.
**For Aaron:** run axe once on the finished branch (the browser extension
is enough) — or say it's fine for an agent to load it.

Starting point (0.93.1): no unnamed controls, no contrast failures, and
about 60 buttons under 40 px tall.

## Changes

### 0.94.0 — small buttons take a finger
**What:** every `.btn.sm` (30 px tall), `.btn.xs` (25 px), `.icon-btn` (the
✕ on every sheet, 28 × 27) and tappable chip now has a tap area at least
40 px tall and 34 px wide.
**Why:** C4 asks for 40 px targets. The live set table already had them;
almost nothing else did — Start and Missed on Home and Train, Edit and
Delete on the calendar, every "+ Add" on Health, the close button on every
sheet.
**How:** an invisible pad (`::after`) centred on the button. The buttons
look exactly as before and nothing in any layout moves. The pad is narrower
sideways (34 px) so two small buttons side by side don't take each other's
taps.
**Left alone on purpose:** the set table's own × (delete set) and plate
buttons. They sit hard against the weight box, and a wider pad there could
turn a tap on the weight into "delete set".
**Checked:** no button under 38 px tall or 32 px wide on any page or in
Settings; in the live set table every input, tick and set-number box still
receives taps at its own corners.

### 0.94.1 — Home leads with today's session
**What:** for anyone training with Ironlog — a workout in progress, a
session planned today, or any logged history — **Today's training** is now
the first card on Home. The About card, backup reminder, event countdown,
check-in and the week's numbers follow it. Two sessions done on one day now
have a divider between them.
**Why:** it's what the page is opened for. It sat a screen and a half down,
under the About card, the backup reminder, the check-in and three stat
tiles, so Start needed a scroll every day.
**Unchanged for someone new:** with no workout, nothing planned today and no
history, the About card still comes first, as `home-landing-spec.md` set
out, and Today's training stays where it was.
**For Aaron:** the check-in is now second. If you'd rather check in before
you see the session, this is the commit to revert.

### 0.94.2 — labels that say what the thing is
**What:**
- The Stats page was headed **Analytics**; it's now **Stats**, the same word
  as its tab.
- A planned session that hasn't happened yet no longer has a **Missed**
  button. Today's and future sessions show **Skip / move**; the sheet is
  titled *Skip or move this session* and asks *Why isn't it happening as
  planned?* Past days keep **Missed** and *Missed session*. Skipping a future
  one now says *Taken off your plan* instead of *Logged as missed*.
**Why:** one word per place; and "Missed" on next Tuesday's session read as
a mistake. The sheet, the reasons and what's stored are the same.

### 0.94.3 — Settings has a way in
**What:** a row of seven chips at the top of Settings — Look & units,
Timers, Places & kit, AI & extras, Program, Video, Data & backup. Tapping
one scrolls to that section and moves focus there (so TalkBack lands on it
too; it honours "reduce motion").
**Why:** Settings is one sheet about 4,600 px tall — six screens at phone
size — with Export, Import, Drive and Erase at the very bottom. Nothing was
moved or regrouped, so everything is where it was for anyone who knows it.
**Not done, for Aaron to decide:** Settings mixes three kinds of thing —
preferences (skin, units, timers), kit (places, bars, plates) and data
(program, backfill, export, Drive, erase). Splitting it into two or three
sheets would be the real fix; that changes where things live, so it's
listed under "For Aaron" below rather than done.
