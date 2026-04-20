---
operator: switchAll
family: Combination
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `switchAll<T>()`

> Subscribes to the most recently emitted inner Observable from the source (a higher-order Observable), unsubscribing from the previous inner whenever a new one arrives — the higher-order counterpart of `switchMap`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — switching is driven by new inner Observables arriving, not by timing |
| **Value-sensitive** | No — does not inspect the content of inner emissions |
| **Lossy** | Yes — all remaining emissions from any cancelled inner Observable are silently discarded |
| **Completion required** | No — emits inner values as they arrive; switches immediately when a new inner is emitted |

**Completion behaviour** — `switchAll` subscribes to each inner Observable emitted by the outer source, immediately unsubscribing from the previous one. The output does not complete until the outer source completes AND the last active inner completes. If the outer source never completes, `switchAll` never completes.

**Lossy behaviour** — `switchAll` is lossy. When a new inner Observable arrives, the previous inner is unsubscribed and any values it would have emitted after that point are permanently lost.

---

#### Marble Diagram

```
outer:    --[a$]-----[b$]-----[c$]--|
inner a$: ---1--2--3--4...
inner b$:            ---5--6...
inner c$:                  ---7--8--|
          switchAll()
output:   ----1--2-----5----7--8--|
```

When `b$` arrives, `a$` is cancelled — values `3`, `4`, ... are never emitted.
When `c$` arrives, `b$` is cancelled — value `6`, ... is never emitted.

---

#### Signature

```typescript
switchAll<O extends ObservableInput<unknown>>(): OperatorFunction<O, ObservedValueOf<O>>
```

---

#### When to Use

- Flatten a higher-order Observable when the projection step is already done upstream and only the latest inner matters.
- Switch between live data streams when the active stream is replaced (e.g. switching between different chat rooms or data feeds).
- Use explicitly when you want `switchMap` semantics but prefer to keep projection and flattening as separate steps.

---

#### Code Example

```typescript
import { Subject } from 'rxjs'
import { switchAll, map } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

interface Message {
	roomId: string
	text: string
}

// Switch to a new WebSocket stream each time the active room changes
const activeRoom$ = new Subject<string>()

const messages$ = activeRoom$.pipe(
	map((roomId: string) =>
		webSocket<Message>(`wss://chat.example.com/room/${roomId}`)
	),
	switchAll()  // unsubscribes from previous room's WebSocket when room changes
)

messages$.subscribe((msg: Message) => displayMessage(msg))

// Trigger room switch
activeRoom$.next('general')
activeRoom$.next('engineering')  // disconnects from 'general', connects to 'engineering'
```

---

#### Gotchas

1. **`switchAll` = `switchMap(x => x)`** — `switchMap` is the idiomatic shorthand. Use `switchAll` only when you already have a higher-order Observable and the projection is done upstream.

2. **Outer must emit Observables** — if the outer source emits plain values, `switchAll` will throw. Use `switchMap` with a projection instead.

3. **Unsubscription is not the same as cancellation** — stopping delivery of results in RxJS does not abort underlying work (HTTP requests, WebSocket connections) unless the inner Observable's teardown logic explicitly handles it.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `switchMap` | Combined project + flatten in one step | You have a plain value to project to an Observable |
| `mergeAll` | Subscribes to all inners concurrently | All results matter; order is unimportant |
| `concatAll` | Serialises inners; runs one at a time in order | All results matter; ordering is required |
| `exhaustAll` | Ignores new inners while one is active | Must not overlap; new inners are discarded |

---

#### Decision Rule

> Use `switchAll` when you already hold a higher-order Observable and **only the most recently emitted inner should be active**. Prefer `switchMap` when you can project and flatten in one step.
