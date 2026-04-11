---
marp: true
theme: uncover
title: "shareReplay: caching, multicasting, the refCount trap"
---

# shareReplay: caching, multicasting, the refCount trap
> Every component that calls `getUsers()` fires its own HTTP request — because a cold Observable produces a brand-new execution per subscriber, sharing nothing.

---

## Core Concept

- `shareReplay(n)` converts a **cold** Observable into **hot + replaying**: the source subscribes once, and every late subscriber gets the last `n` values replayed instantly
- Internally wraps the source in a `ReplaySubject(bufferSize)` and multicasts to all current subscribers
- **`refCount: true`** — tears the source down when subscriber count hits zero; the next subscriber re-triggers a fresh execution
- **`refCount: false`** — keeps the source alive forever; the only option for a permanent cache
- Errors are replayed too — always `catchError` before caching or the error locks future subscribers

> "When the last subscriber unsubscribes with `refCount: true`, the cache is destroyed."

---

## How It Works

```
Cold HTTP source:
  ─────────── request ──── Users[] ─────────────────────────────►

shareReplay({ bufferSize: 1, refCount: false }):
  subscribe once ──────────────────────────────────────────────►
                            │              │              │
                         sub1 live      sub2 late      sub3 later
                        gets Users[]   gets Users[]   gets Users[]
                         on emission   from replay    from replay
                                       (no re-fetch)  (no re-fetch)

Subscriber count: 0 → 1 ──────────── 2 ──────────── 3 ──────────►
Source active?        yes ─────────── yes ─────────── yes ────────►
                       (refCount: false — source never torn down)
```

---

## Common Mistake

```typescript
// ❌ The refCount trap — shorthand looks like a cache, but isn't permanent
@Injectable({ providedIn: 'root' })
export class UserService {
  // shareReplay(1) === shareReplay({ bufferSize: 1, refCount: true })
  //                                                  ^^^^^^^^^^^^^^
  //                         source tears down at 0 subscribers!
  readonly users$ = this.http.get<User[]>('/api/users').pipe(
    shareReplay(1), // ← refCount: true is the default
  );
  constructor(private http: HttpClient) {}
}

// Timeline:
// 1. PageA mounts   → count 0→1 → HTTP fires, response cached ✓
// 2. PageA unmounts → count 1→0 → source TORN DOWN, cache evicted ✗
// 3. PageB mounts   → count 0→1 → HTTP fires AGAIN ✗
// The shorthand is a multicaster, not a durable cache.
```

---

## The Right Way

```typescript
// ✓ Permanent cache: refCount: false survives zero-subscriber gaps
@Injectable({ providedIn: 'root' })
export class UserService {
  readonly users$: Observable<User[]> = this.http
    .get<User[]>('/api/users')
    .pipe(
      catchError(() => EMPTY),                          // errors must not be cached
      shareReplay({ bufferSize: 1, refCount: false }),  // permanent replay buffer
    );

  constructor(private http: HttpClient) {}
}

// Any number of subscribers, any time — exactly one HTTP request ever:
userService.users$.subscribe(renderList);   // HTTP fires, result cached
userService.users$.subscribe(logAudit);     // instant replay — no new request

// Manual cache invalidation: reassign the Observable reference
// this.users$ = this.http.get(...).pipe(catchError(...), shareReplay(...));
```

---

## Key Rule

> **Use `shareReplay({ bufferSize: 1, refCount: false })` for HTTP caches — `shareReplay(1)` is a multicaster that evicts its cache the moment all subscribers leave.**