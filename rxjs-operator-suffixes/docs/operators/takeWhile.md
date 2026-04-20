---
operator: takeWhile
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-24
---

### `takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean)`

> Pass values through as long as a predicate returns true, then complete — optionally including the first failing value.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — driven by value content, not timing |
| **Value-sensitive** | Yes — inspects every value via the predicate to decide whether to continue |
| **Lossy** | Yes — the failing value and all subsequent values are discarded (unless `inclusive: true`) |
| **Completion required** | No — completes itself when the predicate returns false |

**Completion behaviour** — `takeWhile` completes and unsubscribes from the source the moment its predicate returns `false`. It does not need the source to complete first. If the source completes before the predicate ever returns false, `takeWhile` completes normally having forwarded all values.

**Lossy behaviour** — By default (`inclusive: false`), the value that caused the predicate to return false is dropped and the stream completes. With `inclusive: true`, that boundary value is emitted as the last value before completion. All values after the boundary are always dropped.

---

#### Marble Diagram

```
// Default (inclusive: false) — boundary value dropped:
source:  --1--2--3--4--5--|
         takeWhile(x => x < 4)
output:  --1--2--3|

// inclusive: true — boundary value included:
source:  --1--2--3--4--5--|
         takeWhile(x => x < 4, true)
output:  --1--2--3--4|

// Predicate never false — passes all:
source:  --a--b--c--|
         takeWhile(x => x.length > 0)
output:  --a--b--c--|
```

---

#### Signature

```typescript
takeWhile<T>(
  predicate: (value: T, index: number) => boolean,
  inclusive?: boolean
): MonoTypeOperatorFunction<T>
```

The `index` argument is zero-based and increments for every value that passes the predicate (not every source emission).

---

#### When to Use

- Consume a stream of paginated results until a page comes back empty
- Take values from a polling stream until a "done" condition is met in the value itself
- Process a sequence of state updates until a terminal state is reached (e.g. `status === 'complete'`)
- Stop listening to user input events once a valid value has been entered
- Use `inclusive: true` when you need to react to the boundary value before stopping (e.g. emit the `status === 'error'` value for error handling, then stop)

---

#### Code Example

```typescript
import { interval, fromEvent } from 'rxjs'
import { takeWhile, map, switchMap, tap } from 'rxjs/operators'

// Scenario: poll a job status API until the job finishes

interface JobStatus {
	id: string
	status: 'pending' | 'running' | 'complete' | 'error'
	progress: number
}

const pollJobStatus$ = (jobId: string) =>
	interval(2000).pipe(
		switchMap(() => fetchJobStatus(jobId)),
		takeWhile(
			(job: JobStatus) => job.status === 'pending' || job.status === 'running',
			true   // inclusive: emit the terminal status before completing
		),
		tap((job: JobStatus) => updateProgressBar(job.progress)),
	)

pollJobStatus$('job-123').subscribe({
	next: (job: JobStatus) => {
		if (job.status === 'complete') showSuccess()
		if (job.status === 'error') showError()
	},
	complete: () => hideSpinner(),
})

// ---

// Scenario: MVU — replay stored actions until a reset action is encountered

const replayUntilReset$ = from(storedActions).pipe(
	takeWhile((action: Action) => action.type !== 'RESET', true),
	scan(reducer, initialState),
)
```

---

#### Gotchas

1. **Default drops the boundary value — use `inclusive: true` when you need it** — The most common mistake with `takeWhile`. If you poll until `status === 'complete'` and need to process that final status, use `inclusive: true` or you will never see the terminal value.

2. **Predicate is called for every value — keep it pure and cheap** — The predicate runs synchronously on every emission. Side effects in the predicate (logging, mutation) will fire multiple times with `retry` or `repeat`. Use `tap` for side effects instead.

3. **Different from `filter`** — `filter` removes non-matching values but keeps the stream alive. `takeWhile` completes the stream on the first non-match. Using `takeWhile` where you meant `filter` will silently truncate your stream.

4. **`index` resets on resubscription** — If the source is cold and the pipeline uses `retry`, `takeWhile` re-evaluates from index `0` on each resubscription. Index-based predicates (`(_, i) => i < 5`) behave like `take(5)` in this regard.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `take(n)` | Stops after **n values by position** — no content inspection | You know the count in advance |
| `takeUntil(notifier$)` | Stops based on an **external Observable**, not value content | The stop signal comes from outside the stream |
| `filter(pred)` | Removes non-matching values but **stream continues** | You want to suppress values, not stop the stream |
| `skipWhile(pred)` | **Skips** values while true, then passes all | You want to ignore the start of a stream, not the end |
| `first(pred)` | Emits only the **first matching value** then completes | You want exactly one value meeting a condition |

---

#### Decision Rule

> Use `takeWhile(pred)` when the **stop condition is encoded in the values themselves**. Use `inclusive: true` whenever you need to process the boundary value. Prefer `takeUntil` when the stop signal comes from an external Observable rather than the stream's own values.
