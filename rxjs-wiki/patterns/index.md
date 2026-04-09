---
title: "Patterns Index"
category: patterns
tags: [patterns, index, recipes]
related: [mvu.md, effects.md, state-management.md, error-handling.md, ../architectures/index.md]
sources: 0
updated: 2026-04-08
---

# RxJS Patterns

> Proven solutions to recurring problems in reactive programming with RxJS.

## Pattern Catalog

### State Management
- [state-management](state-management.md) — BehaviorSubject and scan-based state, selectors, immutable updates
- [mvu](mvu.md) — Model–View–Update (Elm-like) with RxJS: action → reducer → state → view

### Side Effects
- [effects](effects.md) — NgRx-style Action In → Action Out effects system without a framework

### Resilience
- [error-handling](error-handling.md) — Retry strategies, fallbacks, error recovery pipelines

## Quick Reference

### Debounced Search / Typeahead

```typescript
fromEvent<InputEvent>(input, 'input').pipe(
  map(e => (e.target as HTMLInputElement).value),
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => search(query).pipe(
    catchError(() => of([]))
  ))
).subscribe(renderResults);
```

**Operator choices:**
- `debounceTime` — don't search on every keystroke
- `distinctUntilChanged` — skip if query didn't change
- `switchMap` — cancel the previous HTTP request when a new query arrives
- `catchError` inside `switchMap` — prevents the outer stream from dying on network error

### Polling with Backoff

```typescript
const poll$ = defer(() => fetchData()).pipe(
  retryWhen(errors$ =>
    errors$.pipe(
      scan((count, err) => {
        if (count >= 3) throw err;
        return count + 1;
      }, 0),
      delayWhen(count => timer(Math.pow(2, count) * 1000))
    )
  )
);

timer(0, 30_000).pipe(
  switchMap(() => poll$)
).subscribe(processData);
```

### Form Submit (Prevent Double-Submit)

```typescript
fromEvent(submitBtn, 'click').pipe(
  exhaustMap(() => submitForm().pipe(
    catchError(err => of({ error: err }))
  ))
).subscribe(handleResult);
```

`exhaustMap` — ignores subsequent clicks while a submission is in flight.

### Combining State Streams

```typescript
const viewModel$ = combineLatest({
  user: user$,
  items: items$,
  loading: loading$,
}).pipe(
  map(({ user, items, loading }) => ({
    items: items.filter(i => i.ownerId === user.id),
    loading,
  }))
);
```

### Accumulated State with scan

```typescript
const clicks$ = fromEvent(document, 'click');

const clickCount$ = clicks$.pipe(
  scan(count => count + 1, 0),
  startWith(0)
);
```

### Cleanup with takeUntil

```typescript
const destroy$ = new Subject<void>();

// All subscriptions respect the destroy signal
interval(1000).pipe(takeUntil(destroy$)).subscribe(...);
fromEvent(window, 'resize').pipe(takeUntil(destroy$)).subscribe(...);
user$.pipe(takeUntil(destroy$)).subscribe(...);

// On component/service teardown:
destroy$.next();
destroy$.complete();
```

### Sequential Operations (Upload Queue)

```typescript
from(files).pipe(
  concatMap(file => uploadFile(file).pipe(
    map(result => ({ file, result, status: 'done' as const })),
    catchError(err => of({ file, error: err, status: 'failed' as const }))
  ))
).subscribe(updateProgress);
```

`concatMap` — uploads one file at a time in order.

### Parallel Operations with Results

```typescript
forkJoin({
  user: getUser(id),
  permissions: getPermissions(id),
  preferences: getPreferences(id),
}).subscribe(({ user, permissions, preferences }) => {
  initApp(user, permissions, preferences);
});
```

`forkJoin` — all three complete, then emit last values together.

### WebSocket with Reconnect

```typescript
import { webSocket } from 'rxjs/webSocket';

const socket$ = webSocket('wss://api.example.com/ws');

socket$.pipe(
  retryWhen(errors$ =>
    errors$.pipe(
      tap(() => console.log('WebSocket disconnected, reconnecting...')),
      delay(3000)
    )
  )
).subscribe(handleMessage);
```

## Related

- [mvu](mvu.md) — full MVU architecture pattern
- [effects](effects.md) — effects system pattern
- [state-management](state-management.md) — state management patterns
- [error-handling](error-handling.md) — error handling patterns
- [index](../architectures/index.md) — architectural patterns
