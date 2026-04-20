---
operator: fromEventPattern
family: Creation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `fromEventPattern<T>(addHandler: (handler: NodeEventHandler) => TeardownLogic, removeHandler?: (handler: NodeEventHandler, signal?: TeardownLogic) => void, resultSelector?: (...args: unknown[]) => T)`

> Creates an Observable from any event source by accepting custom `addHandler` and `removeHandler` functions — the escape hatch for event APIs that `fromEvent` cannot handle directly.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Creation |
| **Time-sensitive** | No — emits on each event occurrence; timing is driven by the event source |
| **Value-sensitive** | No — does not inspect event content; all events are forwarded |
| **Lossy** | No — every event occurrence while subscribed is emitted |
| **Completion required** | No — never completes on its own; runs as long as the subscription is active |

**Completion behaviour** — `fromEventPattern` never completes automatically, identical to `fromEvent`. To bound it, compose with `take`, `takeUntil`, or `first`. On unsubscription, `removeHandler` is called to clean up the listener.

**Lossy behaviour** — not lossy. Every event fired while subscribed is emitted. Events before subscription are not replayed.

---

#### Marble Diagram

```
custom events: --------e--------e--e------
               fromEventPattern(add, remove)
output:        --------e--------e--e------...  (never completes)
```

---

#### Signature

```typescript
fromEventPattern<T>(
	addHandler: (handler: NodeEventHandler) => TeardownLogic,
	removeHandler?: (handler: NodeEventHandler, signal?: TeardownLogic) => void,
	resultSelector?: (...args: unknown[]) => T
): Observable<T | T[]>
```

- **`addHandler`** — called on subscription; receives the RxJS-managed `handler` function to register with the event source. May return a teardown token (e.g. a subscription object) which is passed to `removeHandler`.
- **`removeHandler`** — called on unsubscription; receives the same `handler` and the token returned by `addHandler`.
- **`resultSelector`** — optional projection of raw event arguments into a typed value.

---

#### When to Use

- Wrap a library with a non-standard event API (e.g. `source.on('event', handler)` / `source.off('event', handler)` with custom token management).
- Bridge a SignalR, socket.io, or other framework-specific event subscription.
- Wrap browser APIs that return subscription handles (e.g. `IntersectionObserver`, `MutationObserver`, `ResizeObserver`).
- Integrate with legacy code that uses custom publish/subscribe patterns.
- Handle event APIs that require the same handler reference for both add and remove.

---

#### Code Example

```typescript
import { fromEventPattern } from 'rxjs'
import { map, takeUntil, share } from 'rxjs/operators'

// Wrapping IntersectionObserver — not supported by fromEvent
function observeIntersection(element: Element): Observable<IntersectionObserverEntry[]> {
	return fromEventPattern<IntersectionObserverEntry[]>(
		(handler) => {
			const observer = new IntersectionObserver(handler, { threshold: 0.5 })
			observer.observe(element)
			return observer  // return token for removeHandler
		},
		(_handler, observer) => {
			(observer as IntersectionObserver).disconnect()
		}
	)
}

const card = document.getElementById('card')!
const visible$ = observeIntersection(card).pipe(
	map((entries: IntersectionObserverEntry[]) =>
		entries.some((e) => e.isIntersecting)
	)
)

visible$.subscribe((isVisible: boolean) => {
	console.log('Card visible:', isVisible)
})
```

Bridging socket.io:

```typescript
import { fromEventPattern } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { io, Socket } from 'socket.io-client'

interface ChatMessage {
	user: string
	text: string
}

const socket: Socket = io('https://chat.example.com')
const disconnect$ = new Subject<void>()

const messages$ = fromEventPattern<ChatMessage>(
	(handler) => socket.on('message', handler),
	(handler) => socket.off('message', handler)
).pipe(
	takeUntil(disconnect$)
)

messages$.subscribe((msg: ChatMessage) => displayMessage(msg))

// Clean disconnect
// disconnect$.next(); disconnect$.complete();
```

---

#### Gotchas

1. **`removeHandler` is optional but almost always needed** — omitting it means the event listener is never removed on unsubscription, causing a memory leak. Always provide `removeHandler` unless the event source manages its own cleanup.

2. **The `handler` reference must be consistent** — `addHandler` and `removeHandler` receive the same function reference so that `removeEventListener`-style APIs work correctly. Do not wrap or recreate the handler inside `addHandler`.

3. **`addHandler` return value is the teardown token** — if `addHandler` returns a value (e.g. an observer instance, a subscription token), it is passed as the second argument to `removeHandler`. Use this pattern for APIs like `IntersectionObserver` that return a handle rather than accepting handler removal by reference.

4. **Never completes — same as `fromEvent`** — compose with `takeUntil` or `take` to bound the lifetime, and ensure `removeHandler` cleans up correctly on teardown.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `fromEvent` | Handles standard `addEventListener`/`on` APIs automatically | Your target supports `EventTarget`, `EventEmitter`, or jQuery-like API |
| `from` | Converts arrays, Promises, iterables | Your source is a one-shot data structure |
| `new Observable(subscriber => {...})` | Full manual control with subscriber API | You need complete control over emission logic, not just event bridging |

---

#### Decision Rule

> Use `fromEventPattern` when your event source has a **non-standard registration API** that `fromEvent` cannot handle — custom `on`/`off` pairs, observer-pattern objects, or APIs that return a teardown handle. Prefer `fromEvent` for all standard DOM and Node.js event sources.
