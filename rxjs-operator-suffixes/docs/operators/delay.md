---
operator: delay
family: Utility
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `delay<T>(due: number | Date, scheduler?: SchedulerLike)`

> Shifts every emission from the source forward in time by a fixed duration — all values and the completion notification are delayed by the same amount.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Utility |
| **Time-sensitive** | Yes — it explicitly manipulates the timing of emissions |
| **Value-sensitive** | No — does not inspect value content; all values are delayed equally |
| **Lossy** | No — every value is buffered and forwarded after the delay; nothing is dropped |
| **Completion required** | No — delays each emission independently as it arrives; works on infinite sources |

**Completion behaviour** — `delay` shifts every emission (including the completion notification) forward in time by the specified duration. It buffers incoming values internally until their delay expires. If the source never completes, `delay` runs indefinitely — the completion is delayed just like any other notification, so it arrives `due` milliseconds after the source completes.

**Lossy behaviour** — `delay` is not lossy. Every value emitted by the source is buffered and forwarded after the delay. The internal buffer grows proportionally to the emission rate during the delay window.

---

#### Marble Diagram

```
source:  --a--b--c--|
         delay(20ms)
output:  ----a--b--c--|
                   (each value and completion shifted right by 20ms)
```

With a `Date` argument (emit at a specific time):
```
source:  --a--b--c--|
         delay(new Date('2026-04-01T00:00:00'))
output:  (all emissions held until the target date, then replayed in order)
```

---

#### Signature

```typescript
delay<T>(
	due: number | Date,
	scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T>
```

- **`due: number`** — delay in milliseconds relative to each emission's arrival time.
- **`due: Date`** — hold all emissions until the specified absolute date/time, then release them all at once.
- **`scheduler`** — defaults to `asyncScheduler`; use `TestScheduler` in tests.

---

#### When to Use

- Add a deliberate pause before a UI transition (e.g. show a success message for 2 seconds before navigating away).
- Delay the start of an animation or tooltip after a hover event.
- Simulate network latency in development/testing without mocking the HTTP layer.
- Stagger emissions by a fixed offset for visual effects (combine with `mergeMap` and index-based delays for cascading animations).
- Schedule an action to occur at a specific future time using the `Date` overload.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { delay, map, switchMap } from 'rxjs/operators'
import { of } from 'rxjs'

// Show a tooltip 500ms after mouseenter, cancel if mouse leaves first
const target = document.getElementById('info-btn')!

const tooltip$ = fromEvent<MouseEvent>(target, 'mouseenter').pipe(
	switchMap(() =>
		of('Show tooltip').pipe(delay(500))
	)
)

tooltip$.subscribe(() => showTooltip())

fromEvent(target, 'mouseleave').subscribe(() => hideTooltip())
```

Staggered list animation — each item appears 100ms after the previous:

```typescript
import { from } from 'rxjs'
import { mergeMap, delay } from 'rxjs/operators'

const items = ['Alpha', 'Beta', 'Gamma', 'Delta']

from(items).pipe(
	mergeMap((item: string, index: number) =>
		of(item).pipe(delay(index * 100))
	)
).subscribe((item: string) => animateIn(item))
```

---

#### Gotchas

1. **`delay` delays the completion notification too** — the source completing is treated like any other notification and is shifted by the same duration. If you only want to delay values but complete immediately, use `delayWhen` with a custom notifier.

2. **`Date` overload releases all buffered values simultaneously** — if the source has already emitted several values before the target date, they all arrive in a burst at the target time. This is rarely what you want for smooth UI transitions; use the millisecond form for those.

3. **Memory during the delay window** — all values emitted during the delay period are buffered in memory. For high-frequency sources with long delays, this can accumulate significant memory. Consider pairing with `debounceTime` or `throttleTime` upstream if this is a concern.

4. **Testing requires `TestScheduler`** — because `delay` uses `asyncScheduler` by default, time-based tests using real timers are fragile. Always use `TestScheduler` with marble testing for any operator that involves `delay`.

5. **`delay(0)` is still async** — it defers to the next event loop tick via `asyncScheduler`. This is useful for pushing synchronous emissions to the async queue, but can cause unexpected ordering issues if you assume it is truly "no delay".

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `delayWhen` | Per-value dynamic delay controlled by a notifier Observable | Each value needs a different delay duration or an event-based trigger |
| `debounceTime` | Suppresses rapid values and only emits after silence | You want rate limiting, not a uniform time shift |
| `throttleTime` | Emits first value in a window, suppresses the rest | You want rate limiting with leading-edge emission |
| `timer` | Creates an Observable that emits after a delay | You want to create a delayed source, not shift an existing one |

---

#### Decision Rule

> Use `delay(ms)` when you need to **shift all emissions by a uniform fixed duration**. Use `delayWhen` when the delay duration varies per value or depends on an external signal.
