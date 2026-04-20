---
operator: takeUntil
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-24
---

### `takeUntil<T>(notifier: ObservableInput<unknown>)`

> Pass all source values through until a notifier Observable emits, then complete and unsubscribe from both.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — driven by notifier emission, not a clock |
| **Value-sensitive** | No — never inspects source value content; the notifier value is ignored too |
| **Lossy** | Yes — all values after the notifier emits are discarded |
| **Completion required** | No — completes itself when notifier emits; source completion is not required |

**Completion behaviour** — `takeUntil` subscribes to both the source and the notifier simultaneously. The moment the notifier emits its first value, `takeUntil` completes and unsubscribes from both. If the source completes before the notifier fires, `takeUntil` completes normally. If the notifier errors, that error propagates downstream.

**Lossy behaviour** — Everything the source emits after the notifier fires is silently dropped. The notifier's own emitted value is never forwarded — it acts purely as a signal.

---

#### Marble Diagram

```
source:    --a--b--c--d--e--|
notifier:  ----------n--|
           takeUntil(notifier)
output:    --a--b--c|

// Source completes before notifier — normal completion:
source:    --a--b--|
notifier:  --------------n--|
output:    --a--b--|

// Notifier completes without emitting — source runs to its own completion:
source:    --a--b--c--|
notifier:  ----------|   (completes, never emits)
output:    --a--b--c--|
```

---

#### Signature

```typescript
takeUntil<T>(notifier: ObservableInput<unknown>): MonoTypeOperatorFunction<T>
```

`notifier` can be any `ObservableInput` — an Observable, Promise, or array. Only the first emission matters; subsequent ones are ignored because the stream has already completed.

---

#### When to Use

- **Component teardown** — the single most common RxJS pattern: `takeUntil(destroy$)` to unsubscribe all streams when a component unmounts
- Stop a polling interval when the user navigates away or a route changes
- Cancel an ongoing operation when a "cancel" button is clicked
- Limit a shared stream to a specific lifecycle window (e.g. active only while a modal is open)
- Race a long-running operation against a timeout signal

---

#### Code Example

```typescript
import { Subject, fromEvent, interval } from 'rxjs'
import { takeUntil, switchMap, map, tap } from 'rxjs/operators'

// Scenario: component lifecycle teardown — canonical RxJS pattern

class MusicianListComponent {
	private readonly destroy$ = new Subject<void>()

	init(): void {
		// All subscriptions use takeUntil(this.destroy$)
		fromEvent(window, 'resize').pipe(
			takeUntil(this.destroy$),
			map(() => window.innerWidth),
		).subscribe(width => this.updateLayout(width))

		interval(30_000).pipe(
			takeUntil(this.destroy$),
			switchMap(() => this.musicianService.loadAll()),
		).subscribe(musicians => this.updateState(musicians))
	}

	destroy(): void {
		this.destroy$.next()    // triggers all takeUntil completions
		this.destroy$.complete()
	}

	private updateLayout(width: number): void { /* ... */ }
	private updateState(musicians: Musician[]): void { /* ... */ }
}

// ---

// Scenario: cancel an in-flight search when the user clears the input

const cancel$ = fromEvent(clearBtn, 'click')

fromEvent<InputEvent>(searchInput, 'input').pipe(
	map(e => (e.target as HTMLInputElement).value),
	switchMap(query =>
		fetchResults(query).pipe(
			takeUntil(cancel$),   // cancel mid-flight if clear is clicked
		)
	),
).subscribe(results => renderResults(results))
```

---

#### Gotchas

1. **`destroy$` must be a `Subject`, not a plain Observable** — The notifier needs to be something you can imperatively trigger (`destroy$.next()`). A cold Observable won't fire unless subscribed, and a `BehaviorSubject` will fire immediately (completing the stream before it starts). Use a plain `Subject<void>`.

2. **Always call `destroy$.complete()` after `destroy$.next()`** — If you only call `next()`, the Subject itself stays open and may hold references. Calling `complete()` closes it cleanly.

3. **`takeUntil` must be last in the pipe** — A common footgun: placing `takeUntil` before operators like `shareReplay`, `catchError`, or `retry` can cause the teardown to not propagate correctly, or the stream to be re-subscribed after `takeUntil` has fired. Always put `takeUntil` as the last operator in the pipe.

4. **Notifier completing (not emitting) does not stop the source** — If the notifier Observable completes without emitting a value, `takeUntil` lets the source continue running. Only a `next` emission from the notifier triggers completion. This surprises developers who use `EMPTY` as a notifier expecting it to stop the stream.

5. **Multiple streams, one `destroy$`** — This is the pattern's strength: a single `Subject` can be the notifier for dozens of streams. All complete simultaneously when `destroy$.next()` is called.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `takeWhile(pred)` | Stops based on **source value content** | The stop condition is encoded in the values themselves |
| `take(n)` | Stops after **n values by position** | You know the count in advance |
| `first()` | Emits one value then completes — no external notifier | You only ever need the first value |
| `skipUntil(notifier$)` | **Skips** values until notifier fires, then passes all | You want to delay the start, not limit the end |
| `exhaustMap` | Ignores new source values while inner is active | You want to drop concurrent triggers, not stop the stream |

---

#### Decision Rule

> Use `takeUntil(notifier$)` when the **stop signal is an external event** — especially for component lifecycle teardown. It is the standard subscription cleanup pattern in reactive architectures. Prefer `takeWhile` when the stop condition lives in the source values themselves.

---

#### MVU Note

In MVU architectures, `takeUntil(destroy$)` is the recommended teardown for all effect pipelines and view subscriptions. Register a single `destroy$: Subject<void>` per component or store slice and pipe every long-lived subscription through it:

```typescript
const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1),
	takeUntil(destroy$),
)
```
