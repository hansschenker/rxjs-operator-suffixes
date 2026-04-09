---
title: "RxJS 5 → 6 Migration"
category: history
tags: [history, migration, rxjs5, rxjs6, breaking-changes]
related: [timeline.md, rxjs6-to-7.md]
sources: 0
updated: 2026-04-08
---

# RxJS 5 → 6 Migration

> The most impactful API change in RxJS history — moving from prototype-chain operators to `pipe()`.

## The Core Change

### Before (RxJS 5)

```typescript
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/of';

Observable.of(1, 2, 3)
  .map(x => x * 2)
  .filter(x => x > 3)
  .subscribe(console.log);
```

Problems:
- Side-effectful imports — adding to `Observable.prototype` globally
- Tree-shaking impossible — entire operator must be included
- Namespace collisions if two versions of RxJS coexist

### After (RxJS 6)

```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3).pipe(
  map(x => x * 2),
  filter(x => x > 3)
).subscribe(console.log);
```

Benefits:
- Operators are pure functions — tree-shakeable
- No global side effects
- TypeScript inference flows correctly through the chain

## Import Path Changes

| RxJS 5 | RxJS 6 |
|--------|--------|
| `import { Observable } from 'rxjs/Observable'` | `import { Observable } from 'rxjs'` |
| `import 'rxjs/add/operator/map'` | `import { map } from 'rxjs/operators'` |
| `import 'rxjs/add/observable/of'` | `import { of } from 'rxjs'` |
| `import { Subject } from 'rxjs/Subject'` | `import { Subject } from 'rxjs'` |

Everything now comes from two places:
- `rxjs` — types and creation functions
- `rxjs/operators` — pipeable operators

## Breaking Changes

### `Observable.throw` → `throwError`

```typescript
// RxJS 5
Observable.throw(new Error('oops'))

// RxJS 6
import { throwError } from 'rxjs';
throwError(new Error('oops'))
// RxJS 7: throwError(() => new Error('oops'))
```

### `Observable.of` → `of`

```typescript
Observable.of(1, 2, 3) → of(1, 2, 3)
```

### `Observable.from` → `from`

```typescript
Observable.from([1, 2, 3]) → from([1, 2, 3])
```

### `do` → `tap`

```typescript
.do(x => console.log(x)) → tap(x => console.log(x))
```

### `catch` → `catchError`

```typescript
.catch(err => Observable.of(default)) → catchError(err => of(default))
```

### `switch` → `switchAll`

`switchAll()` merges a higher-order Observable.

### `finally` → `finalize`

```typescript
.finally(() => cleanup()) → finalize(() => cleanup())
```

### Scheduler as last argument

Many operators previously accepted a scheduler as the last argument. In RxJS 6 this was deprecated and moved to dedicated operators or `observeOn`.

## Gradual Migration with `rxjs-compat`

```bash
npm install rxjs-compat
```

Adding `rxjs-compat` restores RxJS 5 import paths and prototype operators. This lets you migrate incrementally:

1. Install `rxjs@6` and `rxjs-compat`
2. The app works without changes
3. Migrate files one at a time to new import paths
4. Run TSLint with `rxjs-tslint` rules to catch remaining issues
5. Remove `rxjs-compat` when all files are migrated

```bash
npx rxjs-tslint --fix src/**/*.ts
```

## `pipe()` Equivalents

| RxJS 5 chain | RxJS 6 pipe |
|-------------|-------------|
| `.map(f).filter(p)` | `pipe(map(f), filter(p))` |
| `.switchMap(f).take(1)` | `pipe(switchMap(f), take(1))` |
| `.do(f).catch(g)` | `pipe(tap(f), catchError(g))` |

## `let` → `pipe` (Custom Operators)

In RxJS 5, custom operators were composed with `.let()`:

```typescript
// RxJS 5
source$.let(myOperator)

// RxJS 6
source$.pipe(myOperator)

// myOperator is just: (source$: Observable<T>) => Observable<R>
const myOperator = (source$: Observable<number>) =>
  source$.pipe(map(x => x * 2));
```

## Related

- [timeline](timeline.md) — full version history
- [rxjs6-to-7](rxjs6-to-7.md) — next migration step
