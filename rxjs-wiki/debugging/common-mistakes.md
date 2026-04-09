---
title: "Common RxJS Mistakes"
category: debugging
tags: [debugging, mistakes, pitfalls, memory-leaks, anti-patterns]
related: [index.md, tap.md, ../patterns/error-handling.md, ../core/Subscription.md]
sources: 0
updated: 2026-04-08
---

# Common RxJS Mistakes

> The most frequent pitfalls when working with RxJS — with diagnosis and fixes.

---

## 1. Not Unsubscribing (Memory Leak)

**Symptom:** Memory grows over time, stale callbacks fire after component/page is gone.

```typescript
// WRONG — subscription never cleaned up
ngOnInit() {
  this.userService.getUsers().subscribe(users => this.users = users);
}

// CORRECT — takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.userService.getUsers().pipe(
    takeUntil(this.destroy$)
  ).subscribe(users => this.users = users);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**When it's fine not to unsubscribe:**
- `take(1)` — auto-completes
- Subjects you control the lifecycle of
- HTTP requests (complete automatically)

---

## 2. Nested Subscribes (Callback Hell 2.0)

**Symptom:** Hard to read, impossible to cancel inner work, memory leaks.

```typescript
// WRONG — nested subscribes
source$.subscribe(value => {
  fetchData(value).subscribe(result => {
    processResult(result).subscribe(final => {
      console.log(final);
    });
  });
});

// CORRECT — flatten with concatMap / switchMap / mergeMap
source$.pipe(
  switchMap(value => fetchData(value)),
  switchMap(result => processResult(result))
).subscribe(final => console.log(final));
```

---

## 3. Side Effects in map

**Symptom:** Side effects run at unexpected times, especially with `shareReplay` or multiple subscribers.

```typescript
// WRONG
source$.pipe(
  map(v => {
    this.count++; // side effect in map!
    return v * 2;
  })
);

// CORRECT
source$.pipe(
  tap(() => this.count++), // tap for side effects
  map(v => v * 2)
);
```

---

## 4. catchError on the Outer Stream (Effect Dies)

**Symptom:** Effect works once, then stops after the first HTTP error.

```typescript
// WRONG — stream terminates on error, effect dies permanently
action$.pipe(
  filter(a => a.type === 'LOAD'),
  switchMap(() => fetchData()),
  catchError(err => of(errorAction(err))) // ← terminates outer stream
);

// CORRECT — catch inside switchMap
action$.pipe(
  filter(a => a.type === 'LOAD'),
  switchMap(() =>
    fetchData().pipe(
      catchError(err => of(errorAction(err))) // ← only inner terminates
    )
  )
);
```

---

## 5. Wrong Higher-Order Operator

**Symptom:** Race conditions, duplicate operations, blocked UI.

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Old HTTP result overwrites new | `mergeMap` | Use `switchMap` |
| Submit button fires twice | `switchMap`/`mergeMap` | Use `exhaustMap` |
| Operations run out of order | `mergeMap` | Use `concatMap` |
| Previous request not cancelled | `concatMap` | Use `switchMap` |

```typescript
// Search — should cancel previous request
switchMap(query => search(query))  // ✓

// Form submit — should ignore while pending
exhaustMap(() => submit())  // ✓

// Upload queue — must be sequential
concatMap(file => upload(file))  // ✓

// Independent analytics events — parallel ok
mergeMap(event => track(event))  // ✓
```

---

## 6. Forgetting startWith with scan

**Symptom:** State$ doesn't emit until the first action arrives; subscribers miss initial state.

```typescript
// WRONG — no initial emission
const state$ = action$.pipe(scan(reducer, initialState));

// CORRECT — startWith provides immediate initial state
const state$ = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);
```

---

## 7. shareReplay Without refCount (Old RxJS 6)

**Symptom:** Source Observable never completes because `shareReplay` holds the subscription.

```typescript
// WRONG in RxJS 6 — source stays subscribed forever
source$.pipe(shareReplay(1))

// CORRECT in RxJS 6
source$.pipe(shareReplay({ bufferSize: 1, refCount: true }))

// RxJS 7 — default refCount: false changed to false for shareReplay
// but share() resets properly
source$.pipe(share({ connector: () => new ReplaySubject(1) }))
```

---

## 8. Using any on Observable Types

**Symptom:** TypeScript can't catch errors, runtime type mismatches.

```typescript
// WRONG
const data$: Observable<any> = fetchData();
data$.subscribe((v: any) => v.nonExistentProp); // no error

// CORRECT
const data$: Observable<User[]> = fetchData<User[]>();
data$.subscribe(users => users[0].nonExistentProp); // TypeScript error ✓
```

---

## 9. Creating Observables Inside subscribe

**Symptom:** Subscriptions leak, cancellation doesn't work, hard to debug.

```typescript
// WRONG — creating subscription inside subscription
clicks$.subscribe(() => {
  interval(1000).subscribe(tick => render(tick)); // new subscription on each click!
});

// CORRECT — switchMap handles inner subscription lifecycle
clicks$.pipe(
  switchMap(() => interval(1000))
).subscribe(tick => render(tick));
```

---

## 10. Mutating State in Reducer

**Symptom:** State changes don't trigger re-renders (reference equality checks fail), subtle bugs.

```typescript
// WRONG — mutating state
function reducer(state: State, action: Action): State {
  state.count++; // ← mutation!
  return state;  // same reference → distinctUntilChanged misses change
}

// CORRECT — immutable update
function reducer(state: State, action: Action): State {
  return { ...state, count: state.count + 1 }; // new object
}
```

---

## 11. Subscribing in Constructor / Before Init

**Symptom:** Subscription references services or DOM elements that aren't ready.

```typescript
// WRONG — subscribing before component is ready
class MyComponent {
  constructor(private service: DataService) {
    service.data$.subscribe(d => this.element.innerHTML = d); // element doesn't exist yet!
  }
}

// CORRECT — subscribe after init
class MyComponent {
  ngOnInit() {
    this.service.data$.pipe(takeUntil(this.destroy$))
      .subscribe(d => this.element.innerHTML = d);
  }
}
```

---

## 12. Cold Observable Accessed by Multiple Subscribers Without share

**Symptom:** HTTP request fires multiple times — once per subscriber.

```typescript
const user$ = this.http.get<User>('/api/user'); // cold

// WRONG — two HTTP requests
user$.subscribe(u => this.name = u.name);
user$.subscribe(u => this.email = u.email);

// CORRECT — share the single subscription
const user$ = this.http.get<User>('/api/user').pipe(shareReplay(1));
user$.subscribe(u => this.name = u.name);
user$.subscribe(u => this.email = u.email);
```

---

## 13. Using toPromise() in RxJS 7

**Symptom:** Deprecation warning; `undefined` when Observable completes without emitting.

```typescript
// WRONG (deprecated)
const result = await source$.toPromise();

// CORRECT (RxJS 7)
import { lastValueFrom, firstValueFrom } from 'rxjs';

const result = await lastValueFrom(source$);   // last emission
const first = await firstValueFrom(source$);   // first emission, then auto-unsub
```

---

## Related

- [index](index.md) — debugging workflow
- [tap](tap.md) — using tap to diagnose issues
- [error-handling](../patterns/error-handling.md) — proper error handling patterns
- [Subscription](../core/Subscription.md) — unsubscribe and teardown
