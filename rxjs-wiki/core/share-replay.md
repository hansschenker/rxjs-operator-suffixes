---
title: "shareReplay — Caching and Multicasting"
category: core
tags: [core, operators, shareReplay, refCount, cache, multicast, http, hot, replay]
related: [hot-cold.md, operators.md, subjects-guide.md, ../patterns/state-management.md]
sources: 2
updated: 2026-04-08
---

# shareReplay — Caching and Multicasting

> `shareReplay` converts a cold Observable into a hot, replaying Observable. The most common use: cache an HTTP request so it fires once and every subscriber — current and future — gets the same response.

## What It Does

```typescript
source$.pipe(shareReplay(1))
```

Internally this is:
1. Creates a `ReplaySubject(1)` (or `bufferSize` N)
2. Subscribes to the source once
3. Multicasts every emission to all current subscribers
4. Replays the last `bufferSize` emissions to any future subscriber

```
cold source: ─────── HTTP ──────────────────────►
shareReplay:         subscribe once              
              ────── A ──────── A ──────── A ──►
                     ↑          ↑lateX     ↑lateY
                  sub1        sub2(late) sub3(later)
```

Sub2 and Sub3 arrive after the HTTP response — they receive the cached value immediately without triggering a new request.

## Configuration

```typescript
// Option 1: shorthand — bufferSize = 1, refCount = true
shareReplay(1)

// Option 2: explicit config
shareReplay({ bufferSize: 1, refCount: true })  // same as above

// Option 3: permanent cache (survives 0 subscribers)
shareReplay({ bufferSize: 1, refCount: false })

// Option 4: fixed TTL — discard cached values older than windowTime
shareReplay({ bufferSize: 1, refCount: false, windowTime: 3_600_000 }) // 1 hour
```

### refCount: true vs false

| | `refCount: true` | `refCount: false` |
|--|------------------|-------------------|
| When last subscriber unsubscribes | Tears down source subscription | Keeps source subscription alive |
| When a new subscriber arrives later | Re-subscribes to source (new execution) | Returns from replay buffer (no new execution) |
| Use case | Real-time data, resets when unused | Reference data, config, permanent cache |

## The Standard HTTP Caching Pattern

```typescript
import { Injectable } from '@angular/core'; // or any DI container
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
	private users$: Observable<User[]> | null = null;

	constructor(private http: HttpClient) {}

	getUsers(): Observable<User[]> {
		if (!this.users$) {
			this.users$ = this.http.get<User[]>('/api/users').pipe(
				shareReplay({ bufferSize: 1, refCount: false }),
			);
		}
		return this.users$;
	}
}
```

**Result:** No matter how many components call `getUsers()`, exactly one HTTP request is made. All current and future subscribers receive the same response.

### Without DI — module-level cache

```typescript
import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

const config$ = ajax.getJSON('/api/config').pipe(
	shareReplay({ bufferSize: 1, refCount: false }),
);

// Any subscriber anywhere in the app
config$.subscribe(config => applyConfig(config));
config$.subscribe(config => logConfig(config)); // same cached value
```

## Fixed TTL — shareReplay with windowTime

`windowTime` sets a time-to-live on cached values. Once the window expires, the next subscriber re-triggers the source:

```typescript
// Cache HTTP response for 1 hour, then re-fetch
const data$ = http.get<Data[]>('/api/data').pipe(
	shareReplay({ bufferSize: 1, refCount: false, windowTime: 3_600_000 }),
);
```

**Key behaviour of windowTime:**
- Timer starts when the first value is emitted (not on first subscription)
- All subscriptions before expiry receive the cached value instantly
- After expiry, replay buffer is cleared; next subscription re-subscribes to source
- Timer does **not** reset on re-access (fixed TTL, not sliding)

## Sliding TTL — Manual Implementation

`windowTime` provides a fixed TTL. For sliding TTL (reset on access), implement manually with `defer`:

```typescript
import { defer, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

function createSlidingCache<T>(source$: Observable<T>, ttlMs: number): Observable<T> {
	let lastEmit = 0;
	let cache$: Observable<T> | null = null;

	return defer(() => {
		const now = Date.now();
		if (!cache$ || now - lastEmit > ttlMs) {
			// Cache expired or never set — create new shared execution
			cache$ = source$.pipe(
				tap(() => { lastEmit = Date.now(); }),
				shareReplay({ bufferSize: 1, refCount: false }),
			);
		}
		return cache$;
	});
}

// Usage
const users$ = createSlidingCache(
	ajax.getJSON<User[]>('/api/users'),
	3_600_000, // 1 hour TTL, resets on access
);
```

**Why `defer`?** The cache-validity decision must be made at subscription time, not at declaration time. `defer` re-runs the factory per subscription, which checks the timestamp freshly.

## Manual Invalidation

```typescript
class DataService {
	private cache$: Observable<Data[]> | null = null;

	getData(): Observable<Data[]> {
		if (!this.cache$) {
			this.cache$ = ajax.getJSON<Data[]>('/api/data').pipe(
				shareReplay({ bufferSize: 1, refCount: false }),
			);
		}
		return this.cache$;
	}

	// Call to force re-fetch on next getData() call
	invalidate(): void {
		this.cache$ = null;
	}
}
```

## refCount Mechanics (Under the Hood)

`shareReplay` uses a reference counter:

```
subscriber count: 0 → 1 → 2 → 1 → 0
                        ↑              ↑
                     subscribe to    when refCount=true:
                     source once     unsubscribe from source
                                     when refCount=false:
                                     keep source subscription
```

`refCount: true` is the same behaviour as the deprecated `publish() + refCount()` pipeline — source is torn down when no subscribers remain, and restarted fresh when the next subscriber arrives.

## shareReplay vs ReplaySubject

Both replay N values to late subscribers. Choose based on control:

```typescript
// shareReplay — declarative, operator-based, preferred for derived streams
const cached$ = source$.pipe(shareReplay(1));

// ReplaySubject — imperative, explicit control needed
const replay$ = new ReplaySubject<T>(1);
source$.subscribe(replay$);
```

Use raw `ReplaySubject` when you need to push values imperatively. Use `shareReplay` when sharing a derived stream.

## Caching Pattern Comparison

| Pattern | Trigger | Lives until | Use case |
|---------|---------|------------|---------|
| `shareReplay(1)` | First subscriber | Last subscriber unsubscribes | Component-scoped streams |
| `shareReplay({ refCount: false })` | First subscriber | App lifetime | Reference data, config |
| `shareReplay({ windowTime })` | First subscriber | TTL expires | Semi-fresh data |
| `defer + timestamp + shareReplay` | Per subscription check | TTL from last access | Sliding TTL |
| `cache$ = null` invalidation | On demand | Until invalidated | Manual cache control |

## Common Pitfalls

### Pitfall 1 — Errors are replayed too

If the source errors, `shareReplay` replays the error to all future subscribers. Catch errors before or after:

```typescript
// ✓ Catch before caching — on error, retry/EMPTY instead
const safe$ = http.get('/api').pipe(
	catchError(() => EMPTY),
	shareReplay({ bufferSize: 1, refCount: false }),
);
```

### Pitfall 2 — refCount: false leaks with dynamic keys

If you create one `shareReplay` per key (e.g. per user ID) with `refCount: false`, old entries accumulate. Use a `Map` with manual eviction or `refCount: true`:

```typescript
const userCache = new Map<string, Observable<User>>();

function getUser(id: string): Observable<User> {
	if (!userCache.has(id)) {
		userCache.set(
			id,
			http.get<User>(`/api/users/${id}`).pipe(shareReplay(1)),
		);
	}
	return userCache.get(id)!;
}
```

## Related

- [hot-cold](hot-cold.md) — cold→hot conversion; refCount and temperature
- [operators](operators.md) — full multicasting operator reference
- [subjects-guide](subjects-guide.md) — ReplaySubject vs shareReplay
- [state-management](../patterns/state-management.md) — BehaviorSubject and shareReplay for shared state
