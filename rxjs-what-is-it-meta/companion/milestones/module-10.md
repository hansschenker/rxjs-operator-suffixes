# Module 10 — Domain Facades, AOP Telemetry, and TestScheduler

## Alias+Wrap Pattern

`searchOnQuery` is the **Alias+Wrap pattern** — a named domain operator that wraps RxJS
primitives (`switchMap`, `catchError`) behind a domain-meaningful name.

`app.ts` has zero direct RxJS operator imports — only domain imports:

```typescript
import { searchOnQuery } from './operators/search-on-query';
import { render, getSearchInput } from './ui';
```

This is the **hexagonal boundary**: the application layer speaks domain language; RxJS is an
implementation detail hidden inside the operator files.

## AOP Telemetry

`with-telemetry.ts` demonstrates **Aspect-Oriented Programming** with RxJS. `withTelemetry`
wraps any `OperatorFunction<T, T>` with observability without modifying it:

```typescript
// One-line change in app.ts — full telemetry, no refactor:
query$.pipe(
    withTelemetry('searchOnQuery', searchOnQuery(), consoleTelemetry),
)
```

## Testing with TestScheduler

To test the `debounceTime(300)` with virtual time:

```typescript
import { TestScheduler } from 'rxjs/testing';

const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

scheduler.run(({ hot, expectObservable }) => {
	const input$ = hot('a-b-300ms c|', { a: 'r', b: 'rx', c: 'rxjs' });
	expectObservable(input$.pipe(debounceTime(300))).toBe('300ms b 300ms c|', { b: 'rx', c: 'rxjs' });
});
```

Virtual time collapses 600 ms of real waiting into microseconds. Use `TestScheduler` for all
time-based operator tests in this codebase.
