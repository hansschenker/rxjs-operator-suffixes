---
operator: fromEvent
family: Creation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `fromEvent<T>(target: FromEventTarget<T>, eventName: string, options?: EventListenerOptions | ((...args: unknown[]) => T))`

> Creates an Observable that emits whenever the specified event fires on the given target — wrapping DOM elements, Node.js EventEmitters, jQuery-like objects, or any object with `add/removeEventListener` into a reactive stream.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Creation |
| **Time-sensitive** | No — emits on each event occurrence; timing is driven by the event source, not by the operator |
| **Value-sensitive** | No — does not inspect event content; all events are forwarded |
| **Lossy** | No — every event occurrence is emitted; the Observable is hot relative to the event target |
| **Completion required** | No — never completes on its own; runs as long as the subscription is active |

**Completion behaviour** — `fromEvent` never completes automatically. It runs indefinitely, emitting on every matching event. To bound it, compose with `take`, `takeUntil`, or `first`. Unsubscribing removes the event listener cleanly via the teardown logic.

**Lossy behaviour** — not lossy. Every event fired by the target while subscribed is emitted. Events that fire before subscription starts are not replayed (the stream is hot from the event target's perspective).

---

#### Marble Diagram

```
DOM clicks: --------c--------c--c------c--|
            fromEvent(el, 'click')
output:     --------c--------c--c------c--...  (never completes)
```

---

#### Signature

```typescript
// DOM EventTarget
fromEvent<T extends Event>(
	target: EventTarget,
	eventName: string,
	options?: EventListenerOptions
): Observable<T>

// Node.js EventEmitter
fromEvent<T>(
	target: NodeStyleEventEmitter,
	eventName: string
): Observable<T>

// With result selector (projects the raw event arguments)
fromEvent<T>(
	target: FromEventTarget<unknown>,
	eventName: string,
	resultSelector: (...args: unknown[]) => T
): Observable<T>
```

Supported target types: `EventTarget` (DOM), `NodeStyleEventEmitter` (Node.js `EventEmitter`), `NodeCompatibleEventEmitter`, jQuery-like objects (with `on`/`off`).

---

#### When to Use

- Convert any DOM event (click, keydown, scroll, resize, input) into a reactive stream.
- Bridge Node.js `EventEmitter` events (file system, HTTP server, child process) into RxJS.
- Create a reactive form input stream from a text field's `input` event.
- Listen to custom events dispatched with `dispatchEvent`.
- Combine multiple event streams with `merge` for unified handling.

---

#### Code Example

```typescript
import { fromEvent, merge } from 'rxjs'
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface SearchResult {
	id: number
	title: string
}

const input = document.getElementById('search') as HTMLInputElement

// Reactive search typeahead from DOM input events
const search$ = fromEvent<InputEvent>(input, 'input').pipe(
	map((e: InputEvent) => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((term: string) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${encodeURIComponent(term)}`)
	)
)

search$.subscribe((results: SearchResult[]) => renderResults(results))
```

Combining multiple events:

```typescript
import { fromEvent, merge } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'

const destroy$ = fromEvent(window, 'beforeunload')

// Listen to both keyboard and mouse — unsubscribe on page unload
const activity$ = merge(
	fromEvent<MouseEvent>(document, 'mousemove').pipe(map(() => 'mouse')),
	fromEvent<KeyboardEvent>(document, 'keydown').pipe(map(() => 'keyboard'))
).pipe(
	takeUntil(destroy$)
)

activity$.subscribe((source: string) => resetIdleTimer(source))
```

Node.js EventEmitter:

```typescript
import { fromEvent } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'
import { EventEmitter } from 'events'

interface DataEvent {
	id: number
	payload: string
}

const emitter = new EventEmitter()
const close$ = fromEvent(emitter, 'close')

const data$ = fromEvent<DataEvent>(emitter, 'data').pipe(
	map((event: DataEvent) => event.payload),
	takeUntil(close$)
)

data$.subscribe((payload: string) => process(payload))
```

---

#### Gotchas

1. **Never completes — always add a termination operator** — `fromEvent` runs indefinitely. Always compose with `takeUntil(destroy$)`, `take(n)`, or `first()` to prevent subscription leaks, especially in component lifecycle contexts.

2. **Events before subscription are missed** — `fromEvent` is not a replay stream. If events fire before `.subscribe()` is called, they are lost. This is the expected "hot" behaviour of DOM events; use `shareReplay` only if you have a legitimate need to cache past events.

3. **`options` for passive listeners** — for high-frequency events like `scroll` or `touchmove`, pass `{ passive: true }` as the `options` argument to improve scroll performance. `fromEvent(el, 'scroll', { passive: true })`.

4. **Multiple arguments from Node.js emitters** — Node.js `EventEmitter` callbacks can receive multiple arguments. `fromEvent` only captures the first argument by default. Use the `resultSelector` overload to collect all arguments: `fromEvent(emitter, 'data', (...args) => args)`.

5. **Teardown removes the listener** — unsubscribing from a `fromEvent` Observable cleanly calls `removeEventListener` / `removeListener`. Always unsubscribe (via `takeUntil`, `Subscription.unsubscribe`, or `async pipe` in frameworks) to avoid memory leaks from orphaned listeners.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `fromEventPattern` | Manual add/remove handler control | Target has non-standard event registration API |
| `from` | Converts arrays, Promises, iterables | Your source is a one-shot data structure, not an event stream |
| `interval` | Emits on a timer, not on events | You need time-based emission |
| `Subject` | Manually push values into an Observable | You control when events are emitted programmatically |

---

#### Decision Rule

> Use `fromEvent` when your source is a **DOM element, Node.js EventEmitter, or any object with standard `addEventListener`/`removeEventListener`**. Use `fromEventPattern` when the event registration API is non-standard (e.g. a custom `on`/`off` pair with additional arguments).
