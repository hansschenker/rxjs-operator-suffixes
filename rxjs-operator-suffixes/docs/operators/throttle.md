---
operator: throttle
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: true
date: 2026-03-29
---

### `throttle<T>(durationSelector: (value: T) => ObservableInput<unknown>, config?: ThrottleConfig)`

> Emits the first source value then ignores subsequent values until the Observable returned by `durationSelector` emits — a dynamic, value-aware version of `throttleTime`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — the silence window is driven by the duration Observable's timing |
| **Value-sensitive** | Yes — `durationSelector` receives each leading value and can tailor the silence window based on its content |
| **Lossy** | Yes — all values emitted during the active silence window are permanently discarded |
| **Completion required** | No — emits the leading value immediately; works correctly on infinite sources |

**Completion behaviour** — `throttle` emits the leading value and opens a silence window by subscribing to the duration Observable. During the window, source values are discarded. When the duration Observable emits, the window closes and the next source value becomes the new leading value. If the source never completes, `throttle` runs indefinitely.

**Lossy behaviour** — all source values emitted while the silence window is open are permanently discarded. Only the leading value (first in each window) is forwarded, unless `trailing: true` is configured — in which case the last value in the window is also forwarded.

---

#### Marble Diagram

Default (`leading: true, trailing: false`):
```
source:  --a--b--c------d--e--f--|
         throttle(() => interval(30))
output:  --a-----------d---------|
         (b,c discarded; e,f discarded)
```

With `{ leading: true, trailing: true }`:
```
source:  --a--b--c------d--e--f--|
output:  --a--------c---d------f--|
         (leading a, trailing c; leading d, trailing f)
```

---

#### Signature

```typescript
throttle<T>(
	durationSelector: (value: T) => ObservableInput<unknown>,
	config?: ThrottleConfig
): MonoTypeOperatorFunction<T>

interface ThrottleConfig {
	leading?: boolean   // emit the first value in the window (default: true)
	trailing?: boolean  // emit the last value in the window (default: false)
}
```

---

#### When to Use

- Rate-limit an event stream where the silence window duration depends on the emitted value (e.g. longer throttle for heavier operations).
- Throttle user interactions where the cooldown period is determined by the action type.
- Implement adaptive rate limiting — fast events get a short window, expensive events a longer one.
- Use `{ trailing: true }` when you want both the first and last event in each burst.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { throttle, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface ResizeEvent {
	width: number
	height: number
}

// Throttle resize events — larger resize changes get a longer cooldown
const resize$ = fromEvent<UIEvent>(window, 'resize').pipe(
	map((): ResizeEvent => ({
		width: window.innerWidth,
		height: window.innerHeight
	})),
	throttle((e: ResizeEvent) => {
		// Bigger dimension changes need longer cooldown
		const area = e.width * e.height
		const cooldown = area > 1_000_000 ? 500 : 200
		return timer(cooldown)
	})
)

resize$.subscribe((e: ResizeEvent) => relayout(e))
```

With `trailing: true` to also capture the final value of each burst:

```typescript
import { fromEvent } from 'rxjs'
import { throttle } from 'rxjs/operators'
import { timer } from 'rxjs'

// Capture both the first scroll event and the final settled position
const scroll$ = fromEvent(window, 'scroll').pipe(
	throttle(() => timer(100), { leading: true, trailing: true })
)

scroll$.subscribe(() => updateScrollPosition())
```

---

#### Gotchas

1. **`throttle` vs `throttleTime`** — `throttleTime(ms)` is a fixed-duration shorthand; `throttle(fn)` allows the duration to vary per value. Use `throttleTime` when the window is constant; use `throttle` when it must adapt to the value.

2. **`throttle` vs `debounce`** — `throttle` emits the *first* value in a burst and discards the rest until the window closes. `debounce` suppresses *all* values and only emits after a silence period. Use `throttle` for guaranteed responsiveness (always reacts within the window); use `debounce` when you only care about the final settled value.

3. **`trailing: false` (default) misses the last event in a burst** — if the final value in a rapid burst matters (e.g. the final scroll position), set `{ trailing: true }`. This emits both the leading and trailing values of each window.

4. **Duration Observable that never emits creates permanent silence** — if `durationSelector` returns `NEVER`, the silence window never closes after the first leading emission. All subsequent source values are discarded forever. Ensure duration Observables complete or emit.

5. **`leading: false, trailing: true` behaves like `auditTime`** — emitting only the last value in the window with no leading emission is functionally equivalent to `audit`. Use `audit` directly in that case for clarity.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `throttleTime` | Fixed-duration silence window | The window duration is constant |
| `debounce` | Dynamic silence after last emission; no leading value | You want to wait for the stream to settle |
| `audit` | Always emits the *last* value in the window (no leading) | You want the most recent value at the end of each window |
| `sample` | Emits the latest value when a separate notifier emits | The emission trigger is an external signal |

---

#### Decision Rule

> Use `throttle` when the **silence window duration varies per value** or when you need `leading`/`trailing` control. Use `throttleTime` for a fixed-duration window with the same semantics.
