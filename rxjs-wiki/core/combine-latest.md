---
title: "combineLatest — Formal Rules"
category: core
tags: [core, operators, combineLatest, combination, synchronization, state, formal]
related: [operators.md, hot-cold.md, ../patterns/state-management.md, ../testing/marble-testing.md]
sources: 1
updated: 2026-04-08
---

# combineLatest — Formal Rules

> `combineLatest` synchronizes multiple streams by waiting for all to emit once, then producing a new array emission whenever any source emits — using the latest known value from each.

## The Five Formal Rules

### Rule 1 — Initial Synchronization

No output until **every** source has emitted at least one value.

```
∀i ∈ [1..n]: sourceᵢ must emit at least one value before combineLatest emits
```

```typescript
const a$ = new Subject<number>();
const b$ = new Subject<number>();

combineLatest([a$, b$]).subscribe(console.log);

a$.next(1); // silence — b$ hasn't emitted yet
b$.next(2); // → [1, 2]  — now both have emitted
a$.next(3); // → [3, 2]
```

**Marble:**
```
a$: ──1──────3───
b$: ─────2──────
out: ─────[1,2]─[3,2]─
```

### Rule 2 — Any-Source Trigger

After synchronization, **any** source emission triggers a new output:

```typescript
const a$ = interval(1000);
const b$ = of('static');

// b$ emits immediately; combineLatest waits for a$ to emit at t=1s
combineLatest([a$, b$]).subscribe(([n, s]) => console.log(n, s));
// t=1s: 0 'static'
// t=2s: 1 'static'
// t=3s: 2 'static'
```

### Rule 3 — Latest Value Retention

Each source retains exactly **one** current value. New emissions overwrite the previous:

```
Memory complexity: O(n) — one slot per source
```

| Time | a$ latest | b$ latest | c$ latest | Output |
|------|-----------|-----------|-----------|--------|
| After a$→1 | 1 | — | — | — |
| After b$→A | 1 | A | — | — |
| After c$→X | 1 | A | X | [1,A,X] |
| After a$→2 | **2** | A | X | [2,A,X] |
| After b$→B | 2 | **B** | X | [2,B,X] |

### Rule 4 — All-Complete Condition

`combineLatest` completes only when **all** sources have completed:

```
complete(combineLatest) = complete(source₁) ∧ complete(source₂) ∧ ... ∧ complete(sourceₙ)
```

```typescript
const a$ = of(1, 2, 3);            // completes immediately
const b$ = interval(1000).pipe(take(3)); // completes after 3s

// Result completes at t=3s when both are done
combineLatest([a$, b$]).subscribe(console.log);
// → [3, 0], [3, 1], [3, 2] then complete
```

A never-completing source keeps the output alive forever.

### Rule 5 — Error Propagation

If any source errors, `combineLatest` immediately errors and unsubscribes all sources:

```
If sourceᵢ emits error(e) then:
  1. combineLatest emits error(e)
  2. All other sources are unsubscribed
  3. combineLatest terminates
```

Always catch errors inside inner streams to prevent one failure from killing the combination:

```typescript
combineLatest([
	a$.pipe(catchError(() => EMPTY)),
	b$.pipe(catchError(() => EMPTY)),
]).subscribe(console.log);
```

## Edge Cases

### EMPTY is an absorptive element

`EMPTY` completes immediately without emitting. It never satisfies Rule 1 for its slot.

```typescript
combineLatest([of(1), EMPTY]).subscribe(console.log);
// → (nothing) — EMPTY never emits, initial sync never completes
// The result observable does complete (EMPTY completes, then of(1) completes)
// but emits nothing
```

### Cold Observable trap

If sources are cold Observables, each subscription to `combineLatest` triggers separate executions. Use `shareReplay(1)` or `BehaviorSubject` to share:

```typescript
// ✗ Each combineLatest subscription fires two HTTP requests
const data$ = ajax.getJSON('/api');
combineLatest([data$, config$]).subscribe(...);

// ✓ Share the single request
const data$ = ajax.getJSON('/api').pipe(shareReplay(1));
combineLatest([data$, config$]).subscribe(...);
```

### Late subscriber problem

If an Observable has already completed when `combineLatest` subscribes, it may never satisfy Rule 1 if it emitted nothing. Use `BehaviorSubject` for sources that always need a current value:

```typescript
// ✓ BehaviorSubject always has a current value — satisfies Rule 1 immediately
const userRole$ = new BehaviorSubject<Role>('guest');
combineLatest([data$, userRole$]).subscribe(...);
```

## Comparing combineLatest with Similar Operators

| | `combineLatest` | `zip` | `withLatestFrom` | `forkJoin` |
|--|-----------------|-------|------------------|------------|
| Emission trigger | Any source | All sources (paired) | Source only | On complete |
| Memory | Latest per source | Queue per source | Latest per other | Last per source |
| Completes | All complete | Shortest completes | Source completes | All complete |
| Use case | Derived state | Paired sequences | Sample on event | Parallel, wait all |
| Initial sync | Yes (all must emit once) | No (pairs 1st with 1st) | Yes (others must emit) | N/A |

## Choosing combineLatest

```
Do you need derived state from multiple streams?     → combineLatest
Do you need to react to changes in any source?       → combineLatest
Do you need paired emissions (1st with 1st)?         → zip
Do you need to sample others when source emits?      → withLatestFrom
Do you need the final value when all complete?       → forkJoin
```

## Mathematical Properties

- **Commutativity** (ordering of results): `combineLatest([a$, b$])` ≠ `combineLatest([b$, a$])` (order in array matches sources)
- **Associativity**: `combineLatest([combineLatest([a$, b$]), c$])` is equivalent but flattens differently
- **No identity element**: There is no Observable `I` such that `combineLatest([A, I])` behaves identically to `A`
- **Absorptive**: `combineLatest([A, EMPTY])` — never emits; does eventually complete

## Marble Testing

```typescript
import { TestScheduler } from 'rxjs/testing';

test('combineLatest waits for all to emit', () => {
	const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));
	scheduler.run(({ cold, expectObservable }) => {
		const a$ = cold('--a--b--', { a: 1, b: 2 });
		const b$ = cold('----c--', { c: 'x' });
		// a emits at 2, b emits at 4 → first combined at 4
		expectObservable(combineLatest([a$, b$])).toBe('----d--', {
			d: [1, 'x'],
		});
	});
});
```

## Related

- [operators](operators.md) — full combination operator reference
- [hot-cold](hot-cold.md) — cold observable trap and shareReplay solution
- [state-management](../patterns/state-management.md) — combineLatest for deriving UI state from multiple sources
- [marble-testing](../testing/marble-testing.md) — marble testing combineLatest
