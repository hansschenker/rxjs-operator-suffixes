---
marp: true
theme: uncover
title: "Stream machines: the 6 irreducible building blocks"
---

# Stream machines: the 6 irreducible building blocks
> Memorising 60+ RxJS operators one by one doesn't scale — this lesson gives you the 6 machines they all reduce to, so you classify any operator instantly and permanently.

---

## Core Concept

- Every RxJS operator is an instance of exactly one of **6 irreducible stream machines** — `sampleOn`, `recomputeLatest`, `reduceState`, `flattenWithPolicy`, `composeTopology`, `shareExecution`
- Each machine has a unique answer to three questions: *who drives time*, *what is remembered*, and *can values be dropped*
- Two vocabulary layers: a **teaching DSL** (`when`, `evolve`, `forEach`) for explaining intent; a **runtime DSL** (`sampleOn`, `reduceState`, `flattenWithPolicy`) for debugging execution
- `filter`, `debounceTime`, and `takeUntil` are **derived** machines — specialisations of `sampleOn`, not irreducible on their own
- > **"The domain can change. The stream machines stay the same."**

---

## How It Works

```
Machine            Teaching name         Core question
────────────────────────────────────────────────────────────────────
sampleOn           when(behavior)        When this fires, what is the current value there?
recomputeLatest    wheneverAny(inputs)   Whenever any input changes, what is the latest?
reduceState        evolve(r, seed)       Given state + event, what is the next state?
flattenWithPolicy  forEach(p, policy)    New work before old finishes — overlap rule?
composeTopology    composeMany(srcs)     How do multiple sources coexist structurally?
shareExecution     shareExecution(mem)   Fresh execution per subscriber, or shared?

Fast classification — ask in order:
  asymmetric trigger + passive context?  →  sampleOn        (withLatestFrom, sample)
  any input triggers recomputation?      →  recomputeLatest (combineLatest)
  feedback memory + accumulation?        →  reduceState     (scan)
  per-event inner Observable + policy?   →  flattenWithPolicy (switchMap, exhaustMap…)
  structural coexistence of sources?     →  composeTopology (merge, zip, forkJoin…)
  unicast vs multicast + replay buffer?  →  shareExecution  (share, shareReplay)
```

---

## Common Mistake

```typescript
// ❌ Wrong machine: using recomputeLatest where sampleOn is needed.
// combineLatest is SYMMETRIC — it fires whenever state$ changes too.
// This re-runs the save on every keypress, not only on button click.
const save$ = combineLatest([saveClick$, formState$]).pipe(
  switchMap(([, state]) => api.save(state))
)

// ❌ Wrong policy: using flattenWithPolicy('merge') for a form submit.
// mergeMap allows ALL inners to overlap — a double-click fires two
// concurrent POST requests and the UI enters an indeterminate state.
const submit$ = submitClick$.pipe(
  mergeMap(() => api.submitForm(currentFormValue()))
)
```

---

## The Right Way

```typescript
// ✅ sampleOn: saveClick$ is the trigger; formState$ is passive context.
// withLatestFrom reads the latest state only when the click arrives.
const save$ = saveClick$.pipe(
  withLatestFrom(formState$),                   // asymmetric — click drives time
  switchMap(([, state]) => api.save(state))     // one save at a time
)

// ✅ flattenWithPolicy('exhaust'): busy work blocks new outer events.
// exhaustMap enforces "ignore while busy" — the correct overlap rule for submit.
const submit$ = submitClick$.pipe(
  exhaustMap(() => api.submitForm(currentFormValue()))  // drop clicks while in-flight
)

// ✅ reduceState + shareExecution: the standard MVU state pipeline.
const state$ = action$.pipe(
  scan(reducer, initialState),   // reduceState — feedback memory
  startWith(initialState),
  shareReplay(1)                 // shareExecution(buffer: 1) — shared + replay current
)
```

---

## Key Rule

> **Before reaching for an operator name, identify which of the 6 machines it belongs to — the machine tells you the trigger, the memory, and the lossiness; the operator is just one specialisation of that machine.**