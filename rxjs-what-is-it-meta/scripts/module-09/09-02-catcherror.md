---
module: 9
lesson: "9.2"
title: catchError — recovery strategies
key_insight: catchError intercepts a terminated error stream and returns a replacement Observable. The replacement can be a fallback value, an empty stream, or a rethrow — but it is always a new Observable, because the old stream is gone.
related: ["9.1", "9.3", "9.5"]
---

## Hook

`catchError` looks and reads like a try-catch — you put it in a pipeline, your error lands in the handler, you return something. But a try-catch resumes after the error point. `catchError` does not. The moment your source errors, that stream is closed. What you return from the handler is a brand-new Observable that takes over. The distinction sounds subtle, but it completely determines how you design pipelines that tolerate failures.

## Insight

`catchError` takes a handler with the signature `(err: unknown, caught$: Observable<T>) => Observable<T>`. When the source errors, `catchError` calls your handler and subscribes to whatever Observable you return — the downstream receives emissions from that replacement Observable as if nothing unusual happened.

There are four distinct patterns, each for a different situation:

**Fallback value**: `catchError(() => of(defaultValue))` — emit a single default and complete. Use when you have a meaningful substitute for the real data: an empty array, a cached snapshot, a zero state.

**Swallow silently**: `catchError(() => EMPTY)` — complete immediately with no emissions. Use when the absence of data is valid and downstream is built to handle it gracefully.

**Rethrow with side effect**: `catchError((err: unknown) => { reportError(err); return throwError(() => err); })` — handle the error for logging or alerting, then rethrow it so callers upstream continue to see the failure.

**Resubscribe to the source**: `catchError((_err: unknown, caught$: Observable<T>) => caught$)` — the second argument `caught$` is the original source Observable. Returning it resubscribes. This is powerful but must always be bounded by a counter or it creates an infinite retry loop.

The most important pattern in practice is the inner `catchError` — placing it inside a `switchMap` or `mergeMap` to catch errors per inner Observable rather than on the outer stream:

```typescript
searchQuery$.pipe(
	switchMap((q: string) =>
		search$(q).pipe(
			catchError(() => of<Result[]>([])),
		)
	),
)
```

A single failed search does not kill the typeahead. The outer `searchQuery$` keeps running; only that one inner execution is replaced with an empty result.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { catchError, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface SearchResult { id: number; name: string; }

// Outer catchError: entire stream falls back to empty array on any error
const results$: Observable<SearchResult[]> = ajax
	.getJSON<SearchResult[]>('/api/search?q=rxjs')
	.pipe(
		catchError(() => of<SearchResult[]>([])),
	);

// Inner catchError: one failed query does not kill the typeahead
const query$: Observable<string> = getSearchQuery$();

const typeahead$: Observable<SearchResult[]> = query$.pipe(
	switchMap((q: string) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${q}`).pipe(
			catchError(() => of<SearchResult[]>([])), // isolated per query
		)
	),
);
```

The inner placement is the standard pattern for HTTP in reactive UIs. Always catch errors at the innermost possible scope to preserve outer stream continuity.

## Summary

- `catchError` terminates the errored stream and subscribes to the Observable you return — it never resumes the original
- Four strategies: fallback value (`of(default)`), swallow (`EMPTY`), rethrow (`throwError`), resubscribe (`caught$`)
- Always use inner `catchError` inside `switchMap`/`mergeMap` to isolate per-inner-Observable errors
- Swallow silently only when downstream genuinely handles the absence of data — hiding errors is rarely the right default

## Pitfall

Placing `catchError` outside a `switchMap` instead of inside the inner Observable. An error inside `switchMap`'s inner Observable propagates to the outer stream, terminating the entire pipeline — including the typeahead that was listening for more keystrokes. Always wrap inner Observables: `switchMap(q => search(q).pipe(catchError(() => of([]))))`.
