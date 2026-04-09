---
title: "Combination Operators — Complete Reference"
category: core
tags: [core, operators, combination, combineLatest, concat, forkJoin, merge, zip, race, withLatestFrom, pairwise, startWith]
related: [operators.md, combine-latest.md, hot-cold.md, ../patterns/state-management.md]
sources: 1
updated: 2026-04-08
---

# Combination Operators — Complete Reference

> Combination operators work with multiple Observables. The choice depends on three questions: *When do you want output? What triggers an emission? When should it complete?*

## Quick Decision Tree

```
Do you need output as values arrive?
├── From any source, after all emitted once  → combineLatest
├── Only when primary source emits           → withLatestFrom
├── As values arrive, no sync required       → merge
└── Sequential (one at a time)               → concat

Do you need output only at the end?
├── All final values when all complete       → forkJoin
└── One last value (first-to-complete wins)  → race (sort of)

Do you need pairing by index?
└── nth from each source together            → zip

Do you need to process consecutive pairs?
└── [prev, curr] per emission                → pairwise
```

## combineLatest — Derive State from Multiple Streams

See [combine-latest](combine-latest.md) for the formal rules. In brief:

```typescript
combineLatest([a$, b$, c$]).subscribe(([a, b, c]) => render(a, b, c));
```

- Waits for all sources to emit at least once
- Emits when **any** source emits, using latest from others
- Completes when **all** sources complete
- Memory: O(n) — one slot per source

**Best for:** Combined state — UI state that depends on multiple independent streams.

## concat — Sequential, One at a Time

Subscribes to sources in order. Next source only starts when previous **completes**.

```typescript
import { concat, of, timer } from 'rxjs';
import { mapTo } from 'rxjs/operators';

// Sequential animations
concat(
	moveToPosition(100),  // waits for this to complete
	fadeIn(),             // then starts
	showLabel(),          // then starts
).subscribe(render);
```

**Marble:**
```
source1: --a--b--|
source2:          --c--d--|
concat:  --a--b----c--d--|
```

**Warning:** If any source never completes, all subsequent sources are blocked forever.

**Best for:** Sequential operations where order matters — wizard steps, ordered animations, database migrations.

## forkJoin — Parallel → Wait for All

Runs all sources in parallel. Emits **once** when all complete, with the last value from each.

```typescript
import { forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// Parallel HTTP, emit when all done
forkJoin({
	user:    ajax.getJSON('/api/user'),
	config:  ajax.getJSON('/api/config'),
	perms:   ajax.getJSON('/api/permissions'),
}).subscribe(({ user, config, perms }) => bootstrap(user, config, perms));
```

**Marble:**
```
user$:   ──────────────U|
config$: ────────C|
perms$:  ──────────────────P|
forkJoin:                    [U,C,P]|
```

**Key rules:**
- If any source **never completes** → `forkJoin` never emits
- If any source **errors** → `forkJoin` errors immediately
- Only the **last** value from each source is used — intermediate values are ignored

**forkJoin ≈ Promise.all**. If you want intermediate values too, use `combineLatest`.

**Best for:** Loading screen — fetch all required data before rendering. Batch operations where all must succeed.

## merge — Parallel, Interleaved

Subscribes to all sources simultaneously. Emits values as they arrive, from any source.

```typescript
import { merge, fromEvent } from 'rxjs';

// Multiple event sources — handle all in one stream
const interactions$ = merge(
	fromEvent(btn, 'click').pipe(mapTo('click')),
	fromEvent(doc, 'keydown').pipe(map(e => e.key)),
	socket$.pipe(map(msg => msg.type)),
);
```

**Marble:**
```
source1: --a-----c--|
source2: ----b------d--|
merge:   --a-b---c--d--|
```

**Warning:** An error in any source terminates the entire merge. Catch errors inside each source.

**Optional concurrency limit:** `merge(a$, b$, c$, 2)` — max 2 concurrent subscriptions.

**Best for:** Multiple event sources, parallel WebSocket connections, real-time dashboards.

## race — First to Emit Wins

Subscribes to all sources simultaneously. The first source to emit **wins** — all others are immediately unsubscribed.

```typescript
import { race, timer, fromEvent } from 'rxjs';

// Timeout pattern — user or timer, whoever fires first
race(
	fromEvent(document, 'click').pipe(mapTo('user clicked')),
	timer(5000).pipe(mapTo('timed out')),
).subscribe(result => console.log(result));
```

**Marble:**
```
source1: ──────────a─► (arrives late, gets unsubscribed)
source2: ────b──────►  (first to emit — wins)
race:    ────b──────►
```

**Winner is determined by first emission, not first subscription** — all sources subscribe simultaneously.

**If the first to emit errors** → race errors; slower sources are disposed.

**Best for:** Timeout patterns, primary/fallback service, multi-tier cache (use fastest response), competitive loading.

## withLatestFrom — Enrich Events with Context

When the **source** emits, grab the latest value from secondary Observables (without subscribing to their changes).

```typescript
import { fromEvent } from 'rxjs';
import { withLatestFrom, map } from 'rxjs/operators';

// On submit, grab current form state — but don't react to form state changes
submitBtn$.pipe(
	withLatestFrom(formState$, authToken$),
	map(([_, form, token]) => submitWithAuth(form, token)),
).subscribe(result$ => ...);
```

**Marble:**
```
source: ──────a──────b──────►
other:  ──────────X──────Y──►
output: ──────[a,?]──[b,X]──►
        ↑                  ↑
     no emit: other    emits with
     hasn't emitted    latest value
```

**Key:** Does not emit until both **source AND other** have emitted at least once.

**withLatestFrom vs combineLatest:**

| | `withLatestFrom` | `combineLatest` |
|--|-----------------|-----------------|
| Trigger | Source only | Any source |
| Secondary | Sampled (not subscribed to changes) | Drives output |
| Use case | Enrich events with current state | Derived state |

**Best for:** User action + current app state, form submit + current field values, game input + player state.

## zip — Pair by Index

Pairs the **nth** value from each source together. Waits for all sources to emit at that index.

```typescript
import { zip, of } from 'rxjs';

// Match questions with answers by position
const questions$ = of('Q1', 'Q2', 'Q3');
const answers$   = of('A1', 'A2', 'A3');

zip([questions$, answers$]).subscribe(([q, a]) =>
	console.log(`${q}: ${a}`)
);
// Q1: A1, Q2: A2, Q3: A3
```

**Marble:**
```
source1: --1------2------3--|
source2: --------A------B--|
zip:     --------[1,A]--[2,B]--|
```

**Rate limiting with zip:**

```typescript
// zip with timer to rate-limit a fast stream to 1 per second
fastEmitter$.pipe(
	// Each value pairs with a 1s timer tick
).subscribe();

zip(fastEmitter$, interval(1000)).pipe(
	map(([value]) => value),
).subscribe(processSlowly);
```

**zip vs combineLatest:** `zip` pairs by index (nth with nth); `combineLatest` uses latest from each.

**Backpressure risk:** If one source is much faster, `zip` buffers its extra values. Memory grows.

**Best for:** Coordinated animations, paired data sets, rate-limiting a fast stream, index-based relationships.

## pairwise — Consecutive Pairs

Emits `[previousValue, currentValue]` on each emission after the second.

```typescript
import { fromEvent } from 'rxjs';
import { pairwise, map } from 'rxjs/operators';

// Scroll direction detection
fromEvent(window, 'scroll').pipe(
	map(e => window.scrollY),
	pairwise(),
	map(([prev, curr]) => curr > prev ? 'down' : 'up'),
).subscribe(dir => console.log(dir));
```

**Marble:**
```
source:   --a--b--c--d--|
pairwise: -----[a,b]--[b,c]--[c,d]--|
```

**Limitations:**
- First value is "lost" — no pair for it (`startWith(initialValue)` to include it)
- Empty or single-value streams emit nothing
- `pairwise()` ≡ `bufferCount(2, 1)` but more semantic

**Best for:** Change direction detection, deltas/diffs between values, scroll direction, acceleration/deceleration.

## startWith — Prepend Synchronous Values

Emits specified values immediately on subscription, then continues with source.

```typescript
import { BehaviorSubject, of } from 'rxjs';
import { startWith, scan } from 'rxjs/operators';

// Provide loading state before data arrives
data$.pipe(
	startWith(null),
	map(data => data === null ? { loading: true } : { loading: false, data }),
).subscribe(renderState);

// Initial state for scan
action$.pipe(
	startWith({ count: 0 }),
	scan(reducer),
).subscribe(renderState);
```

**startWith vs BehaviorSubject:**

| | `startWith` | `BehaviorSubject` |
|--|-------------|-------------------|
| State | Stateless — re-emits on each subscribe | Stateful — always has current value |
| Late subscriber | Gets initial value again | Gets *current* value |
| Mutable | No | Yes (`.next()`) |

**Best for:** Default values for UI, initial state for `scan`, ensuring at least one emission.

## Comparison Summary

| Operator | Emission trigger | Completes when | Memory | Use case |
|----------|-----------------|----------------|--------|---------|
| `combineLatest` | Any source (after sync) | All complete | O(n) | Derived state |
| `concat` | Sequential completion | All complete | O(1) | Sequential ops |
| `forkJoin` | All complete | All complete | O(n) | Parallel → wait all |
| `merge` | Any source | All complete | O(1) | Parallel merge |
| `race` | First source | First completes | O(1) | Timeout/fallback |
| `withLatestFrom` | Source only | Source completes | O(n) | Enrich events |
| `zip` | All at same index | Shortest completes | O(n×m) | Index pairing |
| `pairwise` | Source (from 2nd) | Source completes | O(1) | Consecutive diffs |
| `startWith` | Immediately on subscribe | Source completes | O(k) | Default/initial values |

## Related

- [combine-latest](combine-latest.md) — combineLatest formal rules (5 rules, EMPTY trap, cold trap)
- [operators](operators.md) — full operator reference with all families
- [state-management](../patterns/state-management.md) — combineLatest and withLatestFrom for state
- [marble-testing](../testing/marble-testing.md) — testing combination operators
