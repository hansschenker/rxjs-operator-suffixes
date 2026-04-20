---
operator: throttleTime
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-27
---

### `throttleTime(duration, scheduler?, config?)`

> Emits the first value from the source, then silently ignores all subsequent values for a fixed duration before allowing the next emission through.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — the silence window is measured in wall-clock time |
| **Value-sensitive** | No — it does not inspect value content; timing alone governs what passes |
| **Lossy** | Yes — all values arriving during the throttle window are discarded |
| **Completion required** | No |

**Completion behaviour** — `throttleTime` emits on each value that falls outside the active window, so it works naturally on infinite streams. When the source completes, `throttleTime` completes immediately too. If `config.trailing` is `true` and a value is being held, it is emitted before completion. The source never needs to complete for the operator to work.

**Lossy behaviour** — every value that arrives while the throttle window is open is silently dropped. Only the first value in each window is forwarded (leading edge) by default. With `{ leading: false, trailing: true }`, only the last value in the window is forwarded — but intermediate values are still discarded.

---

#### Marble Diagram

Default (`leading: true, trailing: false`):

```
source:  --a-b-c-------d-e-f------|
         throttleTime(40ms)
output:  --a-----------d----------|
```

Trailing edge only (`leading: false, trailing: true`):

```
source:  --a-b-c-------d-e-f------|
         throttleTime(40ms, { leading: false, trailing: true })
output:  ------c-------    ---f---|
```

Both edges (`leading: true, trailing: true`):

```
source:  --a-b-c-------d-e-f------|
         throttleTime(40ms, { leading: true, trailing: true })
output:  --a---c-------d---f------|
```

---

#### Signature

```typescript
throttleTime<T>(
  duration: number,
  scheduler?: SchedulerLike,
  config?: ThrottleConfig
): MonoTypeOperatorFunction<T>

interface ThrottleConfig {
  leading?: boolean  // default: true
  trailing?: boolean // default: false
}
```

---

#### When to Use

- Throttle a `mousemove` or `scroll` event stream so expensive DOM calculations run at most once per 100 ms.
- Prevent double-submission of a form triggered by fast keyboard users pressing Enter rapidly.
- Limit the rate of analytics events sent to a backend when a user performs rapid repeated actions.
- Throttle real-time sensor or WebSocket data so the UI updates at a manageable rate without flooding the render loop.
- Rate-limit dispatched actions in an MVU store so a high-frequency source (e.g. resize observer) doesn't trigger unnecessary state recalculations.

---

#### Code Example

```typescript
import { fromEvent, animationFrameScheduler } from 'rxjs';
import { throttleTime, map, distinctUntilChanged } from 'rxjs/operators';

interface ScrollPosition {
	x: number;
	y: number;
}

// Throttle scroll events to fire at most once per 100ms,
// then derive a scroll position for the rest of the pipeline.
const scrollPosition$ = fromEvent<Event>(window, 'scroll').pipe(
	throttleTime(100),
	map((): ScrollPosition => ({
		x: window.scrollX,
		y: window.scrollY,
	})),
	distinctUntilChanged((a, b) => a.y === b.y),
);

scrollPosition$.subscribe(({ y }) => {
	console.log('Scroll Y:', y);
});
```

MVU effect context — throttling a high-frequency action before it hits the reducer:

```typescript
import { Subject } from 'rxjs';
import { throttleTime, map } from 'rxjs/operators';

type Action =
	| { type: 'RESIZE'; width: number; height: number }
	| { type: 'RESIZE_THROTTLED'; width: number; height: number };

const action$ = new Subject<Action>();

// Effect: collapse rapid RESIZE actions into throttled RESIZE_THROTTLED
const resizeThrottle$ = action$.pipe(
	ofType<Action, 'RESIZE'>('RESIZE'),
	throttleTime(200, undefined, { leading: true, trailing: true }),
	map((a): Action => ({ type: 'RESIZE_THROTTLED', width: a.width, height: a.height })),
);

resizeThrottle$.subscribe(action => action$.next(action));
```

---

#### Gotchas

1. **Leading vs trailing confusion** — The default is `leading: true, trailing: false`, meaning the *first* value in the burst passes through and the rest are dropped. If you want the *last* value (e.g. the final position after a burst of moves), you need `{ leading: false, trailing: true }`. Many developers expect `throttleTime` to behave like `debounceTime` and are surprised when intermediate values are lost with no trailing emit.

2. **`throttleTime` vs `debounceTime` — they solve different problems** — `throttleTime` guarantees at least one emission every N ms during a sustained stream; `debounceTime` waits for silence before emitting. For a scroll handler where you want regular UI updates *while* scrolling is happening, use `throttleTime`. For a search input where you want to wait until the user *stops* typing, use `debounceTime`.

3. **Scheduler matters for tests** — The second argument is a `SchedulerLike`. In production code you omit it (defaults to `asyncScheduler`). In Vitest/TestScheduler marble tests you must pass the `TestScheduler`'s virtual time scheduler, otherwise your tests run against real wall-clock time and will be flaky.

4. **`trailing: true` does not mean "emit the last value immediately"** — it means "emit the last value *at the end of the throttle window*", so there is still a delay. If you need the last value with no additional wait after the window closes, `debounceTime` is often a better fit.

5. **Completion with trailing value** — if `trailing: true` and the source completes while a trailing value is pending, RxJS 7 *does* emit that trailing value before propagating completion. RxJS 6 behaviour was inconsistent here — if you migrated from v6, verify this path.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `debounceTime(ms)` | Emits only after the source goes silent for `ms`; resets on every new value | You need the *final* value after a burst ends (search typeahead, form validation) |
| `auditTime(ms)` | Always emits the *last* value at the end of each window, ignoring the leading edge | You always want the most recent value on a fixed cadence, not the first |
| `sampleTime(ms)` | Emits the latest value on a fixed interval clock, independent of source activity | You want a regular heartbeat sample regardless of how many source values arrived |
| `throttle(obs)` | Same as `throttleTime` but the window is defined by an Observable rather than a fixed duration | You need a dynamic, variable-length throttle window |
| `distinctUntilChanged()` | Suppresses consecutive *equal* values, no time dimension | You want to drop duplicates by value, not by timing |

---

#### Decision Rule

> Use `throttleTime` when you need **at least one emission per burst** with a guaranteed minimum gap between outputs — especially for high-frequency UI events like scroll, resize, or mousemove. Prefer `debounceTime` instead when **you only care about the final settled value** and can afford to wait for silence.
