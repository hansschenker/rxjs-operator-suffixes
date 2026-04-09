---
title: "RxJS History Timeline"
category: history
tags: [history, timeline, versions, evolution]
related: [rxjs5-to-6.md, rxjs6-to-7.md]
sources: 0
updated: 2026-04-08
---

# RxJS History Timeline

> From Reactive Extensions for .NET (2009) to the de-facto reactive library for the JS ecosystem.

## Origins: Reactive Extensions

**2009 — Rx.NET** (Microsoft)
Erik Meijer and colleagues at Microsoft Research created Reactive Extensions for .NET. The core insight: the **dual of `IEnumerable` is `IObservable`**. Pull-based iteration (you ask for values) vs. push-based observation (values are pushed to you). Observable + LINQ operators = a composable asynchronous programming model.

**2012 — RxJS 1.x** (Matthew Podwysocki, Bart de Smet)
First port to JavaScript. Part of the reactive-extensions GitHub org. Closely mirrored the Rx.NET API. Used globally-imported `Rx.Observable` namespace.

## The Angular Era

**2014–2016 — RxJS 2–4**
The Angular team at Google adopted RxJS as the HTTP and routing abstraction layer for Angular 2. This drove widespread adoption. The library grew rapidly, adding operators via prototype chaining (`.map()`, `.filter()` directly on Observable instances).

The prototype-chain approach had a critical flaw: **tree-shaking was impossible**. If you used one operator, the entire operator library was bundled.

## RxJS 5 — The Full Rewrite (2016)

**Author:** Ben Lesh (Netflix, later Google)

Key changes:
- Complete rewrite for performance and correctness
- Operators still as prototype methods (`.map()`, `.switchMap()`) — tree-shaking still difficult
- Introduced `Scheduler` API
- Added `pipe()` method to Observable (but operators weren't separate functions yet)
- Introduced `lettable` (later `pipeable`) operators as a preview
- **Adopted as primary async primitive in Angular 2+**

Performance improvements: significantly faster than RxJS 4 in benchmarks.

Breaking changes: Different from RxJS 4 in several APIs. Projects had to migrate.

## RxJS 6 — The Pipe Revolution (2018)

**Lead:** Ben Lesh

The seminal change: **operators moved out of the prototype chain into standalone pipeable functions**.

```typescript
// RxJS 5 (prototype chaining)
source$.map(x => x * 2).filter(x => x > 5).take(3)

// RxJS 6 (pipe composition)
source$.pipe(
  map(x => x * 2),
  filter(x => x > 5),
  take(3)
)
```

Why this matters:
- **Tree-shaking**: bundlers can now exclude unused operators — dramatically smaller bundles
- **Composability**: operators are just functions, easily composed and tested in isolation
- **TypeScript**: better type inference through the pipe chain

Other RxJS 6 changes:
- `rxjs-compat` package for gradual migration from RxJS 5
- Scheduler API refinements
- `throwError` became a function (not an operator)
- `combineLatest`, `merge`, `concat` as top-level functions

Migration path: add `rxjs-compat`, then migrate incrementally.

## RxJS 7 — TypeScript Rewrite (2021)

**Author:** Nicholas Jamieson + community

Full rewrite in TypeScript (from JavaScript + type definitions).

Key improvements:
- **Better type safety** throughout — many `any` types eliminated
- **Smaller bundle size** — internal restructuring for better tree-shaking
- `share()` gained a configuration object with `connector`, `resetOnError`, `resetOnComplete`, `resetOnRefCountZero`
- `animationFrames()` creator added
- `firstValueFrom` and `lastValueFrom` — replace deprecated `toPromise()`
- `throwError` requires a factory function (not a value directly)
- `combineLatest` with dictionary input: `combineLatest({ a: a$, b: b$ })`
- Stricter `tap` — deprecated passing partial observers as positional arguments

Breaking changes (smaller than 5→6):
- `toPromise()` deprecated (use `lastValueFrom` / `firstValueFrom`)
- Some scheduler changes
- TypeScript 4.2+ required

## RxJS 8 — Signals Convergence (In Progress)

Key themes being discussed:
- Integration with TC39 Signals proposal (JavaScript native reactivity)
- Further bundle size reduction
- Potential alignment with Angular Signals
- `observe()` integration patterns

Status: In design/early development as of early 2026.

## Ecosystem Timeline

| Year | Event |
|------|-------|
| 2009 | Rx.NET created at Microsoft |
| 2012 | First RxJS port |
| 2014 | Angular 2 adopts RxJS |
| 2016 | RxJS 5 — performance rewrite |
| 2018 | RxJS 6 — pipe() revolution, tree-shaking |
| 2021 | RxJS 7 — TypeScript rewrite |
| 2022+ | RxJS influences TC39 Observable proposal |
| 2026 | RxJS 8 in development |

## Key People

| Person | Contribution |
|--------|-------------|
| Erik Meijer | Rx.NET creator, mathematical foundations |
| Matthew Podwysocki | First RxJS port |
| Ben Lesh | RxJS 5 and 6 lead |
| Nicholas Jamieson | RxJS 7 lead |
| Angular team | Drove ecosystem adoption |

## Related

- [rxjs5-to-6](rxjs5-to-6.md) — Migration guide and breaking changes
- [rxjs6-to-7](rxjs6-to-7.md) — Migration guide and breaking changes
