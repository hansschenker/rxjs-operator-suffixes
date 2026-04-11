---
marp: true
theme: uncover
title: "pipe() as Kleisli Composition"
---

# pipe() as Kleisli Composition
> You keep copy-pasting the same operator chains because you don't realise `pipe()` is a first-class function composer — turn any sequence into a named, type-safe, reusable unit.

---

## Core Concept

- Every operator satisfies: `OperatorFunction<A, B> = (source: Observable<A>) => Observable<B>`
- `pipe()` composes these **left-to-right** — the output type of step N *must* match the input type of step N+1; TypeScript enforces this at compile time
- This is **Kleisli composition**: chaining functions of the form `A → M<B>` where `M` is the Observable "container"
- The standalone `pipe()` from `'rxjs'` returns an `OperatorFunction` *without* needing a source Observable — composition happens before subscription
- > "Any named combination of existing operators is a custom operator — a reusable, type-safe pipeline fragment."

---

## How It Works

```typescript
import { pipe } from 'rxjs';                   // standalone — no Observable yet
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';

//  Input:  Observable<string>  (raw, untrimmed, noisy keystrokes)
//  ─────────────────────────────────────────────────────────────
const searchInput: OperatorFunction<string, string> = pipe(
  map((s: string) => s.trim()),   // string → string  (normalise)
  filter((s) => s.length >= 2),   // string → string  (gate)
  distinctUntilChanged(),         // string → string  (deduplicate)
);
//  ─────────────────────────────────────────────────────────────
//  Output: Observable<string>  (clean, deduplicated search terms)

// The composed OperatorFunction slots into ANY .pipe() chain:
input$.pipe(searchInput).subscribe(query => search(query));
```

---

## Common Mistake

```typescript
// ✗ Duplicated operator chains — now you have two places to get it wrong
searchInput$.pipe(
  map(s => s.trim()),
  filter(s => s.length >= 2),
  distinctUntilChanged(),
).subscribe(query => search(query));

tagInput$.pipe(
  map(s => s.trim()),             // copy-pasted — same chain, different file
  filter(s => s.length >= 2),    // changing the threshold means hunting every
  distinctUntilChanged(),         // call site, and you WILL miss at least one
).subscribe(tag => filterByTag(tag));

// Why it fails: no single source of truth.
// This is not a style problem — it is a correctness problem at scale.
```

---

## The Right Way

```typescript
import { pipe } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';

// Named custom operator — the pipe() call IS the Kleisli composition
function searchInput(debounceMs = 300): OperatorFunction<string, string> {
  return pipe(
    debounceTime(debounceMs),     // one place to tune the delay
    map(s => s.trim()),           // one place to fix normalisation
    distinctUntilChanged(),       // one place to adjust dedup strategy
    filter(s => s.length >= 2),  // one place to change the threshold
  );
}

// Every call site is identical — the composition is sealed inside the operator
searchInput$.pipe(searchInput()).subscribe(query => search(query));
tagInput$.pipe(searchInput(150)).subscribe(tag => filterByTag(tag));

// Pass a number stream in → TypeScript rejects it at the call site,
// not buried deep inside a subscriber callback
```

---

## Key Rule

> **When the same operator sequence appears more than once, it is not a style smell — it is a missing `OperatorFunction`: extract it with standalone `pipe()` and the type system enforces correctness at every call site.**