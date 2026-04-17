---
operator: debounceTime
family: Rate Limiting
lossy: true
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-27
---

### `debounceTime(dueTime, scheduler?)`

> Waits for the source to go silent for a specified duration, then emits the most recent value — resetting the timer on every new source emission.

<DebounceTimePlayground />

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Rate Limiting |
| **Time-sensitive** | Yes — the silence window is measured in wall-clock time |
| **Value-sensitive** | No — it does not inspect value content; only timing governs what passes |
| **Lossy** | Yes — all values emitted during the active silence window are discarded; only the last survives |
| **Completion required** | No |

**Completion behaviour** — `debounceTime` emits independently of source completion; it works normally on infinite streams. When the source completes, any pending debounced value is emitted immediately before the completion signal propagates downstream. This means a source that emits one final value and then completes will always deliver that last value even if the silence window hasn't elapsed yet.

**Lossy behaviour** — every value that arrives while the debounce timer is running causes the timer to reset and the previous pending value to be discarded. In a rapid burst of n values only the final value survives. All preceding values are silently dropped with no downstream notification.

---

#### Marble Diagram

```
source:  --a-b-c---------d--e----|
         debounceTime(40ms)
output:  -----------c---------e--|
```

The timer resets on every `b` and `c`; only `c` is emitted once silence holds for 40 ms.
`d` starts a new timer, then `e` resets it; `e` is emitted at source completion (before `|` propagates).

Source completes while timer is pending — pending value flushed first:

```
source:  --a-b-c--|
         debounceTime(40ms)
output:  ---------c--|
```

---

#### Signature

```typescript
debounceTime<T>(
  dueTime: number,
  scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T>
```

Only one overload — no config object (unlike `throttleTime`).

---

#### When to Use

- Delay a search API call until the user stops typing, rather than firing on every keystroke.
- Validate a form field only after the user pauses editing, avoiding flickering error messages.
- Coalesce rapid window resize events into a single layout recalculation after the resize gesture ends.
- Collapse a burst of state changes from a drag-and-drop operation into one final save call.
- Prevent a real-time filter from querying the backend on every character of a multi-character paste.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface SearchResult {
	id: number;
	title: string;
}

interface AjaxResponse {
	results: SearchResult[];
}

const searchInput = document.querySelector<HTMLInputElement>('#search')!;

// Classic search typeahead: debounce keystrokes, skip unchanged values,
// cancel in-flight requests with switchMap if a new query arrives.
const results$ = fromEvent<InputEvent>(searchInput, 'input').pipe(
	map((e): string => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((query: string) =>
		ajax.getJSON<AjaxResponse>(`/api/search?q=${encodeURIComponent(query)}`)
	),
	map((response): SearchResult[] => response.results),
);

results$.subscribe((results: SearchResult[]) => {
	console.log('Search results:', results);
});
```

MVU effect context — debounce a `QUERY_CHANGED` action before triggering a load:

```typescript
import { Subject } from 'rxjs';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

type Action =
	| { type: 'QUERY_CHANGED'; query: string }
	| { type: 'RESULTS_LOADED'; results: string[] }
	| { type: 'LOAD_FAILED'; error: unknown };

const action$ = new Subject<Action>();

// Effect: debounce rapid QUERY_CHANGED actions, then fetch
const searchEffect$ = action$.pipe(
	ofType<Action, 'QUERY_CHANGED'>('QUERY_CHANGED'),
	debounceTime(300),
	switchMap(({ query }) =>
		ajax.getJSON<{ results: string[] }>(`/api/search?q=${encodeURIComponent(query)}`).pipe(
			map(({ results }): Action => ({ type: 'RESULTS_LOADED', results })),
		)
	),
);

searchEffect$.subscribe(action => action$.next(action));
```

---

#### Gotchas

1. **`debounceTime` vs `throttleTime` — opposite guarantees** — `debounceTime` *requires silence* before emitting, so during a sustained stream (e.g. holding a key down) it will never emit at all. `throttleTime` guarantees at least one emission per window regardless of whether the source pauses. If you need periodic updates *during* activity, use `throttleTime`.

2. **Source completion flushes the pending value** — if your source completes (e.g. `take(1)`, `first()`, or a one-shot HTTP stream feeding into `debounceTime`), the pending value is emitted immediately at completion, bypassing the remaining timer. This is usually desirable but can surprise you if you're timing-dependent in tests.

3. **Scheduler is required in marble tests** — `debounceTime` uses `asyncScheduler` by default. In Vitest marble tests, pass the `TestScheduler`'s virtual-time scheduler as the second argument, or your tests will use real timers and be slow and flaky.

4. **Pairing with `switchMap` is a deliberate pattern** — `debounceTime` collapses the burst; `switchMap` cancels stale in-flight requests. You almost always want both together for search typeahead. Using `mergeMap` instead of `switchMap` after `debounceTime` is a common bug: if the user types quickly enough to beat the debounce, two requests can race and the older response may arrive last.

5. **300 ms is not universal** — 300 ms is a common default for search inputs, but it feels sluggish on fast connections and too fast for complex form validation. Tune to the specific UX. For resize/scroll coalescing, 50–100 ms is usually better.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `throttleTime(ms)` | Emits the *first* value immediately, then locks for `ms`; works during sustained activity | You need regular updates *while* the user is active (scroll, mousemove) |
| `auditTime(ms)` | Emits the *last* value at fixed `ms` intervals from the first emission; never resets | You want a fixed cadence sample of the latest value, not silence-gated |
| `sampleTime(ms)` | Emits on a fixed clock regardless of source activity; emits `undefined`-like if no value arrived | You want a heartbeat, not silence detection |
| `debounce(obs)` | Same as `debounceTime` but the silence window is defined by an Observable (dynamic duration) | The debounce window itself needs to be variable or driven by another stream |
| `distinctUntilChanged()` | Suppresses consecutive *equal* values, no time dimension | You want to drop value duplicates, not coalesce bursts |

---

#### Decision Rule

> Use `debounceTime` when **you only care about the final settled value after a burst** and can afford to wait for silence (search inputs, form validation, resize handlers). Prefer `throttleTime` instead when **you need at least one emission per interval during sustained activity** regardless of whether the source pauses.
