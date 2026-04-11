---
marp: true
theme: uncover
title: "Parametric operator factories"
---

# Parametric operator factories
> Intermediate devs write the same `debounceTime + trim + distinctUntilChanged` pipeline in every component — parametric factories eliminate that duplication with a single, configurable definition.

---

## Core Concept

- A **parametric operator factory** is a function that accepts config arguments and returns an `OperatorFunction<T, R>`
- The factory **closes over its parameters** — values are captured at call time and baked into the returned operator
- Built with standalone `pipe()` imported from `'rxjs'` — no Observable instance required
- The returned `OperatorFunction` slots into any `.pipe()` chain identically to a built-in operator
- "Every built-in RxJS operator IS a parametric factory — `debounceTime(300)` returns an `OperatorFunction<string, string>`."

---

## How It Works

```typescript
import { pipe } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

//             ┌── config params ──────────────────────┐
function searchInput(
	debounceMs = 300,    // ← captured in closure
	minLength  = 2,      // ← captured in closure
): OperatorFunction<string, string> { // ← declares input → output types
	return pipe(                        // ← standalone pipe(), not source$.pipe()
		debounceTime(debounceMs),
		map(s => s.trim()),
		distinctUntilChanged(),
		filter(s => s.length >= minLength),
	);
}

// Different configs — same operator, zero copy-paste
searchInput$.pipe(searchInput()).subscribe(q => search(q));
tagInput$.pipe(searchInput(150, 1)).subscribe(t => filterByTag(t));
```

---

## Common Mistake

```typescript
// ❌ No parameters — hardcoded values force copy-paste at every call site
function searchInput(): OperatorFunction<string, string> {
	return pipe(
		debounceTime(300),           // locked — can't vary per use
		map(s => s.trim()),
		distinctUntilChanged(),
		filter(s => s.length >= 2), // locked — copy-paste required for minLength = 1
	);
}

// Now a second input needs a faster debounce → entire operator duplicated
function fastSearchInput(): OperatorFunction<string, string> {
	return pipe(
		debounceTime(150),           // ← maintenance drift starts here
		map(s => s.trim()),
		distinctUntilChanged(),
		filter(s => s.length >= 2), // identical — both must change together
	);
}
// Every behavioural fix must now be applied N times
```

---

## The Right Way

```typescript
import { pipe } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

// ✓ Params make the operator configurable — one definition, many call sites
function searchInput(
	debounceMs = 300,
	minLength  = 2,
): OperatorFunction<string, string> {
	return pipe(
		debounceTime(debounceMs),           // ← closed over param at call time
		map(s => s.trim()),
		distinctUntilChanged(),
		filter(s => s.length >= minLength), // ← closed over param at call time
	);
}

// Same logic, different configs — single source of truth
searchInput$.pipe(searchInput()).subscribe(q  => search(q));
tagInput$.pipe(searchInput(150, 1)).subscribe(t  => filterByTag(t));
autoSuggest$.pipe(searchInput(500, 3)).subscribe(q  => suggest(q));
```

---

## Key Rule

> **Accept config as function arguments, close over them inside `pipe()`, and return `OperatorFunction<T, R>` — that is the complete parametric operator factory pattern.**