---
operator: concat
family: Combination
lossy: false
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `concat<T>(...sources: ObservableInput<T>[])`

> Subscribes to source Observables one at a time in order, waiting for each to complete before subscribing to the next — a sequential union of streams.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — ordering is defined by subscription sequence, not by when values arrive |
| **Value-sensitive** | No — does not inspect value content; all values are forwarded unconditionally |
| **Lossy** | No — every value from every source is forwarded to the output |
| **Completion required** | Yes — each source must complete before `concat` subscribes to the next one |

**Completion behaviour** — `concat` subscribes to the first source and waits for it to complete before subscribing to the second, and so on. The output completes only after the last source completes. If any source never completes, all subsequent sources are never subscribed to and the output never completes — this is the most common `concat` pitfall.

**Lossy behaviour** — `concat` is not lossy. Every value emitted by every source is forwarded to the output. Nothing is dropped or withheld.

---

#### Marble Diagram

```
source1: --a--b--c--|
source2:            --d--e--|
source3:                    --f--|
         concat(source1$, source2$, source3$)
output:  --a--b--c--d--e--f--|
```

If source1 never completes:
```
source1: --a--b--c---...  (never completes)
source2: --d--e--|
         concat(source1$, source2$)
output:  --a--b--c---...  (source2 never subscribes)
```

---

#### Signature

```typescript
// Static creation function
concat<T>(...sources: ObservableInput<T>[]): Observable<T>
```

---

#### When to Use

- Run an initialisation sequence before starting a live stream (e.g. load cached data, then subscribe to WebSocket updates).
- Chain HTTP requests that must execute in a guaranteed order (e.g. authenticate, then fetch user profile, then fetch preferences).
- Prepend a seed value or loading state to a stream before the real data arrives.
- Play animations or transitions in sequence, where each must finish before the next begins.

---

#### Code Example

```typescript
import { concat, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

interface AppState {
	status: 'loading' | 'ready'
	data: string[]
}

// Emit a loading state immediately, then the real data once fetched
const state$ = concat(
	of<AppState>({ status: 'loading', data: [] }),
	ajax.getJSON<string[]>('/api/items').pipe(
		map((data: string[]): AppState => ({ status: 'ready', data }))
	)
)

state$.subscribe((state: AppState) => render(state))
```

Init sequence — authenticate then fetch:

```typescript
import { concat } from 'rxjs'
import { switchMap } from 'rxjs/operators'

// Authenticate first, then fetch profile — order is guaranteed
const bootstrap$ = concat(
	authenticate$(),
	fetchProfile$(),
	fetchPreferences$()
)

bootstrap$.subscribe({
	complete: () => console.log('App ready'),
	error: (err: Error) => console.error('Bootstrap failed', err)
})
```

**MVU context** — prepend initial state emission before the action-driven stream:

```typescript
import { concat, of } from 'rxjs'
import { scan, shareReplay } from 'rxjs/operators'

const state$ = concat(
	of(initialState),          // emit initial state synchronously
	actions$.pipe(             // then drive state from actions
		scan(reducer, initialState)
	)
).pipe(shareReplay(1))
```

---

#### Gotchas

1. **Any non-completing source blocks all subsequent sources** — if the first source is a `Subject`, `interval()`, or any other infinite Observable, the second source is never subscribed to. Always ensure each source in a `concat` will eventually complete.

2. **`concat` is a static function, not a pipeable operator** — use `concatWith` for the pipeable equivalent inside a `pipe()` chain.

3. **`concat(of(x), source$)` ≠ `startWith(x)`** — both prepend a value, but `startWith` is more idiomatic and efficient for adding a seed value to an existing pipeline.

4. **Error short-circuits the sequence** — if any source errors, `concat` propagates the error immediately and does not subscribe to subsequent sources. There is no built-in retry or continue-on-error; use `catchError` on individual sources if needed.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `merge` | Subscribes to all sources concurrently | Order does not matter; you want all results as fast as possible |
| `concatWith` | Pipeable instance version of `concat` | You need to concat inside a `pipe()` chain |
| `startWith` | Prepends one or more synchronous values to a stream | You only need to prepend static seed values |
| `forkJoin` | Subscribes to all sources concurrently, emits only when all complete | You need the final value of each source, not intermediate emissions |

---

#### Decision Rule

> Use `concat` when sources must execute **sequentially** and each prior source must complete before the next starts. Prefer `merge` when order does not matter and you want parallel execution.
