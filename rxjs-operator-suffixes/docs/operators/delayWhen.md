---
operator: delayWhen
family: Utility
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: true
date: 2026-03-29
---

### `delayWhen<T>(delayDurationSelector: (value: T, index: number) => ObservableInput<unknown>, subscriptionDelay?: ObservableInput<unknown>)`

> Delays each source value individually — the delay duration for each value is determined by a per-value Observable returned by `delayDurationSelector`; the value is forwarded when that Observable emits its first value.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Utility |
| **Time-sensitive** | Yes — explicitly controls the timing of each emission |
| **Value-sensitive** | Yes — `delayDurationSelector` receives each value and can tailor the delay based on its content |
| **Lossy** | No — every value is held until its duration Observable emits, then forwarded; nothing is dropped |
| **Completion required** | No — processes each value independently; works on infinite sources |

**Completion behaviour** — `delayWhen` delays each value independently by subscribing to the duration Observable for that value and forwarding it when the duration Observable emits. The completion notification from the source is also delayed until all in-flight duration Observables have emitted. If the source never completes, `delayWhen` runs indefinitely.

**Lossy behaviour** — not lossy. Every source value is held (subscribed to a duration Observable) and eventually forwarded. If a duration Observable never emits, that value is held indefinitely.

---

#### Marble Diagram

```
source:   --a------b------c--|
delay(a): ----*              (a's duration emits after 2 units)
delay(b):          --*       (b's duration emits after 2 units)
delay(c):                 *  (c's duration emits immediately)
          delayWhen(x => durationFor(x))
output:   ----a------b----c--|
```

Different delays per value:
```
source:   --1--2--3--|
          delayWhen((_, i) => timer(i * 200))
output:   --1----2------3--|
          (1: 0ms delay, 2: 200ms, 3: 400ms — staggered)
```

---

#### Signature

```typescript
delayWhen<T>(
	delayDurationSelector: (value: T, index: number) => ObservableInput<unknown>,
	subscriptionDelay?: ObservableInput<unknown>
): MonoTypeOperatorFunction<T>
```

- **`delayDurationSelector`** — called for each value; returns an Observable whose first emission triggers forwarding of that value.
- **`subscriptionDelay`** — optional; if provided, `delayWhen` waits for this Observable to emit before subscribing to the source at all.

**RxJS 7 note:** the `subscriptionDelay` parameter is deprecated in RxJS 7. Use `skipUntil` or `concat` upstream instead.

---

#### When to Use

- Stagger list item animations with index-based delays (e.g. item 0 appears immediately, item 1 after 100ms, etc.).
- Delay individual retry attempts in `retryWhen` pipelines with exponential backoff.
- Hold values until a per-value resource is ready (e.g. wait for an image to load before displaying it).
- Implement variable debounce/throttle where the silence window depends on the value's content or priority.
- Delay notifications until an acknowledgement event specific to that value arrives.

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { delayWhen, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface ListItem {
	id: number
	label: string
}

const items: ListItem[] = [
	{ id: 0, label: 'Alpha' },
	{ id: 1, label: 'Beta' },
	{ id: 2, label: 'Gamma' },
	{ id: 3, label: 'Delta' },
]

// Cascade-animate list items — each appears 150ms after the previous
from(items).pipe(
	delayWhen((_item: ListItem, index: number) => timer(index * 150))
).subscribe((item: ListItem) => animateIn(item))
```

Dynamic delay based on value content — priority items appear sooner:

```typescript
import { Subject } from 'rxjs'
import { delayWhen } from 'rxjs/operators'
import { timer } from 'rxjs'

interface Notification {
	message: string
	priority: 'high' | 'normal' | 'low'
}

const notifications$ = new Subject<Notification>()

const delayMap: Record<Notification['priority'], number> = {
	high: 0,
	normal: 500,
	low: 2000
}

const displayed$ = notifications$.pipe(
	delayWhen((n: Notification) => timer(delayMap[n.priority]))
)

displayed$.subscribe((n: Notification) => showNotification(n))
```

Inside `retryWhen` for exponential backoff (RxJS 6 pattern):

```typescript
import { ajax } from 'rxjs/ajax'
import { retryWhen, delayWhen, take } from 'rxjs/operators'
import { timer } from 'rxjs'

const data$ = ajax.getJSON('/api/data').pipe(
	retryWhen((errors$) =>
		errors$.pipe(
			delayWhen((_err: unknown, index: number) => timer(1000 * 2 ** index)),
			take(4)
		)
	)
)
```

---

#### Gotchas

1. **Duration Observable that never emits holds the value forever** — if `delayDurationSelector` returns an Observable that never emits (e.g. `NEVER`), that value is buffered indefinitely, accumulating memory. Ensure duration Observables always emit or complete.

2. **Values may arrive out of order** — unlike `delay` (which applies a uniform shift), `delayWhen` allows each value to have a different delay duration. A value with a short delay may overtake a preceding value with a longer delay. If ordering must be preserved, add a `concatMap` with index-aware scheduling.

3. **`subscriptionDelay` is deprecated in RxJS 7** — replace `delayWhen(fn, trigger$)` with `source$.pipe(skipUntil(trigger$), delayWhen(fn))` or `concat(trigger$.pipe(ignoreElements()), source$.pipe(delayWhen(fn)))`.

4. **Memory scales with in-flight values** — all values currently waiting for their duration Observable to emit are held in memory simultaneously. For high-frequency sources with long delays, this can be significant.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `delay` | Uniform fixed delay for all values | Every value needs the same delay duration |
| `debounceTime` | Suppresses rapid values, only emits after silence window | You want rate limiting, not a time shift |
| `throttleTime` | Rate limiting with configurable leading/trailing | You want to limit emission rate |
| `timer` | Creates a source that emits after a delay | You need a delayed creator, not a delay operator |

---

#### Decision Rule

> Use `delayWhen` when **each value requires an individually tailored delay** — either varying by index, value content, or an external per-value signal. Use `delay(ms)` when all values should be shifted by the same fixed duration.
