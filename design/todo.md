# Development Activity Planner

## 🔥 Next Up (start here every session)
- [x] Move 'Next Prompt' from design notebook to formal `todo.md`
- [ ] Code refactor: target large blocks

---

## ⚡ Active Work

### Notation Prototypes
- [ ] Prototype Yard Move notation
- [ ] Prototype Personal Conveyance notation

### Driving / Duty Limits
- [ ] Prototype driving, shift, on-duty, and multi-day limits
  - Include stacking (earliest-on-top)
  - Consider overlay vs grouped visual model

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
- [ ] Show 7-day side-scrolling timebar
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
- [ ] Add manual timezone override
- [ ] Add quick programmatic timezone override
  - Example: hover over TZ buttons (future use: cross-timezone documents)

---

## 🌎 Jurisdictions
- [ ]

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
- [x] Setup GitHub repo `matrix-play` and commit code
- [x] Add four-row display (Rest → Off Duty/Sleeper; Work → Driving/On Duty)
- [x] Fix timeline tick alignment (margin issue)
- [x] Move rest to top, work to bottom (visual layout)
- [x] Switch to timestamp-based fixtures
- [x] Explore compressed mode rendering rules
- [x] Pressure-test bars vs lines model with real driver day

---

## 🧪 Session Notes

### 2026-04-08
- Initialized repo and first commit

### 2026-04-09 10:33a
- Established TODO workflow
- Identified need for timezone abstraction
