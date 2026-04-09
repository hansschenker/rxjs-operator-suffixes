---
title: "Domain Operators Pattern"
category: patterns
tags: [patterns, domain, custom-operators, ddd, readability, abstraction, semantic, business-logic]
related: [../core/custom-operators.md, ../core/operator-policies.md, ../core/execution-phases.md, effects.md, state-management.md]
sources: 1
updated: 2026-04-08
---

# Domain Operators Pattern

> Wrap RxJS operator chains in named functions that speak the language of your domain. The pipeline becomes executable documentation — readable by anyone who understands the business, not just RxJS experts.

## The Problem: Technical Pipelines

A pipeline written in raw RxJS describes *how* — not *what*:

```typescript
// ✗ Technical pipeline — what does this do for the business?
userInput$.pipe(
	debounceTime(300),
	map(e => e.target.value.trim()),
	distinctUntilChanged(),
	filter(q => q.length >= 2),
	switchMap(q =>
		http.get(`/api/search?q=${q}`).pipe(
			timeout(5000),
			retry(2),
			catchError(() => of([])),
		)
	),
	shareReplay(1),
).subscribe(renderResults);
```

A new developer must read every operator to understand the intent.

## The Solution: Domain Operator Functions

Extract each concern into a named function that returns an `OperatorFunction`:

```typescript
import { pipe } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter,
         switchMap, timeout, retry, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { OperatorFunction } from 'rxjs';

// Domain operators — each describes a business concern
function stabilizeInput(debounceMs = 300): OperatorFunction<Event, string> {
	return pipe(
		debounceTime(debounceMs),
		map((e: Event) => (e.target as HTMLInputElement).value.trim()),
		distinctUntilChanged(),
	);
}

function validateQuery(minLength = 2): OperatorFunction<string, string> {
	return pipe(
		filter(q => q.length >= minLength),
	);
}

function fetchSearchResults<T>(endpoint: string): OperatorFunction<string, T[]> {
	return pipe(
		switchMap(q =>
			http.get<T[]>(`${endpoint}?q=${q}`).pipe(
				timeout(5000),
				retry(2),
				catchError(() => of<T[]>([])),
			)
		),
	);
}

function cacheForSession<T>(): OperatorFunction<T, T> {
	return pipe(
		shareReplay({ bufferSize: 1, refCount: false }),
	);
}
```

The pipeline now reads like a sentence:

```typescript
// ✓ Domain pipeline — reads like requirements
userInput$.pipe(
	stabilizeInput(),
	validateQuery(),
	fetchSearchResults('/api/search'),
	cacheForSession(),
).subscribe(renderResults);
```

## Benefits

### 1. Readability

The pipeline tells a story. Product owners, new developers, and reviewers can understand the intent without knowing RxJS:

```
stabilizeInput   → debounce user keystrokes
validateQuery    → only search for real queries (≥2 chars)
fetchSearchResults → call the search API with resilience
cacheForSession  → don't re-fetch if the same query comes up again
```

### 2. Testability

Domain operators are just functions returning `OperatorFunction` — test them independently with simple marble tests:

```typescript
import { TestScheduler } from 'rxjs/testing';

test('validateQuery filters short queries', () => {
	const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));
	scheduler.run(({ cold, expectObservable }) => {
		const source$ = cold('a-b-c-', { a: 'hi', b: 'hello', c: 'x' });
		expectObservable(source$.pipe(validateQuery(3))).toBe('--b---', { b: 'hello' });
	});
});
```

Each operator has its own test surface. No need to mock the entire pipeline.

### 3. Centralized Business Rules

When a business rule changes, update one function:

```typescript
// Product decides: minimum query length is now 3 on mobile
function validateQuery(minLength = isMobile() ? 3 : 2): OperatorFunction<string, string> {
	return pipe(filter(q => q.length >= minLength));
}
```

One change propagates everywhere `validateQuery()` is used.

### 4. Error Isolation

Each domain operator can carry its own error policy:

```typescript
function enrichUserProfile(
	profileService: ProfileService,
): OperatorFunction<User, EnrichedUser> {
	return pipe(
		concatMap(user =>
			profileService.getProfile(user.id).pipe(
				timeout(3000),
				retry(2),
				catchError(err => of({ ...user, profileError: err.message })),
			)
		),
	);
}
```

If profile enrichment fails, the error is **contained** here — it doesn't kill the outer pipeline. The operator degrades gracefully to a partial result.

## Anti-Patterns to Avoid

### Too Granular — Wrapping a Single Operator

```typescript
// ✗ Pointless abstraction — hides nothing, adds a name
function mapData<T, R>(fn: (v: T) => R): OperatorFunction<T, R> {
	return pipe(map(fn));
}
```

If the abstraction doesn't add **meaning** — a business name, a composed policy, error handling — it only adds indirection.

### Too Opaque — Hidden Side Effects

```typescript
// ✗ Name suggests pure transform, but logs and calls external API
function processUser(user: User): User {
	analytics.track(user); // hidden side effect
	return user;
}

// Better: name the side effect explicitly
function trackUserActivity(): MonoTypeOperatorFunction<User> {
	return pipe(tap(user => analytics.track(user)));
}
```

## Layered Architecture

Domain operators create a natural separation of layers:

```
┌────────────────────────────────────────────┐
│  Presentation layer                        │
│  userInput$.pipe(                          │
│    stabilizeInput(),                       │  ← domain language
│    validateQuery(),                        │
│    fetchSearchResults('/api/search'),      │
│    cacheForSession(),                      │
│  ).subscribe(renderResults)                │
├────────────────────────────────────────────┤
│  Domain layer                              │
│  stabilizeInput()   validateQuery()        │  ← business rules
│  fetchSearchResults()   cacheForSession()  │
├────────────────────────────────────────────┤
│  RxJS primitives                           │
│  debounceTime  filter  switchMap  timeout  │  ← technical operators
│  retry  catchError  shareReplay  ...       │
└────────────────────────────────────────────┘
```

The presentation layer never imports `debounceTime` — it imports `stabilizeInput`. The domain layer owns the translation.

## Granularity Guide

```
Single operator     → no abstraction needed (use the operator directly)
2-4 operators with  → domain operator (give it a business name)
   a business name
Complex async with  → domain operator with error handling
   error handling
Multiple related    → domain module / service
   domain operators
```

## Real-World Examples

### Real-Time Price Feed

```typescript
function normalizeTickPrice(): OperatorFunction<RawTick, number> {
	return pipe(
		filter(tick => tick.exchange === 'NYSE'),
		map(tick => tick.price / 100),
		distinctUntilChanged(),
	);
}

function throttleToDisplayRate(): MonoTypeOperatorFunction<number> {
	return pipe(auditTime(100)); // max 10 updates/sec to DOM
}

priceSocket$.pipe(
	normalizeTickPrice(),
	throttleToDisplayRate(),
).subscribe(updatePriceDisplay);
```

### Patient Monitoring

```typescript
function detectCriticalVitals(): OperatorFunction<VitalReading, Alert> {
	return pipe(
		filter(v => v.heartRate > 120 || v.oxygenSat < 90),
		map(v => ({ level: 'critical', reading: v, timestamp: Date.now() })),
		throttleTime(5000), // no more than one alert per 5s per patient
	);
}

vitals$.pipe(
	detectCriticalVitals(),
).subscribe(triggerNurseAlert);
```

## Related

- [custom-operators](../core/custom-operators.md) — how to build custom operators with `pipe()`
- [operator-policies](../core/operator-policies.md) — Eight-Policy Framework for specifying operators
- [execution-phases](../core/execution-phases.md) — execution plan as the domain operator blueprint
- [effects](effects.md) — domain operators applied to the Effects pattern
- [state-management](state-management.md) — domain operators for state selectors and reducers
