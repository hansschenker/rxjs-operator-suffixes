---
operator: bufferWhen
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `bufferWhen<T>(closingSelector: () => ObservableInput<unknown>)`

> Collects source values into a buffer and emits the buffer when an Observable returned by `closingSelector` emits — then immediately opens a new buffer by calling `closingSelector` again.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but `closingSelector` typically returns a time-based Observable |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values are collected into exactly one buffer; none are discarded |
| **Completion required** | No — emits on each window close; works correctly on infinite sources |

**Completion behaviour** — `bufferWhen` opens the first buffer immediately on subscription by calling `closingSelector()`. When the returned closing Observable emits, the current buffer is emitted and a new one is opened by calling `closingSelector()` again. Windows are strictly sequential — there is no overlap. When the source completes, the current buffer is emitted as a final (possibly empty) array before the completion signal.

**Lossy behaviour** — not lossy. Every source value is collected into exactly one buffer and emitted when that buffer closes.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--f--g--|
         bufferWhen(() => timer(randomMs))
         (first window closes after 30ms, second after 50ms)
output:  ------[a,b]----------[c,d,e,f]--[g]|
```

Compared to `buffer(notifier$)` — the key difference: `bufferWhen` refreshes the closing Observable for each new window; `buffer` reuses the same notifier throughout:
```
buffer(interval(30)):   re-uses interval — windows are equal length
bufferWhen(() => timer(randomMs)): each window may have a different duration
```

---

#### Signature

```typescript
bufferWhen<T>(
	closingSelector: () => ObservableInput<unknown>
): OperatorFunction<T, T[]>
```

Note: `closingSelector` takes no arguments (unlike `bufferToggle`'s `closingSelector`, which receives the opening value).

---

#### When to Use

- Implement adaptive batching where the window duration changes after each flush (e.g. back-off strategy — longer window after a large batch, shorter after a small one).
- Collect events until an external condition is met (e.g. buffer until a "ready" signal, then restart).
- Recreate the closing Observable fresh for each window — necessary when the closing Observable is stateful or one-shot (e.g. a `Subject` that fires once).
- Replace `buffer(notifier$)` when the notifier is a finite Observable that completes after one emission — `bufferWhen` will correctly restart the closing Observable for the next window.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { bufferWhen, filter, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface LogEntry {
	level: 'info' | 'warn' | 'error'
	message: string
}

// Collect log entries; flush every 1–3 seconds (random back-off simulation)
const log$ = new Subject<LogEntry>()

const flushed$ = log$.pipe(
	bufferWhen(() => timer(1000 + Math.random() * 2000)),
	filter((batch: LogEntry[]) => batch.length > 0)
)

flushed$.subscribe((entries: LogEntry[]) => {
	console.log(`Flushing ${entries.length} log entries`)
	sendToLogServer(entries)
})
```

Dynamic window — short if last batch was large, long if small (adaptive):

```typescript
import { Subject } from 'rxjs'
import { bufferWhen, map, tap } from 'rxjs/operators'
import { timer } from 'rxjs'

interface Message {
	id: number
	payload: string
}

const messages$ = new Subject<Message>()

let lastBatchSize = 0

const adaptive$ = messages$.pipe(
	bufferWhen(() => {
		// Back off if the last batch was large — give the consumer time to breathe
		const wait = lastBatchSize > 100 ? 2000 : 500
		return timer(wait)
	}),
	tap((batch: Message[]) => { lastBatchSize = batch.length })
)

adaptive$.subscribe((batch: Message[]) => processBatch(batch))
```

---

#### Gotchas

1. **`bufferWhen` vs `buffer`** — `buffer(notifier$)` subscribes to the notifier once and uses it for all windows; `bufferWhen(() => ...)` calls the factory function afresh for each new window. Use `bufferWhen` when the closing Observable is stateful, one-shot, or must vary between windows.

2. **`bufferWhen` vs `bufferToggle`** — `bufferWhen` produces non-overlapping sequential windows with no opening signal (windows open immediately after the previous closes); `bufferToggle` supports overlapping windows with separate opening and closing signals. Use `bufferWhen` for sequential adaptive batching; `bufferToggle` for overlapping or gated windows.

3. **Empty buffers are emitted** — if `closingSelector` fires before any source values arrive, an empty array `[]` is emitted. Filter these with `filter(b => b.length > 0)` if empty batches are not useful.

4. **`closingSelector` must return a fresh Observable each call** — do not return the same cold Observable instance if it carries state. The factory is called once per window; each returned Observable controls exactly one window boundary.

5. **Windows are strictly sequential** — unlike `bufferToggle`, there is no overlap. The next window opens the instant the previous one closes. If the closing Observable emits multiple times, only the first emission closes the window; subsequent emissions are ignored for that window.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `buffer` | Single notifier reused across all windows | The closing signal is stateless and reusable |
| `bufferCount` | Count-based windows | Batch by number of values |
| `bufferTime` | Fixed-time windows | Batch by fixed interval |
| `bufferToggle` | Separate opening and closing notifiers; overlapping windows | Windows overlap or opening is event-driven |
| `windowWhen` | Same semantics but emits inner Observables | Streaming operator-composable access to each window |

---

#### Decision Rule

> Use `bufferWhen` when the **closing Observable must be recreated for each window** — for adaptive, stateful, or one-shot window boundaries. Use `buffer(notifier$)` when the same stateless notifier can be reused across all windows.
