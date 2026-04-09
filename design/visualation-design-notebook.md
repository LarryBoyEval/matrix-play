# Log Grid Visualization – Design Notebook

---

## 🧭 Core Principles

- Sequence > proportional time
- Regulatory truth > chronological fidelity
- Rest vs Work is primary axis
- Visual weight maps to effort:
  - Work = heavy (bars)
  - Rest = light (lines)
- Compression is for space, not meaning
- Visualization is a **decision surface**, not just playback

---

## 💡 Active Ideas

### Structural
- Work as **bars** (time inside)
- Rest as **lines** (time above)
- Rest “cap” shape (rectangle without vertical sides)
- Continuous timeline feel (avoid boxed grid look)

### Visual Hierarchy
- Driving = most visually prominent
- On Duty = secondary (slightly muted or textured)
- Sleeper = soft, slightly emphasized rest
- Off Duty = quiet baseline

### Interaction
- Hover/tap reveals:
  - start/end time
  - duration
  - annotations
- Expand segments on interaction
- Mobile: larger tap targets, less reliance on hover

---

## 🧠 Key Insights

- Users care about **thresholds**, not proportional duration:
  - 11h driving
  - 14h window
  - 30 min break
  - 8/10 sleeper
  - 34 reset
- Long spans should **not dominate screen space**
- Rest becomes more important during **analysis**, not default viewing
- Visual emphasis should be:
  - quiet by default
  - expressive when meaningful
- Order of events is sacred; spacing is negotiable

---

## 🚇 Timeline Model (Subway Analogy)

- Preserve:
  - order
  - adjacency
- Allow:
  - non-proportional spacing
  - compressed long segments
- Signal compression explicitly (e.g., `//`, gaps, markers)

### Concept
Chronology = spatial order  
Duration = encoded (labels), not necessarily scaled

---

## 📊 Display Modes (Emerging Concept)

### 1. Proportional Mode
- True time scaling
- Audit/reconstruction use
- Secondary mode

### 2. Compressed Mode (Likely Default)
- Normalized spacing
- Durations shown via labels
- Optimized for scanning and planning

### 3. Analytical Mode
- Highlights:
  - sleeper splits
  - deferrals (Canada)
  - violations
  - thresholds
- Rest segments may “inflate” visually when relevant

---

## 🎨 Visual Language

### Base UI (Corporate-Friendly)
- Light background
- Minimal gridlines
- Neutral typography

### Data Layer (Expressive)
- Color + shape carry meaning
- Avoid over-decoration

### Color Roles
- Work = higher energy (warmer / brighter)
- Rest = calmer (cooler / desaturated)

---

## 🧩 Shape Language

- Driving → sharp, strong bars
- On Duty → slightly softer / possibly textured
- Sleeper → rounded, soft emphasis
- Off Duty → thin, flat, quiet

---

## ✨ Highlights & Emphasis

Used sparingly, only for meaning:

- Sleeper splits → soft glow / pairing
- Deferrals → linked segments
- Violations → sharp, high-contrast indicator
- Thresholds → subtle halo or emphasis

Rule:
> Don’t decorate everything — only what matters

---

## ⚖️ Bars vs Lines Model

### Work (Bars)
- Filled
- Heavier visual weight
- Time label inside
- Represents effort / load

### Rest (Lines)
- Thin or capped lines
- Time label above
- Represents absence of effort

### Rest Cap Ideas
- Open-top line (no vertical sides)
- Rounded cap
- Subtle dual-line structure

---

## ⏱️ Segment Representation Rules (Exploratory)

- < 30 min → minimal representation (tick or ignore)
- 30–120 min → thin segment
- 2h–8h → standard segment
- 8h+ → candidate for emphasis (context-dependent)

Note:
These are **display heuristics**, not meaning

---

## 📅 Data Selection / Lookback Model

### Primary User Context
User context will almost always be within:
- **Last 8 days** in the U.S.
- **Last 14 days** in Canada

The data selector should make these ranges **extremely convenient** and likely treat them as the default working views.

### Secondary User Context
Regulations typically have a **6-month lookback window**, so this should be the main secondary option.

Design goal:
- easy jump between **recent operational view** and **regulatory/history view**
- optimize for how users actually think and investigate

---

## 🎛️ Selector Priorities

### Default / Primary
- Recent-day selection should be frictionless
- U.S. users: quick access to last 8 days
- Canada users: quick access to last 14 days

### Secondary
- **6-month lookback** should be one action away
- Dense but still accessible display on:
  - laptop
  - tablet
- Likely less important on phone except through drill-down or filtered navigation

---

## ⌨️ Keystroke Navigation Ideas

Offer both **visual** and **keystroke** affordances.

### Recent-Day Keystrokes
- `7` = 7th most recent **past** date
- `1` = most recent past date
- numbers map naturally to recent-day history

### Date-Oriented Keystrokes
- `37` = most recent past **March 7**
- supports quick expert navigation without opening a calendar

### Design Notes
- keystroke system should favor:
  - recent past
  - fast expert access
  - minimal ambiguity
  - short keystroke concepts for near timeframes; more complex keystroke concepts for longer look-back timeframes
- behavior should strongly assume **past-facing** workflows

---

## 🔭 Temporal Product Boundary

This product is almost never forward-facing except for:
- a few days of driver planning / preview use

That likely belongs to a **different product mode or separate product**.

Core assumption for this visualization system:
- users are primarily reviewing **past logs**
- navigation and defaults should optimize for retrospective investigation, not planning

---

## 🧠 Implications for Design

- “Recent past” should feel immediate and lightweight
- “6-month lookback” should feel powerful but compact
- selector design should support:
  - quick scanning
  - rapid expert jumps
  - regulation-aware history access
- avoid over-optimizing for future dates in the core workflow

---

## 🔁 Interaction Model

### Desktop
- Hover reveals details
- Fine-grained interaction

### Mobile / Tablet
- Tap to expand
- Persistent key info for important segments
- Larger hit areas required

### Expansion Behavior
- Segments can:
  - grow in height
  - reveal labels
  - highlight relationships

---

## 🌗 Light vs Dark Theme Strategy

- Default: light (corporate acceptance)
- Dark mode:
  - analysis screens
  - focused views
- Use contrast strategically, not globally

---

## 🧠 Analytical Opportunities

- Highlight **rest quality**, not just violations
- Visualize:
  - split sleeper correctness
  - proximity to thresholds
  - compliance state, not just activity

---

## ⚖️ Open Questions / Tensions

- How minimal can rest lines be without losing clarity?
- Best representation for compression markers (`//`, gap, symbol)?
- When should rest segments “inflate” into bars?
- How far can expressive visuals go within corporate constraints?
- Should compressed mode be default?

---

## 🧪 Visual Experiments
REST ────────────────┐ ────────────┐
10h Off Duty 2h Sleeper

WORK ███████████ █████
Driving On Duty

---

## 📌 Parked Thoughts

- Fibonacci / non-linear spacing for segments?
- Align segments to regulatory thresholds instead of time?
- Weekly sparkline / summary timeline?
- Visual pairing for sleeper splits
- Toggle between compressed and proportional views


### 🧠 Major Parked Thought: Handling Noisy Micro-Transitions 

#### Problem

Short-duration duty status changes — especially frequent **Driving ↔ On Duty** transitions — create:

- visually fragmented timelines in proportional mode  
- poor label readability (segments too small)  
- low signal-to-noise ratio  
- cognitive overload without meaningful insight  

This is especially common in real-world logs with:
- yard movements
- short stops
- duty toggling during active driving windows


#### Observations

- Strict proportional rendering preserves truth but degrades usability under high-frequency transitions  
- Many of these transitions do **not materially affect compliance interpretation**
- Users are typically interested in:
  - total driving time
  - proximity to thresholds
  - meaningful rest boundaries  
  not every micro-transition


#### Potential Strategy: Clustered Segments

Introduce a **clustered rendering mode** (or enhancement to proportional mode):

##### Concept

Group adjacent short segments into a single **composite block** when:

- segments are below a duration threshold (e.g., < 15–30 minutes)
- transitions occur within a short time window
- segment types are semantically related (e.g., Driving + On Duty)


##### Visual Treatment Ideas

- blended color (e.g., gradient between Driving and On Duty)
- subtle internal markers instead of full segmentation
- single duration label for the cluster
- optional expansion on hover/tap

##### Example

Instead of:

Driving (12m) → On Duty (8m) → Driving (10m)

Render as:

[ Driving / On Duty cluster ~30m ]


#### Mode Interaction

- **Proportional Mode**
  - default: strict rendering
  - optional: clustered overlay or toggle

- **Compressed Mode**
  - clustering likely **default behavior**
  - aligns with “sequence > duration” philosophy


#### Design Goals

- preserve chronological truth where needed  
- reduce visual noise in high-frequency regions  
- emphasize **meaningful time blocks** over raw event granularity  
- support both:
  - forensic analysis (expandable detail)
  - rapid scanning (clustered abstraction)


#### Open Questions

- What duration threshold defines a “micro-segment”?  
- Should clustering be automatic or user-controlled?  
- How to visually indicate that clustering has occurred?  
- Should clusters expand inline or via interaction?  


### Very Short Segment Rendering

In proportional mode, segment widths should remain strictly time-accurate with no artificial minimum width.

Implication:
- very short segments (for example 1 minute, 30 seconds, or 1 second) may become visually negligible or effectively invisible at full-day scale

This is acceptable if treated as a conscious display rule rather than a rendering bug.

Potential strategies:
- suppress direct rendering below a minimum display duration
- show a marker/tick instead of a full bar
- preserve the event for hover/inspection even if not visibly expanded
- rely on zoomed views for forensic inspection of very short segments (currently preferred; keep others for reference)

Guiding rule:
- do not distort proportional geometry merely to preserve visibility


### 🧭 Guiding Principle

> Not all time transitions are equally meaningful.  
> The visualization should prioritize **interpretability over raw fidelity** when appropriate.


---

## 🗂️ Notes

- This is a **living document**
- Prioritize clarity of thinking over polish
- Capture insights, not just conclusions

---

