# Design: RxJS Operator Decision Trees

**Date:** 2026-04-20  
**Status:** Approved  
**Project:** `rxjs-operator-suffixes` VitePress site

---

## Goal

Add one Mermaid flowchart decision tree per operator category so users can answer a short sequence of questions and arrive at the right operator — with one click to its full deep-dive page.

---

## File Structure

```
docs/decisions/
  flattening.md
  windowing-buffering.md
  rate-limiting.md
  transformation.md
  filtering.md
  combination.md
  creation.md
  multicasting.md
  error-handling.md
  side-effects.md
  notification.md
  scheduling-timing.md
```

Each file:
- Frontmatter: `title:` only
- One-sentence framing of the decision problem
- One or more `flowchart TD` Mermaid diagrams
- `click` directives on every leaf node → `/operators/<name>`
- Footer: `→ [Category reference](../categories/<slug>)` link back

Each existing category page (`docs/categories/*.md`) gets a one-line callout at the top:
```
> Not sure which operator to use? → [Decision tree](../decisions/<slug>)
```

---

## Sidebar Change

New group inserted between "Suffix Reference" and "Operator Deep Dives":

```typescript
{
  text: 'Decision Trees',
  items: [
    { text: 'Higher-Order / Flattening', link: '/decisions/flattening' },
    { text: 'Windowing & Buffering',     link: '/decisions/windowing-buffering' },
    { text: 'Rate Limiting',             link: '/decisions/rate-limiting' },
    { text: 'Transformation',            link: '/decisions/transformation' },
    { text: 'Filtering',                 link: '/decisions/filtering' },
    { text: 'Combination',               link: '/decisions/combination' },
    { text: 'Creation',                  link: '/decisions/creation' },
    { text: 'Multicasting & Sharing',    link: '/decisions/multicasting' },
    { text: 'Error Handling & Recovery', link: '/decisions/error-handling' },
    { text: 'Side Effects',              link: '/decisions/side-effects' },
    { text: 'Notification Objects',      link: '/decisions/notification' },
    { text: 'Scheduling & Timing',       link: '/decisions/scheduling-timing' },
  ],
},
```

---

## Mermaid Conventions

Consistent across all 12 pages:

| Element | Mermaid shape | Meaning |
|---|---|---|
| Question | `{text}` diamond | A yes/no or choice branch |
| Intermediate label | `[text]` rectangle | Clarifying sub-question context |
| Terminal recommendation | `([operatorName])` stadium | The operator to use |
| `click` directive | on every terminal | Link to `/operators/<name>` |

### Colour coding via `classDef`

Every page includes:
```
classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

Every terminal node gets `:::terminal`.

### `click` format

```
click switchMap "/operators/switchMap" "switchMap — deep dive"
```

---

## Decision Logic Per Category

### Flattening (3 questions, 4 leaves)

```
Q1: Cancel previous inner when new value arrives?
  Yes → switchMap
  No →
    Q2: Ignore new values while inner is active?
      Yes → exhaustMap
      No →
        Q3: Must inner Observables complete in source order?
          Yes → concatMap
          No  → mergeMap
```

### Windowing & Buffering (2 questions, 4 leaves)

```
Q1: Should the group be emitted as an array or as an Observable?
  Array →
    Q2: Boundary trigger?
      Count → bufferCount
      Time  → bufferTime
      Event → bufferWhen / bufferToggle
  Observable →
    Q2: Boundary trigger?
      Count → windowCount
      Time  → windowTime
      Event → windowWhen / windowToggle
```

### Rate Limiting (3 questions, 4 leaves)

```
Q1: Which edge of the burst should emit?
  Leading (first value) → throttle / throttleTime
  Trailing (last value) →
    Q2: Must source be silent for the full window?
      Yes → debounce / debounceTime
      No  →
        Q3: What triggers the emission?
          End of fixed window → audit / auditTime
          External notifier   → sample / sampleTime
```

### Transformation (3 questions, 5 leaves)

```
Q1: One value in → one value out (no state)?
  Yes →
    Q2: Map to a constant?
      Yes → mapTo
      No  → map
  No →
    Q2: Need to carry accumulated state?
      Yes → scan
      No  →
        Q3: What shape change?
          Recursive projection → expand
          Consecutive pairs    → pairwise
          Split by key         → groupBy
```

### Filtering (5 questions, 10 leaves — 2 diagrams)

**Diagram 1 — by position / count:**
```
Q1: Do you know the exact index?
  Yes → elementAt
  No  →
    Q2: Skip or take?
      Skip →
        Q3: Boundary condition?
          Count       → skip
          Predicate   → skipWhile
          Notifier    → skipUntil
          From end    → skipLast
      Take →
        Q3: Boundary condition?
          Count       → take
          Predicate   → takeWhile
          Notifier    → takeUntil
          From end    → takeLast
```

**Diagram 2 — by value / predicate:**
```
Q1: Suppress duplicates?
  Yes →
    Q2: Compare full value or one key?
      Full value → distinctUntilChanged
      One key    → distinctUntilKeyChanged
  No →
    Q2: How many results do you want?
      First match  → first / find
      Index of first match → findIndex
      Last match   → last
      Exactly one  → single
      All matching → filter
    Q3 (for first/find): Need the index not the value?
      Yes → findIndex
      No  → first / find
    Q4: Source must not be empty?
      Emit default → defaultIfEmpty
      Error        → throwIfEmpty
```

### Combination (4 questions, 6 leaves)

```
Q1: Must all sources complete before emitting?
  Yes →
    Q2: Pair values by position (1st with 1st, 2nd with 2nd)?
      Yes → zip / zipAll / zipWith
      No  → forkJoin
  No →
    Q2: Which source drives the emission timing?
      Any source emits → combineLatest / combineLatestWith
      Primary source only →
        Q3: Attach latest value from secondary?
          Yes → withLatestFrom
          No  →
            Q4: First source to emit wins?
              Yes → race / raceWith
              No  → merge (see Flattening)
```

### Creation (4 questions, 7 leaves)

```
Q1: Adapting an existing value / structure?
  Yes →
    Q2: What is the source?
      Promise / array / iterable → from
      DOM or Node event          → fromEvent
      Custom add/remove handler  → fromEventPattern
      Fetch API call             → fromFetch
  No →
    Q2: Time-based?
      Yes →
        Q3: Emit once after delay or repeatedly?
          Once      → timer
          Repeated  → interval
      No →
        Q3: Fixed list of values?
          Yes → of
          Q4: Consecutive integers?
            Yes → range
            No  → defer (factory per subscription) / generate (loop-based)
```

### Multicasting & Sharing (2 questions, 4 leaves)

```
Q1: Need explicit connect() control? (legacy publish pattern)
  Yes →
    Q2: Which Subject variant internally?
      BehaviorSubject → publishBehavior
      AsyncSubject    → publishLast
      ReplaySubject   → publishReplay
  No →
    Q2: Replay buffered values to late subscribers?
      Yes → shareReplay
      No  → share
```

### Error Handling & Recovery (3 questions, 5 leaves)

```
Q1: Triggered by error or by completion?
  Error →
    Q2: Re-subscribe to the source?
      Yes → retry
      No  →
        Q3: Replace with a fallback stream?
          Yes → catchError
          No  → re-throw inside catchError
  Completion →
    Q2: Re-subscribe automatically?
      Yes → repeat
      No  → (no operator needed — source completed normally)
    Q3: Delay or condition on re-subscribe?
      Yes → repeatWhen (deprecated → repeat({ delay }))
      No  → repeat(count)
```

### Side Effects (1 question, 2 leaves)

```
Q1: When does the side effect run?
  On each emitted value          → tap
  On termination (any exit path) → finalize
```

### Notification Objects (1 question, 2 leaves)

```
Q1: Direction of conversion?
  Notifications → value objects → materialize
  Value objects → notifications → dematerialize
```

### Scheduling & Timing (3 questions, 6 leaves)

```
Q1: Creating a new time-based Observable (no source)?
  Yes →
    Q2: Emit once or repeatedly?
      Once after delay → timer
      Repeatedly       → interval
  No →
    Q2: Adding delay to existing stream?
      Yes →
        Q3: Fixed offset or per-value?
          Fixed  → delay
          Per-value → delayWhen
      No →
        Q3: What do you need?
          Move notification delivery context → observeOn
          Move subscription context          → subscribeOn
          Add elapsed-time metadata          → timeInterval
          Add wall-clock timestamp           → timestamp
          Error if source goes silent        → timeout
```

---

## Cross-link Pattern

**In each `docs/categories/*.md`** — add at the top (after the intro paragraph):

```markdown
> Not sure which operator to use? [Decision tree →](../decisions/<slug>)
```

**In each `docs/decisions/*.md`** — add at the bottom:

```markdown
---
→ [Category reference](../categories/<slug>) · [All decision trees](../decisions/)
```

A `docs/decisions/index.md` overview page is also created, listing all 12 trees with one-line descriptions. This is the landing target for "All decision trees" links and the sidebar section title link.

---

## Out of Scope

- No JavaScript interactivity — static Mermaid only
- No changes to the operator deep-dive pages
- No changes to `docs/rxjs-operator-name-suffixes.md` (the legacy single-page reference)
