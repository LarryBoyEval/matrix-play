# Development Activity Planner

## 🔥 Next Up (start here every session)

### Driving / Duty Limits
- [x] Prototype driving, shift, on-duty, and multi-day limits
  - [x] Include stacking (earliest-on-top)
  - [x] Consider overlay vs grouped visual model: note: border colors with horizontal offsets allow expert violation
        category detection
  - [x] Rough out some icons, test vs. text. (Text wins)
  - [x] Consider half-pill vs. octagon/stop sign shaps. (Octagons win)
  - [x] Signal when in-violation (fill red; keep border colored by by violation category)
  - [x] Fade violation categories .. futher distance = less opacity
  - [ ] Implement time-based positioning

### Background
- [x] One hour hash marks
- [ ] Highlight section of grid with gently transparent color
- [ ] Experiment 3-4 stacked highlights or toggling
- [ ] ~~Maybe: half-hour hash marks~~



## ⚡ Active Work

### Compressed Mode
- [ ] Prototype compressed 'noisy/dense' driving/on-duty segments
  - Goal: improve readability in multi-day view
  - Question: collapse by time threshold or density?

---

## 🛏 Sleeper Splits
- [ ] Highlight qualifying ~~sleeper~~ splittable rest bars
- [ ] Show accumulations on both sides of qualifying rest
  - Display grand totals
  - Show violation state vs compliant

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

## ❓ Open Questions
- How should compressed mode decide grouping? (time threshold vs density)
- Should timezone override affect stored data or rendering only?

---

## ✅ Recently Completed (most recent first)

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

### 2026-04-16
4:56p
- Drawing one hour guidelines on grid
- Changed times to be one hour with brief pm indicators

11:00a-ish
- Completed first pass (multiday project) of ViolationCap component: shows where violations start on timeline

### 2026-04-09 
6:24p
- PC/YM notations under off-duty and on-duty
- Driving row 'shadows' showing driving time that was suppressed

10:33a
- Established TODO workflow
- Identified need for timezone abstraction

11:14a
- [x] Move 'Next Prompt' from design notebook to formal `todo.md`
- [x] Code refactor: target large blocks

### 2026-04-08
- Initialized repo and first commit

