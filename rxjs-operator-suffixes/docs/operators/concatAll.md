---
operator: concatAll
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `concatAll<T>()`

> Subscribes to inner Observables emitted by the source one at a time in order — each inner must complete before the next one is subscribed to — the higher-order counterpart of `concat`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — ordering is defined by subscription sequence, not by when values arrive |
| **Value-sensitive** | No — does not inspect the content of inner emissions |
| **Lossy** | No — all inner Observables are queued and eventually subscribed to; no values are dropped |
| **Completion required** | No — the outer source does not need to complete for `concatAll` to start emitting; however each inner must complete before the next inner is subscribed |

**Completion behaviour** — `concatAll` buffers inner Observables as the outer emits them and subscribes to them one at a time in arrival order. The output does not complete until the outer source completes AND the last queued inner completes. If any inner never completes, all subsequently queued inners are blocked indefinitely.

**Lossy behaviour** — not lossy. Every inner Observable emitted by the outer is queued and will eventually be subscribed to. No inners are dropped.

---

#### Marble Diagram

```
outer:    --[a$]-----[b$]-----[c$]--|
inner a$: ---1--2--|
inner b$:            ---3--4--|
inner c$:                       ---5--|
          concatAll()
output:   ----1--2-----3--4-----5--|
```

Note that `b$` does not start until `a$` completes, even though the outer emitted `b$` earlier.

---

#### Signature

```typescript
concatAll<O extends ObservableInput<unknown>>(): OperatorFunction<O, ObservedValueOf<O>>
```

---

#### When to Use

- Flatten a higher-order Observable when each inner must fully complete before the next begins.
- Process a queue of async tasks in strict order (e.g. a series of animations, upload steps, or ordered API calls).
- Use explicitly when you want `concatMap` semantics but the projection is already done upstream.

---

#### Code Example

```typescript
import { of, interval } from 'rxjs'
import { map, concatAll, take } from 'rxjs/operators'

// Run three timer sequences one after another
const sequences$ = of(3, 2, 1).pipe(
	map((count: number) =>
		interval(500).pipe(
			take(count),
			map((i: number) => `seq-${count}: tick ${i}`)
		)
	)
)

// concatAll subscribes to each inner only after the previous completes
sequences$.pipe(concatAll()).subscribe((msg: string) => console.log(msg))
// seq-3: tick 0
// seq-3: tick 1
// seq-3: tick 2
// seq-2: tick 0  ← starts only after seq-3 finishes
// ...
```

---

#### Gotchas

1. **`concatAll` = `concatMap(x => x)`** — `concatMap` is the idiomatic shorthand. Use `concatAll` only when you already have a higher-order Observable and do not need an explicit projection.

2. **Blocking inner stalls the entire queue** — if any inner Observable never completes, all subsequent inners in the queue are never subscribed to. This is the same pitfall as `concat` but harder to spot since the inner is produced dynamically.

3. **Inner Observables are buffered, not dropped** — unlike `switchAll` or `exhaustAll`, every inner emitted by the outer is kept in an internal queue. If the outer emits many inners faster than they complete, memory usage grows proportionally.

4. **Outer completion does not flush immediately** — the outer can complete, but `concatAll` will still work through all queued inners before completing itself.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `concatMap` | Combined project + flatten in one step | You have a plain value to project to an Observable |
| `mergeAll` | Subscribes to all inners concurrently | Order does not matter; you want parallel execution |
| `switchAll` | Unsubscribes from the previous inner when a new one arrives | You only care about the latest inner |
| `exhaustAll` | Ignores new inners while one is active | You want to prevent overlapping inner subscriptions |

---

#### Decision Rule

> Use `concatAll` when you already hold a higher-order Observable and need **all inners to execute sequentially** in order. Prefer `concatMap` when you can project and flatten in one step.
