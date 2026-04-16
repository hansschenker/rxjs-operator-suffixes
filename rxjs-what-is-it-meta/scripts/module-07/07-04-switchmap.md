---
module: 7
lesson: "7.4"
title: switchMap — cancel on new, built for live queries
key_insight: switchMap cancels the previous inner Observable every time a new outer value arrives. This makes it correct for live queries — and the wrong choice for any operation where every result must be processed.
related: ["7.1", "7.5"]
---

## Hook

`switchMap` is the most elegant flattening operator for the most common frontend scenario: a user types, the app searches, and only the last search matters. It is also the most commonly misused operator — applied to save operations where it silently cancels in-flight writes, leaving data in an inconsistent state with no error in the console.

## Insight

When a new outer value arrives, `switchMap` immediately unsubscribes from the currently active inner Observable and subscribes to a new one built from the latest outer value. Previous inner Observables that are still running are cancelled, and their results are discarded permanently — no error is thrown, no signal is emitted.

Concurrency is always 0 or 1: either idle or running exactly one inner Observable — always the most recently started one. The word "switch" describes exactly this: it switches to the latest and abandons the rest.

This is the precisely correct behaviour for live queries. When a user types "r", "rx", "rxj", "rxjs" in a search box, each keystroke triggers a new inner Observable (an HTTP request). By the time the response for "rxj" arrives, the user has already typed "rxjs" — the "rxj" result is outdated and should be discarded. `switchMap` does this automatically.

Where `switchMap` is wrong: form submits (if the user submits twice, only the second fires — the first is cancelled), save operations (data may never be written), analytics events (every event must be recorded, not just the last). The distinguishing question is: does every input value produce a result that must be delivered, or only the latest one? If every result matters, `switchMap` is the wrong operator.

## Example

```ascii
search$:       --a------b----c--------|
               switchMap(query => search(query))
search(a):     ----A(result_a)
search(b):           ----B(result_b)
search(c):                 ----C(result_c)
output$:       ---------------C-------|
```

`a` and `b` are cancelled when `b` and `c` arrive respectively. Only `result_c` reaches the subscriber. The HTTP requests for `a` and `b` are aborted — the browser cancels them if the inner Observable uses `ajax` or `fromFetch`.

```typescript
interface SearchResult { query: string; hits: string[]; }

// Typeahead search — only the latest query matters
searchInput$.pipe(
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((query: string) =>
		ajax.getJSON<SearchResult>(`/api/search?q=${query}`)
	),
).subscribe((result: SearchResult) => renderResults(result));
```

## Summary

- `switchMap` cancels the previous inner Observable every time a new outer value arrives — at most one inner Observable is ever active
- Correct for live queries, typeahead search, and profile loading where only the latest input is relevant
- Wrong for writes, form submits, analytics, or any operation where every input must produce a result that is delivered downstream
