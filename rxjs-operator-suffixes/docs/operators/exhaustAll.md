---
operator: exhaustAll
family: Combination
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `exhaustAll<T>()`

> Subscribes to the first inner Observable emitted by the source (a higher-order Observable) and **ignores any new inner Observables that arrive while the current one is still active** — the higher-order counterpart of `exhaustMap`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — ignoring is driven by whether an inner is active, not by timing |
| **Value-sensitive** | No — does not inspect the content of inner emissions |
| **Lossy** | Yes — inner Observables emitted by the outer while one is active are silently discarded |
| **Completion required** | No — emits inner values as they arrive; the output completes when the outer source completes and the last active inner completes |

**Completion behaviour** — `exhaustAll` subscribes to the first inner Observable and ignores all subsequent inners until that one completes. Once the active inner completes, the next inner emitted by the outer is subscribed to. The output does not complete until the outer source completes AND the last active inner completes.

**Lossy behaviour** — `exhaustAll` is lossy. Any inner Observable emitted by the outer while an inner is active is permanently discarded — not queued, not buffered. Only inners that arrive when no inner is currently subscribed are processed.

---

#### Marble Diagram

```
outer:    --[a$]--[b$]--[c$]--------[d$]--|
inner a$: ---------1--2--|
inner b$: (discarded — a$ still active)
inner c$: (discarded — a$ still active)
inner d$:                  ---3--4--|
          exhaustAll()
output:   ----------1--2------3--4--|
```

`b$` and `c$` arrive while `a$` is active — both are discarded entirely.
`d$` arrives when no inner is active — subscribed to normally.

---

#### Signature

```typescript
exhaustAll<O extends ObservableInput<unknown>>(): OperatorFunction<O, ObservedValueOf<O>>
```

---

#### When to Use

- Flatten a higher-order Observable when only one inner should run at a time and extras should be dropped.
- Use explicitly when you want `exhaustMap` semantics but the projection step is already done upstream.
- Gate a stream of request Observables so that only one executes at a time with no queuing.

---

#### Code Example

```typescript
import { Subject } from 'rxjs'
import { exhaustAll, map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface Report {
	id: string
	data: unknown[]
}

// Higher-order stream: each trigger produces a request Observable
const reportRequest$ = new Subject<string>()

const report$ = reportRequest$.pipe(
	map((reportId: string) =>
		ajax.getJSON<Report>(`/api/reports/${reportId}`)
	),
	exhaustAll()  // ignore new report requests while one is already loading
)

report$.subscribe((report: Report) => renderReport(report))

reportRequest$.next('report-1')
reportRequest$.next('report-2')  // discarded — report-1 still loading
reportRequest$.next('report-3')  // discarded — report-1 still loading
```

---

#### Gotchas

1. **`exhaustAll` = `exhaustMap(x => x)`** — `exhaustMap` is the idiomatic shorthand. Use `exhaustAll` only when you already have a higher-order Observable and the projection is done upstream.

2. **Outer must emit Observables** — if the outer source emits plain values, `exhaustAll` will throw. Use `exhaustMap` with a projection instead.

3. **Discarded inners leave no trace** — there is no notification that an inner was dropped. If callers need to know their request was ignored, manage that feedback separately.

4. **The active inner must complete** — if the active inner never completes, all subsequent inners emitted by the outer are permanently discarded. Always ensure inner Observables complete or are bounded with `take`, `takeUntil`, or a timeout.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `exhaustMap` | Combined project + flatten in one step | You have a plain value to project to an Observable |
| `concatAll` | Queues all inners; processes every one in order | Every inner must be processed; order matters |
| `switchAll` | Cancels the active inner when a new one arrives | Only the latest inner matters; stale work should be cancelled |
| `mergeAll` | All inners run concurrently; none are discarded | Every inner must be processed; order does not matter |

---

#### Decision Rule

> Use `exhaustAll` when you already hold a higher-order Observable and **only one inner should run at a time with new inners discarded while busy**. Prefer `exhaustMap` when you can project and flatten in one step.
