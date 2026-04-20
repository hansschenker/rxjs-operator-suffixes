---
operator: sample
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `sample<T>(notifier: ObservableInput<unknown>)`

> Emits the most recent source value each time a separate **notifier** Observable emits — decoupling the sampling clock from the source stream entirely.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Partial — not inherently time-driven, but the notifier is often time-based (e.g. `interval`) |
| **Value-sensitive** | No — does not inspect source value content; always emits the most recent value when the notifier fires |
| **Lossy** | Yes — all source values between notifier ticks are discarded; only the latest survives |
| **Completion required** | No — emits on notifier ticks; works correctly on infinite sources |

**Completion behaviour** — `sample` subscribes to both the source and the notifier. Each time the notifier emits, `sample` forwards the most recent source value (if any has arrived since the last sample). If the source completes, `sample` completes too. If the notifier completes, no further sampling occurs but the source subscription remains open until it also completes. If neither ever completes, `sample` runs indefinitely.

**Lossy behaviour** — between consecutive notifier ticks, any number of source values may arrive; only the most recent one is forwarded. All intermediate values are silently discarded. If the notifier ticks before any source value has arrived, nothing is emitted for that tick.

---

#### Marble Diagram

```
source:   --a--b--c-----d--e------f--|
notifier: ------x--------x------x---|
          sample(notifier)
output:   ------b--------d------f---|
          (a superseded by b; c superseded by d; e superseded by f)
```

If notifier fires when no new source value has arrived since the last sample:
```
source:   --a---------------b--|
notifier: ----x--x--x-------x--|
output:   ----a-----------b----|
          (second and third x: no new value — nothing emitted)
```

---

#### Signature

```typescript
sample<T>(
	notifier: ObservableInput<unknown>
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Snapshot the current application state (from a `BehaviorSubject`) on every user action or route change without subscribing directly to the state for each action.
- Sample the latest value of a high-frequency stream (sensor readings, mouse position) on a fixed clock controlled externally by a `requestAnimationFrame` Observable or `interval`.
- Capture the latest WebSocket message at each render frame in a game loop.
- Use `withLatestFrom` instead when you need the latest value from a secondary stream each time the primary stream emits (they are complementary patterns).
- Combine with `interval` when you want `sampleTime`-equivalent behaviour but the sampling interval is computed at runtime.

---

#### Code Example

```typescript
import { fromEvent, animationFrames } from 'rxjs'
import { sample, map } from 'rxjs/operators'

interface MousePosition {
	x: number
	y: number
}

// Sample the latest mouse position on every animation frame — smooth rendering
// without creating a separate subscription to the high-frequency mousemove event
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
	map((e: MouseEvent): MousePosition => ({ x: e.clientX, y: e.clientY }))
)

const rendered$ = mouseMove$.pipe(
	sample(animationFrames())
)

rendered$.subscribe((pos: MousePosition) => moveSprite(pos))
```

Snapshot state on every user action:

```typescript
import { Subject, BehaviorSubject } from 'rxjs'
import { sample, scan, startWith, shareReplay } from 'rxjs/operators'

interface AppState {
	count: number
	lastAction: string
}

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' }

const action$ = new Subject<Action>()

const state$ = action$.pipe(
	scan((s: AppState, a: Action): AppState => {
		switch (a.type) {
			case 'INCREMENT': return { count: s.count + 1, lastAction: 'increment' }
			case 'DECREMENT': return { count: s.count - 1, lastAction: 'decrement' }
			case 'RESET':     return { count: 0, lastAction: 'reset' }
		}
	}, { count: 0, lastAction: '' }),
	startWith({ count: 0, lastAction: '' }),
	shareReplay(1)
)

// Snapshot state only when the save button is clicked — not on every state change
const saveClick$ = fromEvent(saveButton, 'click')

const stateOnSave$ = state$.pipe(sample(saveClick$))

stateOnSave$.subscribe((s: AppState) => persistToServer(s))
```

---

#### Gotchas

1. **`sample` vs `withLatestFrom`** — `withLatestFrom(secondary$)` attaches the latest secondary value to each *primary* emission; `sample(notifier$)` emits the latest *source* value on each *notifier* emission. They are opposite perspectives of the same relationship — choose based on which stream should drive the output.

2. **No emission if source has not produced a new value since last sample** — `sample` silently skips notifier ticks when no new source value has arrived. This differs from `sampleTime`, which also skips silently. If you need a default value on silent ticks, use `combineLatest` with a clock Observable instead.

3. **`sample` vs `auditTime` / `throttleTime`** — `auditTime`/`throttleTime` open their window in response to *source* activity; `sample` ticks independently of source activity. Use `sample` when the sampling clock is truly external; use `auditTime` when the window should only be active during source bursts.

4. **Notifier completion stops sampling** — if the notifier Observable completes (e.g. `take(5)`), sampling stops even if the source continues. The source subscription is not automatically unsubscribed. Be intentional about the notifier lifetime.

5. **`animationFrames()` is the idiomatic render-loop notifier** — for DOM rendering, `sample(animationFrames())` is the canonical pattern: decouple the data rate from the render rate cleanly without `requestAnimationFrame` callbacks.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `sampleTime` | Fixed-interval clock built in | The sampling interval is a constant known at build time |
| `auditTime` | Window opened by source activity, fixed duration | You want trailing-value semantics driven by source bursts |
| `throttleTime` | Emits the *first* value in a fixed window | You need a leading emission with a fixed cooldown |
| `withLatestFrom` | Attaches latest secondary value to each primary emission | The *primary* stream drives output, not an external clock |
| `debounceTime` | Emits after source goes quiet for N ms | You want to wait for the source to settle before emitting |

---

#### Decision Rule

> Use `sample` when the **emission clock is fully external** — driven by a notifier Observable independent of source activity. Use `sampleTime` for a constant-interval clock. Use `withLatestFrom` when the primary stream should drive output and the secondary is just context.
