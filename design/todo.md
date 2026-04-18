# Development Activity Planner

---

## 🔥 Next Up (start here every session)

### 🧭 Timeline Canvas + Scrolling Architecture (FOUNDATION)

#### Pass 1 — Layout Refactor (no time math changes yet)
- [x] Split label column from timeline track (fixed labels, scrollable timeline)
- [x] Introduce shared horizontal scroll viewport (Rest + Work + Axis move together)
- [x] Wrap timeline content in `TimelineViewport` container (`overflow-x: auto`)
- [x] Ensure Axis scrolls in sync with tracks
- [x] Prevent page-level horizontal scroll (contain scroll to timeline only)

#### Pass 2 — Timeline Scale Abstraction
- [ ] Introduce `TimelineScale` model:
  - [ ] `startSecond`
  - [ ] `endSecond`
  - [ ] `durationSeconds`
  - [ ] `pixelsPerHour` (target: 60 px/hr)
- [ ] Replace `% of 86400` math with pixel-based helpers:
  - [ ] `timeToPx(second)`
  - [ ] `durationToPx(seconds)`
- [ ] Convert Proportional mode to use pixel-based layout
- [ ] Keep Compressed mode widths heuristic-based but rendered in same canvas

#### Pass 3 — Multi-Day Canvas (8 / 14 Day Target)
- [ ] Expand timeline to multi-day range (US: 8 days, CA: 14 days)
- [ ] Compute `timelineStartSecond` / `timelineEndSecond`
- [ ] Add day boundary markers
- [ ] Add day labels (e.g., "Thu 4/18")
- [ ] Update Axis to support multi-day display
- [ ] Ensure highlights, overlays, and caps scale correctly across days

#### Interaction + UX (initial pass)
- [ ] Verify touch scrolling behavior (mobile/tablet)
- [ ] Ensure segment tap works without interfering with scroll
- [ ] Persist selected segment while scrolling
- [ ] Add subtle edge fade indicators for scrollable region

---

## ⚡ Active Work

### Compressed Mode (now part of shared canvas)
- [ ] Move Compressed mode into scrollable timeline architecture
- [ ] Validate usability at wider canvas widths
- [ ] Prototype compressed multi-day readability

- [ ] Prototype compressed 'noisy/dense' driving/on-duty segments
  - Goal: improve readability in multi-day view
  - Question: collapse by time threshold or density?

---

## 📅 Multi-Day Scrollable Region

- [ ] Show 7- to 14-day side-scrolling timebar
- [ ] Set origin timestamp
- [ ] Set origin timezone

### Markers
- [ ] Draw day markers (1/day)
- [ ] Draw multi-day markers in collapsed spans

### Daily Totals
- [ ] Render duty totals per day (expanded mode)
  - Separate marker, left of next-day marker
- [ ] Render duty totals per day (collapsed mode)
  - Use day marker

### Timezone Handling
- [ ] Display timezone
- [ ] Add manual timezone override ... common US/Canada plus UTC
- [ ] Add quick programmatic timezone override
  - Example: hover over TZ buttons (future use: cross-timezone documents)

---

## 🛏 Sleeper Splits
- [ ] Highlight qualifying ~~sleeper~~ splittable rest bars
- [ ] Show accumulations on both sides of qualifying rest
  - Display grand totals
  - Show violation state vs compliant

---

## 🌎 Jurisdictions
- [ ] Timebar with flags?

---

## 📍 Locations
- [ ] Show locations in simple string list

### Proportional Mode
- [ ] Draw locations at 45° at proportional position
- [ ] Draw locations using smart stacks (approximate positioning)

### Condensed Mode
- [ ] Draw location at end of driving
- [ ] Draw location at start of driving (if different from previous)

### Geo Mapping
- [ ] Draw markers in "geo space" using relative lat/lon only

---

## 🚨 Driving / Duty Limits

- [ ] Show Violation markers/caps in Condensed Mode

### Driving / Duty Limits (continued)
- [ ] ViolationCaps: Implement time-based positioning/fixtures

---

## ❓ Open Questions
- How should compressed mode decide grouping? (time threshold vs density)
- Should timezone override affect stored data or rendering only?
- How should multi-day compressed mode visually indicate day boundaries?

---

## ✅ Recently Completed (most recent first)

### Background
- [x] Add toggle button for highlighter - show when highlights are active (active on/off) and when button is valid (dim)
- [x] One hour hash marks
- [x] Highlight section of grid with gently transparent color
- [x] Experiment 3-4 stacked highlights or toggling (stacking works well; better with same color)
- [ ] ~~Maybe: half-hour hash marks~~

### Driving / Duty Limits
- [x] Prototype driving, shift, on-duty, and multi-day limits
  - [x] Include stacking (earliest-on-top)
  - [x] Consider overlay vs grouped visual model
  - [x] Rough out some icons, test vs. text (Text wins)
  - [x] Consider half-pill vs. octagon/stop sign shapes (Octagons win)
  - [x] Signal when in-violation (fill red; keep border colored by category)
  - [x] Fade violation categories with distance

### Notation Prototypes
- [x] Prototype Personal Conveyance notation
- [x] Prototype Yard Move notation

### Older
- [x] Setup GitHub repo `matrix-play` and commit code
- [x] Add four-row display (Rest → Off Duty/Sleeper; Work → Driving/On Duty)
- [x] Fix timeline tick alignment (margin issue)
- [x] Move rest to top, work to bottom (visual layout)
- [x] Switch to timestamp-based fixtures
- [x] Explore compressed mode rendering rules
- [x] Pressure-test bars vs lines model with real driver day

---

## 🧪 Session Notes

### 2026-04-18
12:36p
- [x] Introduced side-scrolling to (oversized) one day grid
- [x] Moved lables out of scrolling region

### 2026-04-17
6:06p
- [x] Use today as current date for demo purposes

5:58p
- [x] Fix timebar hints:
  - Segment Length
  - Start/Stop
  - Duty Status
  - Show dates if crossing days

5:31p
- [ ] ~~Allow seconds on Fixture timestamps~~ (already in code)
- [x] Truncate (not round) durations to minutes for display
- [x] Show seconds in segment detail hints
- [x] Show "+" for exact-hour values with extra seconds (e.g., 11h+)

---

### 2026-04-16
- Added toggle button for highlights on/off
- Grid highlighter supports full height + stacked layers
- Added hourly grid guidelines
- Refined time label formatting
- First ViolationCap prototype placed on timeline

---

### 2026-04-09 
- PC/YM notations under off-duty and on-duty
- Driving row "shadow" traces showing suppressed driving

---

### 2026-04-08
- Initialized repo and first commit