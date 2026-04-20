---
operator: audit
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: true
date: 2026-03-29
---

### `audit<T>(durationSelector: (value: T) => ObservableInput<unknown>)`

> Ignores source values for a dynamic silence window, then emits the **most recent** value when the window closes — the value-aware counterpart of `auditTime`, always forwarding the last value rather than the first.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — the silence window is driven by the duration Observable's timing |
| **Value-sensitive** | Yes — `durationSelector` receives the opening value and can tailor the window duration based on its content |
| **Lossy** | Yes — all values except the most recent one within the window are permanently discarded |
| **Completion required** | No — emits when the window closes; works correctly on infinite sources |

**Completion behaviour** — `audit` ignores source values until the duration Observable returned by `durationSelector` emits. When it does, the most recent source value is forwarded and the window resets. If a new source value arrives after the window has closed (i.e. no active window), `audit` opens a new window by calling `durationSelector` again. If the source completes while a window is open, the pending latest value is emitted before completion. If the source never completes, `audit` runs indefinitely.

**Lossy behaviour** — within each active window all intermediate values are silently overwritten; only the last value seen when the window closes is emitted. If the source emits N values during one window, N−1 are discarded.

---

#### Marble Diagram

```
source:  --a--b--c------d--e--f--g--|
         audit(() => interval(30))
output:  --------c-----------g-----|
         (a,b superseded by c; d,e,f superseded by g)
```

Compare with `throttle` (emits the *first* value):
```
source:  --a--b--c------d--e--f--g--|
         throttle(() => interval(30))
output:  --a-----------d------------|
         (audit: last; throttle: first)
```

---

#### Signature

```typescript
audit<T>(
	durationSelector: (value: T) => ObservableInput<unknown>
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Capture the latest value of a rapid event stream at adaptive intervals (e.g. rate-limit progress events where heavy payloads warrant a longer sampling window).
- Sample a stream at intervals determined by the content of the current value — expensive events should be sampled less frequently.
- Equivalent to `throttle({ leading: false, trailing: true })` — use `audit` when you explicitly want the last-value-in-window semantics without the `throttle` config noise.
- Rate-limit UI updates driven by WebSocket messages where the update frequency should scale with the message payload size.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { audit, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface ProgressEvent {
	loaded: number
	total: number
	payloadSizeKb: number
}

// Rate-limit upload progress events — large payloads update the UI less frequently
const progress$ = fromEvent<ProgressEvent>(uploader, 'progress').pipe(
	audit((e: ProgressEvent) => {
		// Large payloads: sample every 500 ms; small: every 100 ms
		const interval = e.payloadSizeKb > 500 ? 500 : 100
		return timer(interval)
	}),
	map((e: ProgressEvent) => Math.round((e.loaded / e.total) * 100))
)

progress$.subscribe((pct: number) => updateProgressBar(pct))
```

Value-aware window using a live Observable for the duration:

```typescript
import { fromEvent, interval } from 'rxjs'
import { audit, switchMap } from 'rxjs/operators'

interface SensorReading {
	critical: boolean
	value: number
}

// Critical sensor readings gate on a 50 ms window; non-critical gate on 500 ms
const sensor$ = fromEvent<SensorReading>(sensor, 'reading').pipe(
	audit((r: SensorReading) => interval(r.critical ? 50 : 500))
)

sensor$.subscribe((r: SensorReading) => updateDashboard(r))
```

---

#### Gotchas

1. **`audit` vs `throttle`** — `throttle` emits the *first* value in a window (leading); `audit` emits the *last* (trailing). Use `throttle` when you need a guaranteed immediate reaction; use `audit` when you want the most recent value at the end of the window.

2. **`audit` vs `debounce`** — `debounce` resets the window on every new value (stream must go quiet); `audit` opens the window on the first value and emits the latest at the end of a fixed interval regardless of subsequent activity. Use `debounce` for "wait until settled"; use `audit` for "sample latest on a timer".

3. **`audit` vs `sample`** — `sample(notifier$)` emits the latest value when an external notifier fires regardless of whether new values arrived since the last sample; `audit` opens its window only when a new source value arrives. Use `sample` when the clock is fully external; use `audit` when the window is triggered by source activity.

4. **Window only opens on source emission** — if the source goes silent, no window is open and nothing is emitted even if time passes. `auditTime` behaves identically but the window duration is fixed and expressed as milliseconds, not an Observable.

5. **Duration Observable that never emits creates a permanent silent window** — like `throttle` and `debounce`, if `durationSelector` returns `NEVER`, the current window never closes and the buffered value is never emitted. Always return a completing or emitting Observable from `durationSelector`.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `auditTime` | Fixed-duration window | The window duration is constant |
| `throttle` | Emits the *first* value in the window | You need a guaranteed leading emission |
| `debounce` | Resets window on each value; emits only after silence | You want to wait for the source to settle |
| `sample` | External notifier triggers emission | The sampling clock is independent of source activity |
| `throttle({ leading: false, trailing: true })` | Identical semantics | Prefer `audit` directly — it is cleaner for trailing-only use |

---

#### Decision Rule

> Use `audit` when you want the **most recent value at the end of a dynamic window** opened by each source emission. Use `auditTime` when the window duration is constant. Use `throttle` when you need the first value rather than the last.
