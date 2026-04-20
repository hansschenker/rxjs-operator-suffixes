---
operator: sampleTime
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-24
---

### `sampleTime<T>(period: number, scheduler?: SchedulerLike)`

> Emits the most recent value from the source on a fixed periodic clock tick — regardless of how many values arrived between ticks.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — driven entirely by a periodic clock, not by source value arrival |
| **Value-sensitive** | No — never inspects the content of values, only takes the latest one at each tick |
| **Lossy** | Yes — all values between ticks are silently discarded except the most recent |
| **Completion required** | No — emits on each clock tick independently of source completion |

**Completion behaviour** — `sampleTime` emits on its own periodic schedule, completely independent of source completion. If the source completes between ticks, the next tick will still emit the last value received before completion, then `sampleTime` completes too. If the source never completes, `sampleTime` runs indefinitely — this is normal and intended for continuous sensor/telemetry streams.

**Lossy behaviour** — `sampleTime` is lossy. Every value emitted by the source between two clock ticks is discarded except the very last one. If the source emits 100 values in a 1-second period, only 1 is forwarded. If the source emits nothing between two ticks, no emission is produced for that tick.

---

#### Marble Diagram

```
source:  --a-b-c-----d--e-f-g--|
         sampleTime(40)
         |..........|..........|
output:  ----------c----------g--|

source:  --a---------b---------|
         sampleTime(40)
         |..........|..........|
output:  ----------a----------b--|

// No emission tick if source was silent between ticks:
source:  ----a----|
         sampleTime(40)
         |..........|
output:  ----a----|
```

---

#### Signature

```typescript
sampleTime<T>(period: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>
```

The `scheduler` parameter defaults to `asyncScheduler`. Pass `TestScheduler` in tests to control virtual time.

---

#### When to Use

- Sample a high-frequency sensor or telemetry stream at a fixed rate (e.g. GPS coordinates every 500ms)
- Throttle a rapidly-updating data feed before rendering to the DOM
- Capture the current value of a stream on a fixed polling interval without caring about intermediate values
- Reduce the update rate of a live chart or dashboard that would otherwise re-render too frequently
- Implement a "heartbeat" snapshot — record the state of a stream every N seconds for logging

---

#### Code Example

```typescript
import { fromEvent, interval } from 'rxjs'
import { sampleTime, map, tap, withLatestFrom } from 'rxjs/operators'

// Scenario: GPS tracker — position updates arrive rapidly,
// but we only render the map marker every 500ms

interface Position {
	lat: number
	lng: number
}

const rawPosition$: Observable<Position> = fromGeolocationAPI()

// Render at most twice per second regardless of update frequency
const sampledPosition$ = rawPosition$.pipe(
	sampleTime(500),
)

sampledPosition$.subscribe(pos => renderMapMarker(pos))

// ---

// Scenario: live telemetry dashboard — sample multiple streams
// at the same rate and combine for a single render pass

const cpuUsage$ = interval(50).pipe(map(() => readCpuUsage()))
const memUsage$ = interval(30).pipe(map(() => readMemUsage()))

const dashboardTick$ = interval(1000)

const dashboard$ = dashboardTick$.pipe(
	withLatestFrom(cpuUsage$, memUsage$),
	map(([_, cpu, mem]) => ({ cpu, mem, timestamp: Date.now() })),
	tap(snapshot => console.log('dashboard snapshot:', snapshot)),
)

dashboard$.subscribe(renderDashboard)
```

---

#### Gotchas

1. **No tick emission when source is silent** — `sampleTime` only emits if the source has produced at least one value since the last tick. If the source is quiet for an entire period, that tick is silently skipped. Do not rely on `sampleTime` to produce a guaranteed periodic heartbeat — use `interval` + `withLatestFrom` for that instead.

2. **The very last source value before completion may be missed** — If the source completes just after a tick and before the next one, the final value is lost. For finite streams where the last value matters, use `last()` or `takeLast(1)` instead.

3. **Lossy by design — not a buffer** — A common mistake is expecting `sampleTime` to forward all values grouped by period. It does not — it only keeps one. Use `bufferTime(ms)` if you need all values in each window as an array.

4. **Scheduler injection required for testing** — `sampleTime` uses `asyncScheduler` by default (real `setInterval`). Tests that do not inject a `TestScheduler` will run in real time and be slow or flaky. Always write `sampleTime(ms, testScheduler)` in test pipelines.

5. **Clock starts on subscription, not on first emission** — The first tick fires `period` ms after subscription, even if the source has not yet emitted anything. If the source is slow to start, the first several ticks may produce nothing.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `sample(notifier$)` | Samples on an **external Observable** rather than a fixed clock | You need event-driven sampling (e.g. sample on button click) |
| `auditTime(ms)` | Emits the most recent value **after `ms` of activity** — window resets on each source emission | You want the latest value after a burst settles, not on a fixed clock |
| `throttleTime(ms)` | Emits the **first** value in a window, silences the rest | You want immediate feedback on the first event, not the last |
| `debounceTime(ms)` | Emits only after `ms` of **silence** — resets on each emission | You want to react when the source stops, not on a fixed schedule |
| `bufferTime(ms)` | Collects **all** values in each period into an array | You need every value grouped — non-lossy periodic batching |

---

#### Decision Rule

> Use `sampleTime` when you need a **fixed-rate periodic snapshot** of a high-frequency stream and only the most recent value at each tick matters. Prefer `auditTime` when you want the latest value after a burst of activity, or `bufferTime` when you cannot afford to lose any values between ticks.
