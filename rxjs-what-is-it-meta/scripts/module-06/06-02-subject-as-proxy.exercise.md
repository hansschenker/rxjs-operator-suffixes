---
module: 6
lesson: "6.2"
title: Subject as Proxy
exercise: Refactor a service that exposes its Subject directly so only the service can dispatch values.
difficulty: intermediate
---

## Scenario

A `ChatService` exposes its internal `messages$` Subject as a public property. A rogue component calls `chatService.messages$.next(fakeMessage)`, injecting fabricated messages that bypass server validation. The fix must expose a read-only Observable to consumers while keeping the writable Subject private to the service.

## Starter Code

```typescript
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

interface ChatMessage { id: string; author: string; text: string; }

// BUG: Subject exposed directly — any caller can inject values
class ChatService {
	readonly messages$ = new Subject<ChatMessage>();

	connect(): void {
		// Simulated WebSocket messages
		setTimeout(() => this.messages$.next({ id: '1', author: 'Alice', text: 'Hello' }), 1000);
	}
}

const chat = new ChatService();
chat.connect();

// Any caller can inject fake messages — encapsulation broken:
chat.messages$.next({ id: 'fake', author: 'Attacker', text: 'Injected' });
```

## Task

1. Refactor `ChatService` so `messages$` is exposed as `Observable<ChatMessage>` (read-only) on the public API.
2. Add a private `_messages$` Subject that only `ChatService` methods can call `.next()` on.
3. Explain in one sentence what `asObservable()` does and why it prevents the injection attack.

## Hint

A Subject is simultaneously Observer and Observable. `asObservable()` strips the Observer interface — the caller can only subscribe, not dispatch.
