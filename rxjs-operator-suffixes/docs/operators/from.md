---
operator: from
family: Creation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike)`

> Converts almost anything into an Observable — arrays, iterables, Promises, other Observables, or async iterables — emitting each item synchronously and completing immediately.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Creation |
| **Time-sensitive** | No — emits synchronously in order; no timing involved |
| **Value-sensitive** | No — does not inspect values; converts the input structure directly |
| **Lossy** | No — every item from the input is emitted exactly once |
| **Completion required** | No — `from` itself is the source; it completes after emitting all items |

**Completion behaviour** — `from` subscribes eagerly and emits all values synchronously (for arrays and iterables) or as resolved (for Promises), then completes. For a Promise it emits a single value on resolution and completes; on rejection it errors. For async iterables it emits each yielded value as it arrives, completing when the async iterator is done.

**Lossy behaviour** — not lossy. Every element from the input collection is emitted exactly once before completion.

---

#### Marble Diagram

```
from([1, 2, 3])
output:  (123)|   ← synchronous: 1, 2, 3 emitted and completed in same tick

from(Promise.resolve('hello'))
output:  -(hello)|   ← async: emits on next microtask

from('abc')   ← string is iterable
output:  (abc)|   ← emits 'a', 'b', 'c' synchronously
```

---

#### Signature

```typescript
// Accepts any ObservableInput: array, iterable, Promise, Observable, AsyncIterable
from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>

// ObservableInput covers:
// T[] | Iterable<T> | Promise<T> | Observable<T> | AsyncIterable<T>
```

The optional `scheduler` argument schedules emissions on the given scheduler instead of synchronously (rarely needed outside of testing).

---

#### When to Use

- Convert a static array of items into a stream to process with RxJS operators.
- Wrap a Promise in an Observable to integrate with an RxJS pipeline.
- Convert an async iterable (e.g. an async generator, a Web Streams `ReadableStream`) into an Observable.
- Bridge a third-party library that returns arrays or Promises into a reactive pipeline.
- Emit a fixed set of test values in a unit test without a real data source.

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { mergeMap, map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface User {
	id: number
	name: string
}

const userIds = [1, 2, 3, 4, 5]

// Convert array to stream, then fetch each user in parallel
const users$ = from(userIds).pipe(
	mergeMap((id: number) => ajax.getJSON<User>(`/api/users/${id}`))
)

users$.subscribe((user: User) => console.log(user))
```

Wrapping a Promise:

```typescript
import { from } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { of } from 'rxjs'

interface Config {
	apiUrl: string
	timeout: number
}

// Bridge fetch() Promise into an Observable pipeline
const config$ = from(
	fetch('/config.json').then((res) => res.json() as Promise<Config>)
).pipe(
	catchError((err: Error) => {
		console.error('Config load failed:', err.message)
		return of<Config>({ apiUrl: '/api', timeout: 5000 })
	})
)
```

Async iterable (e.g. paginated API):

```typescript
import { from } from 'rxjs'
import { mergeAll } from 'rxjs/operators'

async function* fetchPages(): AsyncGenerator<string[]> {
	let page = 1
	while (true) {
		const res = await fetch(`/api/items?page=${page}`)
		const data: string[] = await res.json()
		if (data.length === 0) break
		yield data
		page++
	}
}

// Stream each page as it arrives
const items$ = from(fetchPages()).pipe(
	mergeAll()  // flatten page arrays into individual items
)
```

---

#### Gotchas

1. **`from(promise)` is not cancellable** — unlike `ajax` from `rxjs/ajax`, a native `fetch` or arbitrary Promise wrapped in `from` cannot be aborted when the subscription is unsubscribed. The Promise runs to completion regardless. Use `ajax` or wire an `AbortController` manually if cancellation is needed.

2. **`from(observable)` just re-wraps** — passing an existing RxJS Observable to `from` returns a new Observable that subscribes to it. This is a no-op in most cases; just use the Observable directly. It is useful for normalising `ObservableInput` in generic code.

3. **Synchronous emission can surprise downstream operators** — `from([1,2,3])` emits all three values synchronously before any subscriber code runs between them. Operators like `debounceTime` will suppress all but the last because they all arrive in the same tick. Add `observeOn(asyncScheduler)` if you need async spacing.

4. **Strings are iterable** — `from('hello')` emits `'h'`, `'e'`, `'l'`, `'l'`, `'o'` as separate characters. This is correct but often unexpected. Use `of('hello')` to emit the whole string as a single value.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `of` | Emits its arguments as individual values (not an array) | You want to emit a fixed set of literal values |
| `fromEvent` | Converts a DOM/Node event emitter into an Observable | Your source is an ongoing event stream |
| `defer` | Creates the Observable lazily per subscription | The source should be re-evaluated on each subscribe |
| `ajax` | HTTP-specific Observable with built-in abort support | You are making HTTP requests |

---

#### Decision Rule

> Use `from` when you need to **convert an existing data structure** (array, Promise, iterable, async iterable) into an Observable. Use `of` for emitting literal values and `fromEvent` for DOM/Node event streams.
