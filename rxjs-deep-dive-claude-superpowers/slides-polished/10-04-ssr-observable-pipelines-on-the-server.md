---
marp: true
theme: uncover
title: "SSR: Observable Pipelines on the Server"
---

# SSR: Observable Pipelines on the Server
> Browser Observables assume infinite lifetime — on the server, a naked `subscribe()` inside a request handler leaks memory across every request until the process crashes.

---

## Core Concept

- On the server, each HTTP request is a **bounded unit of work** — every stream must have a termination path
- Browser-oriented streams (DOM events, router$, polling intervals) have no server equivalent and must never be used request-scoped
- A leaked subscription accumulates across thousands of concurrent requests, causing **memory exhaustion**
- `firstValueFrom()` / `lastValueFrom()` are the idiomatic Observable-to-Promise bridge for SSR handlers
- > **"The server has no teardown boundary — the Observable must provide its own."**

---

## How It Works

```
// Browser: stream is infinite — subscriber lives with the tab
click$:  ---c---c---c---c---  (never completes, GC'd when tab closes)

// Server: stream is request-scoped — MUST complete
query$:  ---a--b--|            (completes → subscription disposed → GC cleans up)
                  ↓
firstValueFrom(query$)
  resolves with 'a'            (auto-unsubscribes after first emission)
  └─ subscription lifetime: microseconds, not the process lifetime
```

---

## Common Mistake

```typescript
// ❌ WRONG: subscribe() with no completion guarantee in a request handler
app.get('/api/user/:id', (req, res) => {
	// This subscription is NEVER cleaned up.
	// On a loaded server: thousands of these accumulate in memory.
	userId$.pipe(
		switchMap(id => fetchUser(id)),  // inner Observable keeps source alive
		map(toDto)
	).subscribe(user => res.json(user));
	// No take(1), no takeUntil, no firstValueFrom — the subscription outlives the request.
});
```

---

## The Right Way

```typescript
import { firstValueFrom, Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';

// ✅ Single value: firstValueFrom auto-disposes after first emission
app.get('/api/user/:id', async (req, res) => {
	const user = await firstValueFrom(
		fetchUser$(req.params.id).pipe(  // cold Observable — new pipeline per request
			map(toDto)
			// take(1) is implicit inside firstValueFrom — leak is structurally impossible
		)
	);
	res.json(user);
});

// ✅ Streaming: scope teardown to request close event
app.get('/api/stream', (req, res) => {
	const reqDestroy$ = new Subject<void>();
	req.on('close', () => reqDestroy$.next());  // fires on client disconnect OR response end

	liveData$.pipe(
		map(toChunk),
		takeUntil(reqDestroy$)  // guaranteed teardown — no subscription outlives the request
	).subscribe(chunk => res.write(chunk));
});
```

---

## Key Rule

> **Every Observable that runs on the server must carry its own termination — use `firstValueFrom()` for single values and `takeUntil(requestDestroy$)` for streams; a bare `subscribe()` in a request handler is always a memory leak waiting to compound.**