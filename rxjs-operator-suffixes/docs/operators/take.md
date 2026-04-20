---
operator: take
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-24
---

### `take<T>(count: number)`

> Emit the first `count` values from the source then complete — unsubscribing from the source immediately after the nth value.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — counts values, ignores when they arrive |
| **Value-sensitive** | No — never inspects value content, only counts |
| **Lossy** | Yes — all values after position `count` are discarded and the source is unsubscribed |
| **Completion required** | No — completes itself after `count` values regardless of source |

**Completion behaviour** — `take(n)` completes and unsubscribes from the source the moment the nth value is emitted. It does not wait for the source to complete. If the source completes with fewer than `n` values, `take` completes normally with however many values arrived — no error is thrown.

**Lossy behaviour** — `take` is lossy for everything after the nth value. Once the count is reached, the source is immediately unsubscribed, so any queued or future values are silently dropped.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--|
         take(3)
output:  --a--b--c|

// Source completes before count reached — no error:
source:  --a--b--|
         take(5)
output:  --a--b--|
```

---

#### Signature

```typescript
take<T>(count: number): MonoTypeOperatorFunction<T>
```

Throws `ArgumentOutOfRangeError` if `count < 0`. `take(0)` completes immediately without emitting.

---

#### When to Use

- Take exactly one value from a stream and complete: `take(1)` on a click, route event, or initialisation signal
- Page the first N results from an infinite stream (e.g. first 10 items from a WebSocket feed)
- Prevent a cold Observable from running indefinitely in a one-shot scenario
- Guard against a source that should only be consumed once (e.g. first emission from a `Subject`)
- Combine with `interval` or `timer` to limit how many ticks fire

---

#### Code Example

```typescript
import { fromEvent, interval } from 'rxjs'
import { take, map, switchMap } from 'rxjs/operators'

// Scenario: one-shot button click — process only the first click,
// ignore all subsequent ones

const btn = document.querySelector('#submit') as HTMLButtonElement

const firstClick$ = fromEvent(btn, 'click').pipe(
	take(1),
)

firstClick$.subscribe(() => submitForm())

// ---

// Scenario: MVU — initialise state from an API on first load only

const init$ = loadConfig().pipe(
	take(1),   // defensive: loadConfig should complete, but take(1) guarantees it
)

const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1),
)

init$.pipe(
	switchMap(config => state$),
).subscribe(renderApp)
```

---

#### Gotchas

1. **`take(1)` vs `first()` on empty streams** — `take(1)` completes silently if the source emits nothing; `first()` throws `EmptyError`. Use `take(1)` when an empty stream is acceptable, `first()` when it signals a bug.

2. **`take(0)` completes immediately** — No values are emitted and the source is never subscribed. This is occasionally useful as a no-op but is usually a logic error.

3. **Does not protect against synchronous bursts** — If a source emits multiple values synchronously (e.g. `of(1,2,3,4,5)`), `take(3)` still lets exactly 3 through before completing. The unsubscription happens after the third synchronous emission.

4. **Unsubscription is guaranteed** — `take` always unsubscribes from the source after `count` values, even if you never call `unsubscribe()` on the outer subscription. This makes it a clean alternative to manual teardown for one-shot streams.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `first(predicate?)` | Emits first matching value, errors on empty | You need the first value and an empty stream is an error |
| `takeLast(n)` | Takes the **last** n values — requires source to complete | You need the tail of a finite stream |
| `takeWhile(pred)` | Stops based on **value content**, not position | You need to stop when a condition becomes false |
| `takeUntil(notifier$)` | Stops based on an **external signal** | You need to stop when another stream emits |
| `elementAt(n)` | Emits only the value at index n, then completes | You need exactly one specific-position value |

---

#### Decision Rule

> Use `take(n)` when you want the **first n values by position** with no content inspection. Prefer `takeWhile` when the stopping condition depends on value content, or `takeUntil` when it depends on an external event.
