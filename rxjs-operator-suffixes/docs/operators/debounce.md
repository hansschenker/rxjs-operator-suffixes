---
operator: debounce
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: true
date: 2026-03-29
---

### `debounce<T>(durationSelector: (value: T) => ObservableInput<unknown>)`

> Suppresses source values and only emits the most recent value once the Observable returned by `durationSelector` emits — a dynamic, value-aware version of `debounceTime`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — the silence window is driven by the duration Observable's timing |
| **Value-sensitive** | Yes — `durationSelector` receives each source value and can tailor the silence window based on its content |
| **Lossy** | Yes — all values emitted during an active silence window are permanently discarded; only the trailing value survives |
| **Completion required** | No — emits on silence window close, not on source completion; works correctly on infinite sources |

**Completion behaviour** — `debounce` opens a silence window by subscribing to the duration Observable returned by `durationSelector` for each source value. If a new value arrives before the window closes, the previous value is discarded and a new window opens for the new value. When the window Observable emits, the most recent source value is forwarded. If the source completes while a silence window is open, the pending value is emitted before the completion signal. If the source never completes, `debounce` runs indefinitely.

**Lossy behaviour** — all source values emitted while a silence window is open are permanently discarded; only the last value before the window closes survives. In a rapid burst of N values, N−1 values are dropped and only the final one is forwarded.

---

#### Marble Diagram

```
source:  --a--b----c-d-e----------f--|
         debounce(() => interval(30))
output:  -------b-----------e--------f--|
         (a superseded by b; c,d superseded by e; f emits at source complete)
```

Compared to `debounceTime(30)` with a constant window:
```
source:  --a--b----c-d-e----------f--|
         debounceTime(30)
output:  -------b-----------e--------f--|
```

With value-aware window — larger values get longer silence:
```
source:  --small--big--------small--|
         debounce(v => timer(v.large ? 500 : 100))
output:  ---------big---------small--|
```

---

#### Signature

```typescript
debounce<T>(
	durationSelector: (value: T) => ObservableInput<unknown>
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Rate-limit a search typeahead where the debounce duration depends on input length or complexity (e.g. very short inputs get a longer pause to avoid expensive partial-match queries).
- Throttle form validation where certain field types (e.g. a complex address parser) need a longer silence window than simple text fields.
- Implement adaptive rate limiting — cheap operations settle quickly, expensive ones wait longer.
- Debounce WebSocket messages where the silence window is determined by the message type or priority.
- Use in place of `debounceTime` whenever the wait period must vary based on the emitted value.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { debounce, map, switchMap } from 'rxjs/operators'
import { timer, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'

interface SearchQuery {
	term: string
	category: 'simple' | 'advanced'
}

interface SearchResult {
	id: number
	title: string
}

const input = document.getElementById('search') as HTMLInputElement

const search$ = fromEvent<Event>(input, 'input').pipe(
	map((): SearchQuery => ({
		term: input.value,
		category: input.value.includes(':') ? 'advanced' : 'simple'
	})),
	// Advanced queries (with operators like "author:foo") need longer silence
	debounce((q: SearchQuery) => timer(q.category === 'advanced' ? 600 : 300)),
	switchMap((q: SearchQuery) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${encodeURIComponent(q.term)}`)
	)
)

search$.subscribe((results: SearchResult[]) => renderResults(results))
```

With a minimum-length guard — very short queries settle longer to avoid noisy results:

```typescript
import { fromEvent } from 'rxjs'
import { debounce, map, filter } from 'rxjs/operators'
import { timer } from 'rxjs'

const keyup$ = fromEvent<KeyboardEvent>(input, 'keyup').pipe(
	map((): string => input.value.trim()),
	filter((term: string) => term.length > 0),
	// Short inputs wait longer — they are more ambiguous and expensive to search
	debounce((term: string) => {
		const wait = term.length <= 2 ? 800 : term.length <= 5 ? 400 : 200
		return timer(wait)
	})
)
```

---

#### Gotchas

1. **`debounce` vs `debounceTime`** — `debounceTime(ms)` is a constant-window shorthand; `debounce(fn)` allows the window to vary per value. Reach for `debounceTime` unless the window must adapt to the value; the simpler form is clearer and easier to test.

2. **`debounce` vs `throttle`** — `debounce` suppresses all values and only emits after the stream goes quiet. `throttle` guarantees a leading emission and then suppresses. Use `debounce` when you only care about the final settled value; use `throttle` when you need guaranteed responsiveness with at least one emission per burst.

3. **Duration Observable that never emits creates permanent suppression** — if `durationSelector` returns `NEVER`, the window never closes and all source values are permanently discarded after the first emission. Ensure duration Observables complete or emit.

4. **Pending value is flushed on source completion** — if a value is sitting in the silence window when the source completes, `debounce` emits it before the completion signal. This differs from cancelling the window and completing silently. Expect one final emission at completion if a value was pending.

5. **`durationSelector` is called for every source value** — the previous duration Observable is unsubscribed as soon as a new source value arrives. Expensive Observable factories called on every keystroke (e.g. a DB query) would be a mistake; use a lightweight creator like `timer` as the duration Observable.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `debounceTime` | Fixed-duration silence window | The window duration is constant and known at build time |
| `throttle` | Emits the *first* value in a burst; value-aware silence window | You need guaranteed responsiveness — always react within the window |
| `throttleTime` | Fixed-duration, leading-emission throttle | Fixed window, need at least one emission per burst |
| `audit` | Always emits the *last* value at the end of a fixed window | You want periodic sampling of the latest value, not silence-based gating |
| `sampleTime` | Emits the latest value on a fixed clock tick | The emission clock is external and independent of the source |

---

#### Decision Rule

> Use `debounce` when the **silence window duration must vary per emitted value**. Use `debounceTime` when the window is constant — it is simpler and easier to test with `TestScheduler`.
