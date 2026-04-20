---
operator: interval
family: Creation
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `interval(period: number, scheduler?: SchedulerLike)`

> Creates an Observable that emits incrementing integers (`0, 1, 2, …`) at a fixed time interval — the simplest periodic clock in RxJS.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Creation |
| **Time-sensitive** | Yes — emission timing is entirely wall-clock driven |
| **Value-sensitive** | No — always emits incrementing integers regardless of external input |
| **Lossy** | No — all scheduled emissions are delivered |
| **Completion required** | No — never completes; runs indefinitely until unsubscribed |

**Completion behaviour** — `interval` never completes. It emits `0` after the first `period` ms, then `1, 2, 3, …` at each subsequent `period` ms, forever. Use `take(n)`, `takeUntil`, or `takeWhile` to bound it. If you need a custom initial delay before the first tick, use `timer(initialDelay, period)` instead.

**Lossy behaviour** — not lossy. Every scheduled tick is delivered. Unsubscribing cancels future ticks — intentional teardown, not a loss.

---

#### Marble Diagram

```
interval(10):
output: -0-1-2-3-4-5-...
        (emits at 10ms, 20ms, 30ms, ...)
```

Compared to `timer(10, 10)`:
```
timer(10, 10):
output: -0-1-2-3-4-5-...
        (identical — timer with equal initial delay and interval)
```

With `take(4)`:
```
interval(10).pipe(take(4)):
output: -0-1-2-3|
```

---

#### Signature

```typescript
interval(
	period?: number,           // ms between emissions (default: 0)
	scheduler?: SchedulerLike  // default: asyncScheduler
): Observable<number>
```

---

#### When to Use

- Implement a fixed-rate polling loop (e.g. fetch new data every 30 seconds).
- Drive animations or progress bars with a regular clock tick.
- Use as the notifier in `sample(interval(n))` for fixed-rate sampling.
- Create a heartbeat signal for WebSocket keep-alive pings.
- Build a fixed-rate ticker for game loops or real-time dashboards.
- Use as the `closingSelector` in `bufferWhen` or `windowWhen` for fixed-interval batching.

---

#### Code Example

```typescript
import { interval } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { ajax } from 'rxjs/ajax'

interface FeedItem {
	id: number
	title: string
	timestamp: number
}

const destroy$ = new Subject<void>()

// Refresh feed every 30 seconds; cancel on destroy
const feed$ = interval(30_000).pipe(
	switchMap(() => ajax.getJSON<FeedItem[]>('/api/feed')),
	takeUntil(destroy$)
)

feed$.subscribe((items: FeedItem[]) => renderFeed(items))

// On teardown:
// destroy$.next(); destroy$.complete()
```

Countdown using `interval` + `take`:

```typescript
import { interval } from 'rxjs'
import { map, take, startWith } from 'rxjs/operators'

const DURATION_SECONDS = 5

const countdown$ = interval(1000).pipe(
	take(DURATION_SECONDS),
	map((i: number) => DURATION_SECONDS - 1 - i),
	startWith(DURATION_SECONDS)
)

countdown$.subscribe((remaining: number) =>
	updateCountdown(remaining === 0 ? 'Go!' : `${remaining}`)
)
```

---

#### Gotchas

1. **`interval` never completes** — always pair with `takeUntil(destroy$)`, `take(n)`, or `takeWhile` to prevent memory leaks. Subscribing without teardown is the most common `interval` mistake.

2. **First emission is NOT immediate** — `interval(n)` emits `0` after `n` ms. If you need an immediate first tick followed by regular ticks, use `timer(0, n)` instead.

3. **`interval(0)` is not synchronous** — despite the zero period, emissions are still asynchronous (scheduled on the event loop). Use `of(0)` for synchronous emission.

4. **Drift on long-running intervals** — `interval` uses `setInterval` under the hood. On a busy main thread, ticks may be delayed by the event loop. For high-precision timing, consider `animationFrames()` for rendering or a Web Worker clock.

5. **Use `TestScheduler` for tests** — `interval` uses `asyncScheduler` by default. Always use `TestScheduler.run()` with marble syntax for unit tests to avoid real-time waits.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `timer` | Custom initial delay before first tick | First tick should differ from the repeat interval |
| `animationFrames` | Ticks on `requestAnimationFrame` | DOM rendering at browser frame rate |
| `defer` | Re-creates Observable on each subscription | Per-subscription clocks (avoid shared state) |
| `EMPTY` | Completes immediately | Replacing `interval` in tests without ticking |

---

#### Decision Rule

> Use `interval(n)` for a **fixed-rate clock where the first tick matches the period**. Use `timer(delay, n)` when the first tick should occur after a different initial delay. Always add teardown with `takeUntil` or `take`.
