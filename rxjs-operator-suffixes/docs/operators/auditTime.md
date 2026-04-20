---
operator: auditTime
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `auditTime<T>(duration: number, scheduler?: SchedulerLike)`

> Ignores source values for a fixed time window, then emits the **most recent** value when the window expires — the fixed-duration counterpart of `audit`, always forwarding the trailing (last) value.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — behaviour depends on wall-clock timing |
| **Value-sensitive** | No — does not inspect value content; always emits the most recent value unconditionally |
| **Lossy** | Yes — all values except the most recent within each window are permanently discarded |
| **Completion required** | No — emits when the window expires; works correctly on infinite sources |

**Completion behaviour** — `auditTime` opens a silence window when a source value arrives. During the window it tracks the most recent value. When the fixed `duration` expires, that most recent value is forwarded and the window closes. If a new source value arrives after the window closes, a new window opens. If the source completes while a window is open, the buffered latest value is emitted before completion. If the source never completes, `auditTime` runs indefinitely.

**Lossy behaviour** — within each active window all intermediate values are silently overwritten; only the last value seen when the `duration` expires is emitted. In a burst of N values within one window, N−1 are discarded.

---

#### Marble Diagram

```
source:  --a--b--c------d--e--f--g--|
         auditTime(30)
output:  --------c-----------g-----|
         (a,b discarded — c is latest when window expires)
         (d,e,f discarded — g is latest when window expires)
```

Compare with `throttleTime` (emits the *first* value):
```
source:  --a--b--c------d--e--f--g--|
         throttleTime(30)
output:  --a-----------d------------|
         (auditTime: last; throttleTime: first)
```

---

#### Signature

```typescript
auditTime<T>(
	duration: number,
	scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Rate-limit UI updates from high-frequency event streams (scroll, mousemove, resize) where you want the final settled position within each interval, not the initial one.
- Sample the latest state of a rapidly changing data source at regular intervals (e.g. sample the latest sensor reading every 100 ms for display).
- Reduce rendering load from animation frames or WebSocket data feeds by emitting only the most recent value per time window.
- Use as a simpler alternative to `throttle({ leading: false, trailing: true })` — same semantics with less ceremony.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { auditTime, map } from 'rxjs/operators'

interface ScrollPosition {
	x: number
	y: number
}

// Sample scroll position every 100 ms — always get the latest position, not the first
const scroll$ = fromEvent(window, 'scroll').pipe(
	auditTime(100),
	map((): ScrollPosition => ({
		x: window.scrollX,
		y: window.scrollY
	}))
)

scroll$.subscribe((pos: ScrollPosition) => updateScrollIndicator(pos))
```

High-frequency sensor data with a fixed sampling window:

```typescript
import { Subject } from 'rxjs'
import { auditTime } from 'rxjs/operators'

interface SensorReading {
	temperature: number
	humidity: number
	timestamp: number
}

// Sensor fires 60 times/sec — sample latest reading every 200 ms for dashboard
const sensor$ = new Subject<SensorReading>()

const sampled$ = sensor$.pipe(auditTime(200))

sampled$.subscribe((r: SensorReading) => updateDashboard(r))
```

---

#### Gotchas

1. **`auditTime` vs `throttleTime`** — `throttleTime` emits the *first* value in the window (leading emission, immediate response); `auditTime` emits the *last* (trailing). Use `throttleTime` when you need a guaranteed immediate reaction; use `auditTime` when the final settled value matters more than immediate response.

2. **`auditTime` vs `debounceTime`** — `debounceTime` resets its window on every new value (source must go quiet before emitting); `auditTime` opens the window on the first value in each period and emits regardless of subsequent activity after `duration` ms. Use `debounceTime` for "wait until settled"; use `auditTime` for "sample latest every N ms".

3. **`auditTime` vs `sampleTime`** — `sampleTime` emits on a fixed external clock that ticks regardless of source activity; `auditTime` only opens a window when a source value arrives. If the source is silent, `sampleTime` still emits (the last seen value), while `auditTime` emits nothing. Use `sampleTime` for a fixed-rate polling display; use `auditTime` to throttle active event bursts.

4. **Window is triggered by source activity** — `auditTime` opens no window until the source emits. If the source is idle, `auditTime` is transparent. This makes it less useful as a "tick at fixed rate" operator — use `sampleTime` for that.

5. **Testing requires `TestScheduler`** — like all time-based operators, `auditTime` must be tested with RxJS `TestScheduler` and marble syntax to avoid real-time delays in unit tests.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `audit` | Dynamic window duration from a `durationSelector` fn | The window duration must vary per emitted value |
| `throttleTime` | Emits the *first* value in the window | You need immediate leading emission |
| `debounceTime` | Resets window on each value; emits after silence | You want to wait for the source to settle |
| `sampleTime` | External fixed-rate clock, independent of source | You want a fixed-rate tick regardless of source activity |
| `throttle({ leading: false, trailing: true })` | Identical semantics with more config ceremony | Prefer `auditTime` for the fixed-duration trailing case |

---

#### Decision Rule

> Use `auditTime` when you want the **most recent value at the end of each fixed time window**. Use `throttleTime` for the first value, `debounceTime` for the settled value, and `audit` when the window duration must vary per value.
