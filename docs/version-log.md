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

## App version #4 — Chatbot Answers  *(Milestone 2: The Moving Engine)*

**Changes in visual layout**

When you ask a question, a new answer card appears in the chat below the
example. Each answer card shows the condition name, its ICD-10 code, a
match-confidence bar, a short summary, and sections for symptoms,
medications, prognosis, and citations.

**Changes in functionality**

The chatbot works. You type a question in the box and press Enter or click
Send — your question appears as a message, and the app replies with a
structured, cited answer drawn from a built-in knowledge base of 12
conditions. It recognizes condition names, common synonyms (such as "COPD"
or "RA"), and ICD-10 codes. If it does not recognize the condition, it shows
an honest "not enough evidence to answer that" message instead of guessing.

**What isn't working well**

The answer sections do not collapse or expand yet — they are all shown open.
The condition dropdown and the suggested-question chips are not wired up yet.
The Download PDF and Share buttons on the example card still do nothing. The
maps, searches, and filters on the other tabs are still inactive. Next:
make the answer sections expand and collapse when tapped.

---

## App version #5 — Chatbot Complete  *(Milestone 2: The Moving Engine)*

**Changes in visual layout**

The chat now starts empty — the hard-coded example answer was removed, so
answers appear only after you ask a question. Every answer card is now
generated the same way, so they all look consistent. The condition dropdown
now lists all 12 conditions.

**Changes in functionality**

Finished the chatbot. Four features were added:

- Tapping any answer-section heading collapses or expands that section.
- The "Try asking" suggestion chips now ask their question when clicked.
- Choosing a condition from the dropdown sets it as context — if you then
  ask a general question such as "what are the symptoms", the answer is
  about the chosen condition.
- A safety guardrail was added: if you ask the chatbot to diagnose you
  ("do I have...") or to give a personal medication dose, it returns a
  message telling you to see a licensed clinician instead of answering.

**What isn't working well**

The Providers, Pharmacy, Trials, and Resources tabs are still not
interactive — their search boxes, filter buttons, maps, and result buttons
do nothing. The Settings and Premium icons in the header do not open
anything yet. Next: make the other tabs' searches and filters work.

---

## App version #6 — All Tabs Interactive  *(Milestone 3: Functional MVP)*

**Changes in visual layout**

The Providers, Pharmacy, Trials, and Resources tabs are now built from real
data instead of fixed examples. Each tab shows a live result count, filter
controls, and a friendly "nothing found" message when a search comes up
empty. The map placeholders now read "full version coming soon" so testers
don't mistake them for broken features.

**Changes in functionality**

Made all four remaining tabs interactive:

- Providers — filter by location, distance, specialty, telehealth, and
  whether they accept new patients; save a provider with the star; the
  Call and Directions buttons open the phone dialer and a map.
- Pharmacy — filter by type (retail / specialty / infusion centers); a
  medication-availability check; Call and Directions buttons.
- Trials — search by condition, filter by phase and status, "Save & watch"
  a trial and view a Watching list, and expand "More detail" for
  eligibility and study locations.
- Resources — search and filter by category, with working website links.

**What isn't working well**

The maps are still placeholder graphics (real interactive maps are a
stretch goal). Saved providers and watched trials are remembered only
until the page is reloaded — they do not persist between visits yet. The
Settings and Premium icons in the header still do not open anything.

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

