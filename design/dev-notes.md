

---

## 🏗 Component / Architecture Sketch for Scrollable Multi-Day Timeline

Goal: evolve current `single-day-log.tsx` into a reusable time-canvas architecture with:
- fixed left labels
- shared horizontal scrolling
- both Proportional and Compressed modes inside same viewport
- later support for 8-day / 14-day canvases
- later support for zoom (`pixelsPerHour`)

This plan aims for **minimal conceptual churn** while replacing the current single-day assumptions. Current file already has useful seams around `TimelineSection`, `TimelineRowGroup`, `Axis`, segment selection, and render primitives. :contentReference[oaicite:0]{index=0}

---

## 1. Desired High-Level Layout

### Current mental model
- `TimelineSection`
  - labels
  - track row group
- optional `Axis`

### Target mental model
- `TimelineShell`
  - fixed label column
  - `TimelineViewport` (horizontal scroller)
    - `TimelineCanvas`
      - rest tracks
      - work tracks
      - overlays
      - axis

### Visual structure

```text
+---------------------------------------------------------------+
| Toolbar                                                       |
+---------------------------------------------------------------+
| Labels |  <------ horizontally scrollable timeline ------>    |
|        |  Rest rows                                           |
|        |  Work rows                                           |
|        |  Axis                                                |
+---------------------------------------------------------------+
| Details / legend                                              |
+---------------------------------------------------------------+