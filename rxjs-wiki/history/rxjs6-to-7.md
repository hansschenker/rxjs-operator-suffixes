---
title: "RxJS 6 → 7 Migration"
category: history
tags: [history, migration, rxjs6, rxjs7, breaking-changes, typescript]
related: [timeline.md, rxjs5-to-6.md]
sources: 0
updated: 2026-04-08
---

# RxJS 6 → 7 Migration

> A TypeScript rewrite with improved type safety, smaller bundles, and refined APIs — mostly non-breaking with a few targeted changes.

## What Changed

RxJS 7 is a **source-level rewrite from JavaScript to TypeScript**. The external API is largely compatible with RxJS 6, but the internals are tighter and the types are much more precise.

Upgrade path is gentler than 5→6: most projects work with `npm install rxjs@7` and fixing TypeScript errors.

## Bundle Size

RxJS 7 is meaningfully smaller than RxJS 6. Internal refactoring and better tree-shaking support reduce bundle sizes by ~20–30% in typical apps.

## Breaking Changes

### `toPromise()` deprecated → `lastValueFrom` / `firstValueFrom`

```typescript
// RxJS 6 — deprecated in 7
source$.toPromise() // returns Promise<T | undefined>

// RxJS 7
import { lastValueFrom, firstValueFrom } from 'rxjs';

await lastValueFrom(source$);  // T — rejects if source completes without values
await firstValueFrom(source$); // T — auto-unsubscribes after first value
```

`lastValueFrom` rejects if the Observable completes without emitting (instead of resolving `undefined`). This is stricter and usually what you want.

Default value option:

```typescript
import { lastValueFrom, EmptyError } from 'rxjs';

const result = await lastValueFrom(source$, { defaultValue: fallback });
```

### `throwError` requires a factory

```typescript
// RxJS 6 — still works but deprecated
throwError(new Error('boom'))

// RxJS 7 — required form
throwError(() => new Error('boom'))
```

The factory prevents the error object from being created unless it's actually needed (lazy error creation).

### `share()` operator extended

`share()` now accepts a configuration object:

```typescript
source$.pipe(
  share({
    connector: () => new ReplaySubject(1),  // default: new Subject()
    resetOnError: true,                      // default: true
    resetOnComplete: true,                   // default: true
    resetOnRefCountZero: true,               // default: true
  })
)
```

This makes `shareReplay` behavior composable:

```typescript
// shareReplay(1) is now equivalent to:
share({ connector: () => new ReplaySubject(1), resetOnRefCountZero: false })
```

### `combineLatest` dictionary form

```typescript
// RxJS 7 — named result
combineLatest({
  user: user$,
  settings: settings$,
  theme: theme$,
}).subscribe(({ user, settings, theme }) => {
  // Structured destructuring
});
```

Previously only array form was available. Dictionary form improves readability significantly.

### `tap` positional arguments deprecated

```typescript
// RxJS 6 — still works but deprecated
source$.pipe(tap(next, error, complete))

// RxJS 7 — use observer object
source$.pipe(tap({ next, error, complete }))
```

### `animationFrames()` creator added

```typescript
import { animationFrames } from 'rxjs';

// Emits { timestamp, elapsed } on every animation frame
animationFrames().pipe(
  map(({ elapsed }) => elapsed / 1000), // seconds
  takeUntil(stop$)
).subscribe(t => updateAnimation(t));
```

### Scheduler changes

`scheduler` parameter removed from many operators (deprecated since RxJS 6):

```typescript
// No longer accepted
of(1, 2, 3, asyncScheduler)  // RxJS 6 deprecated
// Use observeOn instead
of(1, 2, 3).pipe(observeOn(asyncScheduler))
```

## TypeScript Requirements

- RxJS 7 requires TypeScript **4.2+**
- Many previously `any`-typed returns are now properly typed
- Some operators have stricter overload resolution — existing code may need type annotations

## Type Improvements

```typescript
// RxJS 6 — generic T often lost
const result: Observable<any> = combineLatest([a$, b$]);

// RxJS 7 — fully typed
const result: Observable<[A, B]> = combineLatest([a$, b$]);
```

## New Utilities

| Utility | Description |
|---------|-------------|
| `firstValueFrom(obs$)` | Await first value as Promise |
| `lastValueFrom(obs$)` | Await last value as Promise |
| `animationFrames()` | rAF-based Observable |
| `connectable(source$, connector)` | Replace `publish()` + `connect()` |
| `interval(..., scheduler?)` | Scheduler optional now consistently |

## `connectable` — Replacing `publish` / `multicast`

```typescript
// RxJS 6
const multicasted$ = source$.pipe(publish());
multicasted$.connect();

// RxJS 7
import { connectable } from 'rxjs';
const multicasted$ = connectable(source$, {
  connector: () => new Subject(),
  resetOnDisconnect: false,
});
multicasted$.connect();
```

## Checklist for Migration

1. `npm install rxjs@7`
2. Fix TypeScript errors (usually type narrowing issues)
3. Replace `toPromise()` with `lastValueFrom`/`firstValueFrom`
4. Change `throwError(err)` → `throwError(() => err)`
5. Update `tap(fn, fn, fn)` → `tap({ next, error, complete })`
6. Remove scheduler params from `of`, `from`, `range` → use `observeOn`
7. Test: run marble tests — behavior should be identical

## Related

- [timeline](timeline.md) — full version history
- [rxjs5-to-6](rxjs5-to-6.md) — the previous bigger migration
