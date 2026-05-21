# Zuuno — Version Log

> Working draft. Copy each completed entry onto the paper Version Log form
> when turning the project in. One entry is written per saved version of
> the app. The three project milestones are marked in **bold**.

Name: ______________________________________

---

## App version #1 — Front-End Skeleton  *(Milestone 1: The Front-End Skeleton)*

**Describe visual layout**

A single-page web app with a sticky top header (Zuuno logo, app name, and
Premium + Settings icon buttons) and a fixed bottom tab bar with five tabs:
Assistant, Providers, Pharmacy, Trials, and Resources. The visual style is a
calm, clinician-grade theme — teal accent color, white cards, light-gray
background, rounded corners, and soft shadows. All five screens are laid out
and styled:

- **Assistant** — a medical disclaimer banner, a sample chat exchange with a
  structured answer card (condition title, ICD-10 tag, confidence bar,
  collapsible sections, citations, PDF/Share buttons), suggested-question
  chips, and a message composer with a condition selector.
- **Providers** — a location/radius filter bar, a map placeholder, and
  provider result cards.
- **Pharmacy** — a medication-availability check box, pharmacy-type filter
  pills, a map placeholder, and pharmacy/infusion result cards.
- **Trials** — a search bar, result/watching toggle pills, and trial cards.
- **Resources** — a search bar, category filter pills, and resource cards.

**Describe functionality**

None yet — this is the skeleton. Every button, tab, input, and card is present
and styled, but nothing responds to clicks. To make the full design reviewable,
all five screens are stacked on one scrolling page. `script.js` loads and logs a
confirmation message to the console, but adds no behavior.

**What isn't working well**

- The bottom tab bar does not switch screens yet; screens are stacked instead
  of shown one at a time.
- The maps are static placeholder graphics, not real interactive maps.
- The chatbot cannot accept input or produce answers — the answer shown is a
  hard-coded sample.
- No filtering, searching, or saving works.
- Next step (Milestone 2): wire up tab navigation first so only one screen
  shows at a time.

---

## App version #2 — Tab Navigation  *(Milestone 2: The Moving Engine begins)*

**Changes in visual layout**

Screens are no longer stacked on one page. Only one screen shows at a time,
like a real tabbed app. The active tab in the bottom bar is highlighted in teal.

**Changes in functionality**

The bottom tab bar now works. Clicking a tab (Assistant, Providers, Pharmacy,
Trials, or Resources) switches to that screen and hides the others. The page
jumps back to the top when switching. This was done in `script.js` only — no
HTML or CSS was changed.

**What isn't working well**

Everything else is still inactive — the chatbot input, search boxes, filter
chips, save buttons, and the maps do nothing yet. Next version: wire up the
chatbot so it can take a typed question and show an answer.

---

## App version #3 — Fix: Tab Navigation Caching Bug  *(Milestone 2)*

**Changes in visual layout**

No new visual changes — the same five screens, one shown at a time.

**Changes in functionality**

Fixed a bug found during testing: on the live site the tabs looked broken and
every screen showed stacked together. The cause was the browser loading an old,
cached copy of the JavaScript file. Two fixes were made:

1. Screens are now hidden and shown with a CSS class (`.active`) instead of
   relying only on JavaScript, so the layout is correct even before the script
   runs (and even if it fails to load).
2. Added a version tag to the style and script links (`?v=3`) so the browser is
   forced to download the fresh files instead of cached ones.

**What isn't working well**

The chatbot input, search boxes, filters, and maps still do nothing.
Testing note: after each update, do a hard refresh (Ctrl+Shift+R /
Cmd+Shift+R) or open the site in a private/incognito window so you are not
shown a cached version.

---

## App version #4

**Changes in visual layout**


**Changes in functionality**


**What isn't working well**


---

## App version #5

**Changes in visual layout**


**Changes in functionality**


**What isn't working well**


---

## App version #6

**Changes in visual layout**


**Changes in functionality**


**What isn't working well**


---

## App version #7

**Changes in visual layout**


**Changes in functionality**


**What isn't working well**


---

## App version #8

**Changes in visual layout**


**Changes in functionality**


**What isn't working well**

