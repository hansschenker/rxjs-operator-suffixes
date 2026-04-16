---
module: 7
lesson: "7.1"
title: The "map to Observable" problem
key_insight: When you map a value to an async operation, you get Observable<Observable<T>> — which is useless. The four flattening operators exist to solve this single problem, each with a different concurrency policy.
related: ["4.1", "7.2", "7.3", "7.4", "7.5"]
---

## Hook

The most common RxJS mistake compiles without error, passes TypeScript's type checker, and produces an output that renders as `[object Object]` in your template. The mistake is using `map()` to start an HTTP request. It looks correct, it feels correct, and it silently does nothing.

## Insight

`map(value => ajax.getJSON(url))` produces an Observable that emits `Observable<Response>` objects — not `Response` objects. You now have a stream of streams: `Observable<Observable<Response>>`. Each inner Observable is a self-contained HTTP request that nobody has subscribed to — the requests never fire.

To get `Observable<Response>`, you need to subscribe to each inner Observable as it arrives and forward its emissions to the outer stream. This is called "flattening." All four flattening operators do exactly this — they accept a projection function `(value: T) => Observable<R>` and produce `Observable<R>` directly, with no nesting.

The only thing that differs between the four operators is the **concurrency policy**: what should happen when a new outer value arrives while a previous inner Observable is still running? Should both run in parallel? Should the new one wait? Should the old one be cancelled? Should the new one be ignored?

That single question has exactly four meaningful answers, and each answer is one operator: `mergeMap`, `concatMap`, `switchMap`, `exhaustMap`. All four flatten. They differ only in what they do about concurrency.

Understanding this unifying frame means you never have to memorise four separate operators from scratch. You learn one concept — flattening — and four policies for handling overlap.

## Example

```typescript
interface User { id: number; name: string; }

// WRONG — produces Observable<Observable<User>>
const wrong$ = userId$.pipe(
	map((id: number) => ajax.getJSON<User>(`/api/users/${id}`)),
	// type is Observable<AjaxResponse<User>> — nobody subscribes to inner Observables
	// HTTP requests never fire; template renders [object Object]
);

// CORRECT — use a flattening operator
const correct$ = userId$.pipe(
	switchMap((id: number) => ajax.getJSON<User>(`/api/users/${id}`)),
	// type is Observable<User> — inner Observables are subscribed and flattened
);
```

The nested subscription anti-pattern — calling `subscribe()` inside `map()` — is equally wrong and harder to spot because it does fire the requests, but leaks subscriptions and bypasses all downstream operators.

## Summary

- `map()` applied to an async operation produces nested Observables — inner ones never fire, results render as `[object Object]`
- Never call `subscribe()` inside `map()` — that is a nested subscription anti-pattern that leaks and bypasses the pipeline
- The four flattening operators all solve the same problem; their only difference is the concurrency policy when a new outer value arrives while an inner Observable is still active

## Pitfall

Calling `.subscribe()` inside a `map` callback to "unwrap" an inner Observable. This creates a nested subscription — a hidden inner execution that has no teardown connected to the outer subscription tree. The outer subscription completes or errors independently of all inner subscriptions it created. Use a flattening operator instead.
