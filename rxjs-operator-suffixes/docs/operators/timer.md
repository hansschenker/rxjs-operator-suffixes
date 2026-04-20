---
operator: timer
family: Creation
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `timer(dueTime: number | Date, intervalOrScheduler?: number | SchedulerLike, scheduler?: SchedulerLike)`

> Creates an Observable that emits `0` after an initial delay, then optionally emits incrementing numbers at a fixed interval — combining a one-shot delay with an optional repeating tick.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Creation |
| **Time-sensitive** | Yes — emission timing is entirely wall-clock driven |
| **Value-sensitive** | No — always emits incrementing integers regardless of any external input |
| **Lossy** | No — all scheduled emissions are delivered |
| **Completion required** | Partial — with no `intervalDuration`, emits `0` then completes; with `intervalDuration`, runs indefinitely |

**Completion behaviour** — called with only `dueTime`, `timer` emits `0` after the delay and immediately completes. Called with both `dueTime` and `intervalDuration`, it emits `0` after the delay, then `1, 2, 3, …` at each interval, and never completes (like `interval` but with an initial delay offset). Use `take(n)` or `takeUntil` to bound the infinite form.

**Lossy behaviour** — not lossy. Every scheduled emission is delivered. The only "loss" is conceptual: if you unsubscribe early, subsequent scheduled emissions are cancelled — which is the correct teardown behaviour.

---

#### Marble Diagram

One-shot with delay:
```
timer(30):
output: ---0|
```

Repeating with initial delay and interval:
```
timer(30, 10):
output: ---0-1-2-3-4-5-...
        (first at 30ms, then every 10ms)
```

Compared to `interval(10)`:
```
interval(10):
output: -0-1-2-3-4-...
        (first at 10ms, then every 10ms — no custom initial delay)
```

---

#### Signature

```typescript
// One-shot — emit 0 after dueTime then complete
timer(dueTime: number | Date, scheduler?: SchedulerLike): Observable<0>

// Repeating — emit 0 after dueTime, then 1, 2, 3... every intervalDuration
timer(
	dueTime: number | Date,
	intervalDuration: number,
	scheduler?: SchedulerLike
): Observable<number>
```

---

#### When to Use

- Create a one-shot delay Observable (emit once after N ms) — used as the duration Observable in `debounce`, `throttle`, `delayWhen`.
- Implement a repeating polling loop with an initial warm-up delay before the first poll.
- Schedule a one-time action after a delay without `setTimeout` — keeping the operation inside the reactive graph for easy cancellation.
- Produce a finite countdown using `timer(0, 1000).pipe(take(10))`.
- Use as the `durationSelector` in `throttle` or `debounce` for fixed-duration windows.

---

#### Code Example

```typescript
import { timer } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { ajax } from 'rxjs/ajax'

interface StatusResponse {
	status: 'ok' | 'error'
	latency: number
}

const destroy$ = new Subject<void>()

// Poll a health endpoint: first check after 1s, then every 30s
const healthCheck$ = timer(1000, 30_000).pipe(
	switchMap(() => ajax.getJSON<StatusResponse>('/api/health')),
	takeUntil(destroy$)
)

healthCheck$.subscribe((res: StatusResponse) => {
	updateStatusIndicator(res.status, res.latency)
})

// On component teardown:
// destroy$.next(); destroy$.complete()
```

One-shot delay as a duration Observable inside `debounce`:

```typescript
import { fromEvent } from 'rxjs'
import { debounce } from 'rxjs/operators'
import { timer } from 'rxjs'

// Dynamic debounce using timer as durationSelector
const input$ = fromEvent<Event>(searchInput, 'input').pipe(
	debounce(() => timer(300))
)
```

Countdown timer:

```typescript
import { timer } from 'rxjs'
import { map, take } from 'rxjs/operators'

const COUNTDOWN_SECONDS = 10

// Count down from 10 to 0
const countdown$ = timer(0, 1000).pipe(
	take(COUNTDOWN_SECONDS + 1),
	map((i: number) => COUNTDOWN_SECONDS - i)
)

countdown$.subscribe((remaining: number) => updateCountdownDisplay(remaining))
```

---

#### Gotchas

1. **`timer(0)` emits asynchronously** — despite a delay of zero, `timer(0)` emits on the next microtask/macrotask tick, not synchronously. Use `of(0)` if synchronous emission is required.

2. **`timer(n)` vs `interval(n)`** — `interval(n)` emits the first value after `n` ms (no custom initial offset); `timer(dueTime, n)` allows a different initial delay. Use `interval` when the first tick should match the interval; use `timer` when you need an offset or a one-shot delay.

3. **Infinite form requires explicit teardown** — `timer(0, 1000)` never completes. Always pair with `takeUntil(destroy$)`, `take(n)`, or another completing operator to avoid memory leaks.

4. **`Date` as `dueTime`** — passing a `Date` object schedules emission at that absolute wall-clock time. If the `Date` is in the past, `timer` emits immediately (as if `dueTime = 0`).

5. **Use `TestScheduler` for tests** — `timer` uses the `asyncScheduler` by default, making real-time delays in unit tests painful. Pass `VirtualTimeScheduler` or use `TestScheduler.run()` with marble syntax for deterministic tests.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `interval` | Fixed-interval ticker; first emission at `n` ms (no custom offset) | Fixed-rate polling where first tick equals the interval |
| `delay` | Shifts all emissions from an existing source by N ms | Delaying a source stream, not creating a new one |
| `of` | Synchronous emission of specified values | Synchronous one-shot value with no timing |
| `NEVER` | Never emits | Permanent silence; blocking a duration window forever |
| `EMPTY` | Completes immediately without emitting | Immediate completion with no values |

---

#### Decision Rule

> Use `timer` for a **one-shot delayed emission** (`timer(ms)`) or a **repeating ticker with a custom initial delay** (`timer(delay, interval)`). Use `interval` when the first tick equals the repeat interval.
