---
operator: concatMapTo
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `concatMapTo<T>(innerObservable: ObservableInput<T>)` *(deprecated)*

> Projects every source value to the **same** static inner Observable (ignoring the source value) and subscribes to them one at a time in order — a fixed-target shorthand for `concatMap`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — subscribes in source order regardless of timing |
| **Value-sensitive** | No — the source value is completely ignored; all emissions map to the same inner Observable |
| **Lossy** | No — every source value queues a new inner subscription; nothing is dropped |
| **Completion required** | No — emits inner values as they arrive; each inner must complete before the next is subscribed |

**Completion behaviour** — identical to `concatMap`: queues inner Observables in source order and subscribes to them sequentially. Does not complete until the source completes and all queued inners complete.

**Lossy behaviour** — not lossy. Every source value queues the same inner Observable for sequential execution.

---

#### Marble Diagram

```
source:     --a--------b--------|
innerObs$:  ---1--2--|
            concatMapTo(innerObs$)
output:     ----1--2-----1--2---|
```

Each source emission queues a new subscription to `innerObs$`, starting only after the previous finishes.

---

#### Signature

```typescript
/** @deprecated Use concatMap(() => innerObservable) instead — will be removed in v8 */
concatMapTo<T, R, O extends ObservableInput<unknown>>(
	innerObservable: O
): OperatorFunction<T, ObservedValueOf<O>>
```

**RxJS 7 note:** `concatMapTo` is deprecated in RxJS 7 and will be removed in RxJS 8. The direct replacement is `concatMap(() => innerObservable)`.

---

#### When to Use

- **Avoid in new code** — prefer `concatMap(() => inner$)` which is equally concise and not deprecated.
- When migrating RxJS 6 codebases, identify and replace all `concatMapTo` calls during the upgrade.

---

#### Code Example

```typescript
// Deprecated — do not use in new code
import { fromEvent } from 'rxjs'
import { concatMapTo } from 'rxjs/operators'

const result$ = fromEvent(document.getElementById('btn')!, 'click').pipe(
	concatMapTo(runStep$())
)

// Preferred replacement
import { fromEvent } from 'rxjs'
import { concatMap } from 'rxjs/operators'

const result$ = fromEvent(document.getElementById('btn')!, 'click').pipe(
	concatMap(() => runStep$())
)
```

---

#### Gotchas

1. **Deprecated in RxJS 7, removed in RxJS 8** — do not use in new code. Migrate all existing uses to `concatMap(() => inner$)`.

2. **Cold Observable creates a new execution per source value** — if `innerObservable` is cold (e.g. an HTTP request), each source emission queues a separate independent execution of that Observable.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `concatMap` | Projects each source value to a (potentially different) inner Observable | New code — always prefer this |
| `mergeMapTo` | Also deprecated; maps to same inner but runs all concurrently | Avoid — use `mergeMap(() => inner$)` |
| `switchMapTo` | Also deprecated; maps to same inner but cancels the previous | Avoid — use `switchMap(() => inner$)` |

---

#### Decision Rule

> Do **not** use `concatMapTo` in new code. Replace all occurrences with `concatMap(() => innerObservable)`.
