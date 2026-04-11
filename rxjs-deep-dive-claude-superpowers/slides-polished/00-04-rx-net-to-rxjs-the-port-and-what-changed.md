The `rxjs-explain` skill is for individual operator deep-dives — it doesn't apply to this historical/conceptual lesson. Generating the Marp slide deck directly from the provided wiki content.

---
marp: true
theme: uncover
title: "Rx.NET to RxJS: the port and what changed"
---

# Rx.NET to RxJS: the port and what changed
> Intermediate developers treat `pipe()` and the three-channel contract as "just how RxJS works" — knowing what was ported unchanged versus what was invented for JavaScript reveals which design choices are fixed by mathematics and which are ecosystem accidents.

---

## Core Concept
- **The contract was derived, not invented:** `IObservable<T>` is the formal push-dual of `IEnumerable<T>` — three channels (`next` / `error` / `complete`) is the *minimum* dual of `IEnumerator.MoveNext()`, no more, no less
- **The operator set followed from the dual:** any LINQ operator over `IEnumerable` can be mechanically derived for `IObservable` — `map` = `Select`, `filter` = `Where`, `mergeMap` = `SelectMany`
- **Rx.NET (2009) → RxJS 1.x (2012):** JS has *more* push sources than .NET — DOM events, timers, XHR — so the model fits even better in the browser
- **RxJS 1–5:** operators patched onto `Observable.prototype`; any import silently bundled the entire operator library
- *"Operators moved out of the prototype chain into standalone pipeable functions"* — RxJS 6 (2018), making tree-shaking possible for the first time

---

## How It Works

```typescript
// ── RxJS 1–5: prototype mutation ─────────────────────────────────────────────
import 'rxjs/add/operator/debounceTime'; // patches Observable.prototype globally
import 'rxjs/add/operator/switchMap';    // patches Observable.prototype globally
// Bundler sees side-effect imports — must include ALL operators in the bundle
source$.debounceTime(300).switchMap(q => search(q)); // method chain on prototype

// ── RxJS 6+: standalone pipeable functions ───────────────────────────────────
import { debounceTime, switchMap } from 'rxjs/operators';
//  ↑ Discrete named exports — bundler tree-shakes everything else
//
// Operator signature:  (source: Observable<T>) => Observable<R>
// No prototype mutation. No global state. Pure function composition.
source$.pipe(
  debounceTime(300),    // INPUT: Observable<Event>  OUTPUT: Observable<Event>
  switchMap(q => search(q)) // INPUT: Observable<Event>  OUTPUT: Observable<Result[]>
);
```

---

## Common Mistake

```typescript
// ❌ RxJS 5 prototype-patch style — still compiles via rxjs-compat, silently wrong

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
// Why it fails: side-effect imports patch Observable.prototype at runtime.
// Bundlers cannot statically analyse which operators are actually called —
// every patched operator ships in the production bundle (~300 KB of dead code).

const results$ = keystrokes$
  .debounceTime(300)
  .switchMap(q => search(q));

// ❌ Also wrong: mixing compat prototype methods with pipe() collapses types
const broken$ = keystrokes$
  .debounceTime(300)                   // compat method — TypeScript loses generic T
  .pipe(switchMap(q => search(q)));    // inference chain breaks here; q typed as {}
```

---

## The Right Way

```typescript
import { fromEvent, EMPTY } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
// ↑ Named imports — bundler ships only these five operators, nothing else

// The three-channel contract (next / error / complete) is unchanged since Rx.NET 2009.
// Only the packaging changed: prototype methods → standalone pipeable functions.
const search$ = fromEvent<Event>(input, 'input').pipe(
  debounceTime(300),                                     // rate-limit: operator algebra inherited from LINQ
  map(e => (e.target as HTMLInputElement).value),        // extract once — single responsibility per operator
  distinctUntilChanged(),                                // deduplicate: no redundant HTTP requests
  switchMap(query =>                                     // cancel-previous: JS ecosystem's defining Rx pattern
    fetchResults(query).pipe(
      catchError(() => EMPTY)                            // per-inner-stream error: outer stream stays alive
    )
  )
);

search$.subscribe({ next: render, error: console.error });
```

---

## Key Rule
> **The `next` / `error` / `complete` contract was ported unchanged from Rx.NET because mathematics required it; `pipe()` and standalone operator functions were not ported — they were invented for RxJS 6 to solve a JavaScript-specific bundling problem that never existed in .NET.**