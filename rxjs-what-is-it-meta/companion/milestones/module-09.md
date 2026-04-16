# Module 09 — Error Handling: Containment, Retry, and Finalize

The inner `catchError(() => of([]))` inside `searchOnQuery` is **error containment**:

```typescript
apiFn(query).pipe(catchError(() => of([] as SearchResult[])))
```

Without this, a single HTTP 500 would propagate an error notification up through `switchMap`
and terminate the outer `query$` pipeline permanently. Every subsequent keystroke would be
silently ignored — the typeahead would appear broken with no error message.

With the inner `catchError`, the error is caught at the inner Observable boundary, swapped for
an empty result array, and the outer stream continues unharmed.

**Where to add more resilience:**

```typescript
apiFn(query).pipe(
	retry({ count: 2 }),                  // retry transient network errors twice
	timeout({ each: 5000 }),             // fail fast if the server stalls beyond 5 s
	catchError(() => of([] as SearchResult[])), // final fallback: empty results
)
```

**`finalize` for guaranteed cleanup:**

```typescript
searchOnQuery().pipe(
	finalize(() => action$.next({ type: 'SEARCH_CLEARED' })),
)
```

`finalize` runs whether the stream completes normally, errors out, or is unsubscribed. Use it
to reset loading state or release resources when a component is destroyed — the Observable
equivalent of a `finally` block.
