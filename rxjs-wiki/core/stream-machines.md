---
title: "Stream Machine Calculus — A Minimal Model for RxJS Operators"
category: core
tags: [core, mental-model, operators, classification, stream-machines, calculus]
related: [operators.md, combination-operators.md, operator-policies.md, frp-concepts.md, execution-phases.md]
sources: 1
updated: 2026-04-08
---

# Stream Machine Calculus — A Minimal Model for RxJS Operators

> All RxJS operators reduce to 6 irreducible stream machines. Two vocabulary layers: a **teaching DSL** for explaining behaviour, and a **runtime semantics DSL** for analysing execution.

## The Guiding Idea

The domain can change. The stream machines stay the same.

Every RxJS operator — regardless of domain, use case, or naming convention — is an instance of one of six fundamental machines. Learning the machines means learning the operator space once, permanently.

## Two Vocabulary Layers

| Layer | Purpose | Example names |
|-------|---------|--------------|
| **Teaching** | Explain intent — what the operator *does* in human terms | `when`, `evolve`, `forEach` |
| **Runtime semantics** | Analyse execution — trigger, memory, first-emission rule | `sampleOn`, `reduceState`, `flattenWithPolicy` |

Both layers name the same machines. Use the teaching layer when explaining code to others. Use the runtime layer when debugging or reasoning about edge cases.

---

## The 6 Irreducible Machines

### 1. `sampleOn` — Read current value when something happens

**Teaching name:** `when(behavior)`

**Core question:** When this happens, what is the current value *there*?

**Causal structure:**
- One privileged **trigger** drives time
- A second stream provides **remembered context**
- Output = trigger + sampled context

**Runtime rules:**
- Trigger fires → read latest value from context
- Context changes between triggers → silently overwritten; intermediate values lost
- First emission: both trigger AND context must have emitted at least once

**RxJS operators:**

| Operator | Role of streams |
|----------|----------------|
| `withLatestFrom(other$)` | source = trigger; other$ = context |
| `sample(notifier$)` | notifier = trigger; source = context (roles swapped) |
| `pairwise()` | source = trigger; previous source value = context |
| `distinctUntilChanged()` | source = trigger; last emitted = context (drop if equal) |

**One-line reads:**
- `withLatestFrom` → source fires, read the current value over there
- `sample` → clock fires, read the current source value
- `pairwise` → new value arrives, pair it with the previous
- `distinctUntilChanged` → new value arrives, compare with last emitted

**Key distinction:** `sampleOn` is **asymmetric** — the source drives time; the other stream only provides context. This is the defining difference from `recomputeLatest`.

---

### 2. `recomputeLatest` — Recompute whenever any input changes

**Teaching name:** `wheneverAny(inputs...)`

**Core question:** Whenever anything changes, what is the latest derived value now?

**Causal structure:**
- All inputs are **symmetric** — any can trigger
- All inputs provide **remembered latest values**
- Output = recomputed from the current latest of every input

**Runtime rules:**
- Any input fires → update its remembered latest; recompute output from all latests
- Older per-input history is silently overwritten by newer latest values
- First emission: every required input must have emitted at least once

**RxJS operators:** `combineLatest`, `combineLatestWith`

**Key distinction:** `recomputeLatest` is **symmetric** — no single input is privileged. This is the defining difference from `sampleOn`. Use `recomputeLatest`/`combineLatest` for derived state; use `sampleOn`/`withLatestFrom` for event+context reads.

---

### 3. `reduceState` — Evolve remembered state over time

**Teaching name:** `evolve(reducer, seed)`

**Core question:** Given current state and this event, what is the next state?

**Causal structure:**
- **Events** drive time (the source)
- **Current state** is remembered between events
- Each event → `reducer(currentState, event)` → new state → remember → emit

**Runtime rules:**
- Source fires → compute `nextState = reducer(currentState, event)` → store → emit
- Seed provides initial state before any event arrives
- No values dropped — every event contributes to state in order
- First emission: requires seed or initial state source

**RxJS operators:** `scan` (followed by `startWith(seed)` + `shareReplay(1)` for shared state)

**Key distinction from `sampleOn`:**
- `sampleOn` **reads** current context
- `reduceState` **changes** current state — it introduces feedback memory

**Practical form:**
```typescript
const state$ = events$.pipe(
	scan(reducer, seed),
	startWith(seed),
	shareReplay(1),
);
```

---

### 4. `flattenWithPolicy` — Start inner work; choose overlap rule

**Teaching name:** `forEach(project, policy)`

**Core question:** When new work starts before old work finishes, what is the overlap rule?

**Causal structure:**
- **Outer source** fires → project event into an inner Observable
- Inner Observable does the actual work (HTTP, timer, etc.)
- **Policy** decides what happens if new outer events arrive while inner is still active

**The 4 policies:**

| Policy | Teaching name | What happens when new outer event arrives |
|--------|--------------|------------------------------------------|
| `merge` | `forEach(project, 'merge')` | Allow overlap — all active inners run concurrently |
| `switch` | `forEach(project, 'switch')` | Cancel previous inner — only latest matters |
| `concat` | `forEach(project, 'concat')` | Queue new inner — run one at a time in order |
| `exhaust` | `forEach(project, 'exhaust')` | Ignore while busy — drop new until current completes |

**Memory required:**
- `merge` → set of all active inner subscriptions
- `switch` → current active inner only
- `concat` → current inner + queue of pending inners
- `exhaust` → busy flag + current inner

**First emission rule:** outer must emit → inner must emit → output arrives

**One-line causal sentences:**
- `mergeMap` → each event starts work, and all work may overlap
- `switchMap` → each event starts work, and only the latest work matters
- `concatMap` → each event starts work, but work runs one at a time in order
- `exhaustMap` → each event tries to start work, but busy work blocks new work

**Key distinction from `reduceState`:**
- `reduceState` (`scan`) stays **first-order** and updates state
- `flattenWithPolicy` starts **inner Observables** — higher-order execution policy

---

### 5. `composeTopology` — Arrange multiple sources structurally

**Teaching name:** `composeMany(sources, topology)`

**Core question:** How do multiple sources coexist structurally?

**Topologies:**

| Topology | Teaching name | Meaning |
|----------|--------------|---------|
| `merge` | `either(a$, b$)` | Forward values from any source, interleaved |
| `concat` | `then(a$, b$)` | Run b$ only after a$ completes |
| `zip` | `togetherByIndex(a$, b$)` | Align nth value from each source |
| `race` | `firstToWin(a$, b$)` | First source to emit wins; others unsubscribed |
| `forkJoin` | `onceAllComplete(a$, b$)` | Emit last value from each only when all complete |

**Memory required:**
- `merge` — none (just forward)
- `concat` — source ordering / current source index
- `zip` — per-input queues (backpressure risk)
- `race` — first-emission state
- `forkJoin` — last value from each source

**Key distinction from `flattenWithPolicy`:**
- `composeTopology` is about **structural coexistence** of sources — not about starting inner work per event
- `flattenWithPolicy` is about **per-event inner work** — a new inner is spawned for each outer event

---

### 6. `shareExecution` — Control subscription topology and replay memory

**Teaching name:** `shareExecution(source, memory)`

**Core question:** Does each subscriber get a fresh execution, or do they share one? And what past values are remembered?

**Two dimensions:**
- **Execution sharing** — unicast (fresh per subscriber) vs multicast (shared)
- **Replay memory** — how many past values does a new subscriber receive?

| Operator | Execution | Memory |
|----------|-----------|--------|
| `share()` | Shared (multicast) | None — late subscribers get nothing |
| `shareReplay(1)` | Shared (multicast) | Last 1 value — late subscribers get current |
| `shareReplay({ refCount: false })` | Permanent (never stops) | Last n — even after all unsubscribe |
| `BehaviorSubject` | Shared | Current value — always has one |

**Runtime rule:** First subscriber starts shared execution. Subsequent subscribers join. Last subscriber unsubscribes → execution stops (if `refCount: true`).

**Why this is its own machine:** Changing from unicast to multicast changes the **entire runtime graph** — from per-subscriber independent execution to a single shared execution tree. This is a topology change at the subscription level.

---

## Derived Machines (Not Irreducible)

These are important — but they are specialisations of the 6 core machines:

| Derived machine | Teaching name | Derived from |
|----------------|--------------|-------------|
| `gate(condition)` | `filter`, `skipUntil`, `takeUntil` | `sampleOn` + boolean pass/block rule |
| `shapeTime(policy)` | `debounceTime`, `throttleTime`, `delay` | Derived timing policies (timer sources + pending memory) |

**Gate** — values may pass only under this condition:
```typescript
// gate = sampleOn + boolean memory
source$.pipe(filter(x => x > 0))        // value predicate gate
source$.pipe(takeUntil(destroy$))        // lifecycle gate
source$.pipe(skipUntil(started$))        // open/close gate
```

**shapeTime** — keep the values, change the timing rule:
```typescript
source$.pipe(debounceTime(300))   // wait for silence before emitting latest
source$.pipe(throttleTime(100))   // emit first, then ignore for a period
source$.pipe(auditTime(100))      // emit latest at window end
source$.pipe(delay(500))          // same values, later timestamps
```

---

## Fast Classification Test

To place any operator, ask in this order:

1. **Is it mainly about reading current remembered context when something happens?** → `sampleOn`
2. **Is it mainly about recomputing from the latest of multiple dependencies?** → `recomputeLatest`
3. **Is it mainly about updating state over time?** → `reduceState`
4. **Is it mainly about starting inner work and choosing an overlap policy?** → `flattenWithPolicy`
5. **Is it mainly about how multiple sources coexist structurally?** → `composeTopology`
6. **Is it mainly about allowing or blocking values?** → `gate` (derived from `sampleOn`)
7. **Is it mainly about changing timing without changing core value meaning?** → `shapeTime` (derived)
8. **Is it mainly about shared vs fresh execution per subscriber?** → `shareExecution`

---

## Complete Operator → Machine Map

| RxJS operator | Teaching machine | Runtime machine | Trigger | Memory | Pressure policy |
|---------------|-----------------|----------------|---------|--------|----------------|
| `withLatestFrom` | `when(...)` | `sampleOn` | source | latest other | keep latest context only |
| `sample` | `at(clock, value)` | `sampleOn` (roles swapped) | notifier | latest source | intermediate source values overwritten |
| `pairwise` | — | `sampleOn` + prev memory | source | previous value | first value held as memory |
| `distinctUntilChanged` | — | `sampleOn` + prev memory | source | last emitted | equal values dropped |
| `combineLatest` | `wheneverAny(...)` | `recomputeLatest` | any input | latest of all | older per-input history overwritten |
| `filter` | `gate(...)` | derived pass/block | source | predicate | failing values dropped |
| `skipUntil` | `after(start$)` | derived lifecycle gate | source (after open) | open state | pre-open values dropped |
| `takeUntil` | `until(stop$)` | derived lifecycle gate | source (until close) | closed state | post-stop values dropped |
| `debounceTime` | `afterQuiet(ms)` | derived shapeTime | source + silence | latest pending | earlier pending replaced |
| `throttleTime` | `firstThenPause(ms)` | derived shapeTime | source + window | busy window | values during window dropped |
| `auditTime` | `lastAtWindowEnd(ms)` | derived shapeTime | source + window end | latest in window | intermediate values replaced |
| `delay` | `laterBy(ms)` | derived shapeTime | source | pending delayed values | none |
| `scan` | `evolve(reducer, seed)` | `reduceState` | source | current state | none |
| `mergeMap` | `forEach(..., 'merge')` | `flattenWithPolicy('merge')` | source starts inner | active inners | overlap allowed |
| `switchMap` | `forEach(..., 'switch')` | `flattenWithPolicy('switch')` | source starts inner | current inner | previous inner cancelled |
| `concatMap` | `forEach(..., 'concat')` | `flattenWithPolicy('concat')` | source starts inner | current inner + queue | later work queued |
| `exhaustMap` | `forEach(..., 'exhaust')` | `flattenWithPolicy('exhaust')` | source starts inner | busy flag | new work while busy dropped |
| `merge` | `either(...)` | `composeTopology('merge')` | any input | none | all forwarded |
| `concat` | `then(...)` | `composeTopology('concat')` | current source | ordering | later sources queued |
| `zip` | `togetherByIndex(...)` | `composeTopology('zip')` | joint availability | per-input queues | queued until partners arrive |
| `race` | `firstToWin(...)` | `composeTopology('race')` | first source | first-emission state | losers unsubscribed |
| `forkJoin` | `onceAllComplete(...)` | `composeTopology('forkJoin')` | all complete | last value each | intermediate values dropped |
| `share` | `shareWhileObserved()` | `shareExecution(no memory)` | subscriptions | subscriber count | none |
| `shareReplay` | `rememberLatest(n)` | `shareExecution(buffer n)` | subscriptions | replay buffer | oldest beyond buffer dropped |

---

## 8 Classification Axes

For deep analysis of any operator, classify along these axes:

| Axis | Question |
|------|---------|
| **Trigger** | Who drives time? One privileged source? Any input? Timer? Subscriber join? |
| **Memory** | What is retained between emissions? Latest context? Accumulated state? Active inners? |
| **Higher-order depth** | Are values plain, or do they start inner Observables? |
| **Topology/ordering** | Interleaved? Sequential? By index? Raced? |
| **Lossiness** | Can values be dropped, replaced, queued, or delayed? |
| **Initial emission condition** | What must already have happened before the first output? |
| **Sharing** | Does each subscriber get fresh execution or a shared one? |
| **Completion/teardown** | What event shuts down the machine? |

**Recommended classification order:**
1. Trigger
2. Memory
3. Higher-order depth
4. Topology / ordering
5. Lossiness / replacement / queueing
6. Initial emission condition
7. Sharing
8. Completion / teardown

---

## Strongest Distinctions

**`sampleOn` vs `recomputeLatest`:**
- `sampleOn` — asymmetric; one stream drives time, the other is passive context
- `recomputeLatest` — symmetric; any input can trigger recomputation

**`gate` vs `shapeTime`:**
- `gate` — decides **whether** a value may pass (boolean)
- `shapeTime` — decides **when** a value may appear (timing policy)

**`sampleOn` vs `reduceState`:**
- `sampleOn` reads current context without changing it
- `reduceState` changes state — introduces feedback memory

**`flattenWithPolicy` vs `reduceState`:**
- `reduceState` (`scan`) stays first-order; values accumulate into state
- `flattenWithPolicy` starts inner Observables; requires an overlap policy

---

## Cheat Sheet

```
Teaching layer          Runtime layer              Core question
─────────────────────────────────────────────────────────────────────
when(behavior)          sampleOn(trigger, memory)  When this fires, what is the current value there?
wheneverAny(inputs)     recomputeLatest(inputs)    Whenever any input changes, what is the latest derived value?
evolve(reducer, seed)   reduceState(events,r,seed) Given current state + event, what is the next state?
forEach(project,policy) flattenWithPolicy(p,policy) New work before old finishes — overlap rule?
composeMany(topology)   composeTopology(s,topology) How do multiple sources coexist structurally?
shareExecution(memory)  shareExecution(src,memory)  Fresh execution per subscriber, or shared?
```

---

## Related

- [operators](operators.md) — full operator reference; decision tree by use case
- [higher-order-operators](higher-order-operators.md) — deep dive on all four flattening operators: marble diagrams, memory leaks, error handling, expand
- [combination-operators](combination-operators.md) — `composeTopology` machine in depth
- [operator-policies](operator-policies.md) — Eight-Policy Framework: orthogonal formal specification
- [frp-concepts](frp-concepts.md) — FRP foundations: Behavior (`recomputeLatest` semantics) vs Event (`sampleOn` semantics)
- [execution-phases](execution-phases.md) — plan phase vs execution phase; when machines activate
