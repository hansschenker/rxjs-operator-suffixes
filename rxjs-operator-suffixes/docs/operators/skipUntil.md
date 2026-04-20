---
operator: skipUntil
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `skipUntil<T>(notifier: ObservableInput<unknown>)`

> Ignores all source values until the `notifier` Observable emits its first value, then forwards all subsequent source values unconditionally — an externally controlled one-way gate.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — the gate is event-driven, not time-driven (though the notifier may itself be time-based) |
| **Value-sensitive** | No — source values are not inspected; the gate is controlled entirely by the notifier |
| **Lossy** | Yes — all source values emitted before the notifier fires are permanently discarded |
| **Completion required** | No — emits from the notifier's first emission onwards; works on infinite sources |

**Completion behaviour** — `skipUntil` subscribes to both the source and the notifier immediately. All source values are discarded until the notifier emits. Once it does, the notifier subscription is closed and all subsequent source values are forwarded unconditionally. If the notifier completes without emitting, the gate never opens and the output is empty.

**Lossy behaviour** — every source value emitted before the notifier's first emission is permanently discarded. The notifier value itself is not forwarded; it only acts as a trigger.

---

#### Marble Diagram

```
source:   --a--b--c--d--e--f--|
notifier: -----------n--------|
          skipUntil(notifier$)
output:   -----------d--e--f--|
```

Values `a`, `b`, `c` arrive before the notifier — all discarded. `d` is the first value after the notifier fires.

---

#### Signature

```typescript
skipUntil<T>(notifier: ObservableInput<unknown>): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Hold back a data stream until a user interaction occurs (e.g. don't process scroll events until the user has clicked "Start").
- Wait for an initialisation signal before reacting to state changes (e.g. skip updates until `appReady$` emits).
- Gate a WebSocket message stream until authentication has completed.
- Delay processing of a hot Observable's emissions until a dependent resource is available.
- Implement "start on demand" behaviour for a continuously running source.

---

#### Code Example

```typescript
import { interval, fromEvent } from 'rxjs'
import { skipUntil, take } from 'rxjs/operators'

// A continuously ticking timer — don't start processing until user clicks Start
const ticker$ = interval(500)

const startBtn = document.getElementById('start')!
const start$ = fromEvent(startBtn, 'click')

const activeTicker$ = ticker$.pipe(
	skipUntil(start$),
	take(10)  // process 10 ticks after start
)

activeTicker$.subscribe((tick: number) => {
	console.log('Tick:', tick)
})
```

App initialisation gate:

```typescript
import { BehaviorSubject, Subject } from 'rxjs'
import { skipUntil } from 'rxjs/operators'

interface AppState {
	data: string[]
}

const appReady$ = new Subject<void>()
const state$ = new BehaviorSubject<AppState>({ data: [] })

// Don't react to state changes until the app signals ready
const activeState$ = state$.pipe(skipUntil(appReady$))

activeState$.subscribe((state: AppState) => renderApp(state))

// Later, after init completes:
appReady$.next()  // gate opens — all future state$ emissions are forwarded
```

---

#### Gotchas

1. **The gate opens permanently on the notifier's first emission** — like `skipWhile`, once `skipUntil` stops skipping it never re-evaluates. Subsequent notifier emissions are ignored. If you need repeating gates, compose `skipUntil` with `takeUntil` in repeated subscriptions.

2. **Notifier completing without emitting keeps the gate closed** — if the notifier completes via `EMPTY` or a completing Observable that never emits, the gate never opens and the output stream will complete empty when the source completes.

3. **Source values emitted in the same tick as the notifier** — synchronous emission ordering matters. If the source and notifier emit in the same microtask, the first source value after the notifier emission depends on scheduling. In practice this is rarely an issue with async sources.

4. **`skipUntil` vs `takeUntil`** — they are mirrors. `skipUntil(n$)` discards values *before* `n$` emits; `takeUntil(n$)` discards values *after* `n$` emits. It is common to use both together to define a processing window.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `skipWhile` | Predicate-based gate — skips while a condition on the value is true | The gate condition depends on the source value's content |
| `skip` | Skips a fixed count | The number of values to skip is known upfront |
| `takeUntil` | Mirror — forwards values until notifier emits, then completes | You want to define the *end* of a window, not the start |
| `filter` | Re-evaluates predicate on every emission | You need ongoing conditional filtering, not a one-way gate |

---

#### Decision Rule

> Use `skipUntil` when you need an **externally triggered one-way gate** — discard all source values until a separate event fires, then let everything through. Pair with `takeUntil` to define both the start and end of a processing window.
