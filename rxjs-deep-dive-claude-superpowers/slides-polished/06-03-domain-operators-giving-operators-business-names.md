---
marp: true
theme: uncover
title: "Domain operators: giving operators business names"
---

# Domain operators: giving operators business names
> Raw RxJS pipelines describe *how* a stream transforms — not *what* the business needs — so every reader must reverse-engineer intent from operator names alone.

---

## Core Concept

- A **domain operator** is a named function returning `OperatorFunction<T, R>`, built with `pipe()`, that wraps 2–4 operators under one business-meaningful name
- The presentation layer imports domain words — never raw RxJS primitives
- One function = one business rule; change it once, it propagates everywhere it is used
- Domain operators are independently testable with marble tests — no need to mock the full pipeline
- > "Wrap RxJS operator chains in named functions that speak the language of your domain. The pipeline becomes executable documentation."

---

## How It Works

```typescript
// Input:  Event stream from a text input
// Output: Validated, stable query strings ready for the API

function stabilizeInput(ms = 300): OperatorFunction<Event, string> {
  return pipe(
    debounceTime(ms),                                           // wait for pause
    map((e: Event) => (e.target as HTMLInputElement).value.trim()), // extract text
    distinctUntilChanged(),                                     // skip duplicates
  );
  // Input:  Event  Event  Event ----  Event
  // Output: -------------------------"hello"
}

function validateQuery(min = 2): OperatorFunction<string, string> {
  return pipe(filter(q => q.length >= min));
  // Input:  "hi"  "hello"  "x"
  // Output: ------"hello"------   (short strings filtered out)
}
```

---

## Common Mistake

```typescript
// ✗ All operator logic lives directly in the presentation layer.
// A new dev must read every line to understand business intent.
// Magic numbers (300, 2, 5000) are scattered — one rule, many locations.

userInput$.pipe(
  debounceTime(300),                // ← what does 300 mean to the product?
  map(e => e.target.value.trim()),
  distinctUntilChanged(),
  filter(q => q.length >= 2),       // ← min-length rule buried in a chain
  switchMap(q =>
    http.get(`/api/search?q=${q}`).pipe(
      timeout(5000),
      retry(2),
      catchError(() => of([])),     // ← resilience policy hidden here
    )
  ),
  shareReplay(1),
).subscribe(renderResults);
// When product changes the min length: grep for filter(q => q.length...
```

---

## The Right Way

```typescript
// ✓ Pipeline reads like a requirements sentence.
// Each concern is named, isolated, testable, and changeable in one place.

userInput$.pipe(
  stabilizeInput(),                        // debounce + trim + dedup
  validateQuery(),                         // guard: min 2 chars
  fetchSearchResults('/api/search'),       // switchMap + timeout + retry + fallback
  cacheForSession(),                       // shareReplay — skip re-fetching same query
).subscribe(renderResults);

// Product changes min length on mobile? One edit propagates everywhere:
function validateQuery(
  minLength = isMobile() ? 3 : 2,         // ← business rule lives here only
): OperatorFunction<string, string> {
  return pipe(filter(q => q.length >= minLength));
}

// Marble-test each operator in isolation — no HTTP mocks needed:
// cold('a-b-c-', { a: 'hi', b: 'hello', c: 'x' }).pipe(validateQuery(3))
// toBe:  '--b---'
```

---

## Key Rule

> **Name every multi-operator concern after what it means to the business — the pipeline must read like requirements, not like an operator reference.**