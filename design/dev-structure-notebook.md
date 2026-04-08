# Log Grid Visualization – Dev Structure & Implementation Notes

---

## 🧭 Development Philosophy

- Prototype wide, integrate narrow
- Separate **domain logic**, **layout**, and **visual skin**
- Optimize for **iteration speed early**, **consistency later**
- Treat visualization as a **decision surface**, not just rendering

---

## 🧱 Architecture Layers

### 1. Domain Model (Pure Logic)
Stable, testable, no UI concerns.

Responsibilities:
- Normalize raw log events
- Define segment types:
  - Driving
  - On Duty
  - Sleeper
  - Off Duty
  - PC / Yard Move
- Compute:
  - durations
  - relationships (e.g., sleeper splits)
  - thresholds (11h, 8h, 34h)
- Annotate:
  - violations
  - rule-relevant segments

---

### 2. Layout Model (Geometry Engine)
Transforms domain data into renderable geometry.

Responsibilities:
- Assign rows (rest vs work, or 4-row model)
- Compute:
  - x position
  - width (proportional or normalized)
  - vertical placement
- Determine:
  - bar vs line rendering
  - label placement
  - badge/overlay positioning

---

### 3. Visual Skin (Theming Layer)
Handles appearance only.

Responsibilities:
- colors
- typography
- spacing
- border radius
- hover/tap styles

Goal:
- Easily map to parent app styles later
- Allow multiple themes during prototyping

---

## 🗂️ Suggested Project Structure

```text
log-grid/
  domain/
    timelineTypes.ts
    normalizeSegments.ts
    rulesAnnotations.ts

  layout/
    computeLayout.ts
    assignRows.ts
    labelPlacement.ts

  render/
    LogGrid.tsx
    TimelineRow.tsx
    SegmentBar.tsx
    SegmentLine.tsx
    BadgeLayer.tsx

  fixtures/
    us-simple.ts
    us-split-sleeper.ts
    canada-deferral.ts
    edge-11-hour.ts
    reset-34-hour.ts

  styles/
    tokens.ts
    themes.ts

  tests/
    domain/
    layout/
    interaction/

  stories/ (or demo/)
    scenarios.tsx