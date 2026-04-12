# Rename Operators to Speak Your Domain — Code Sample

**Section:** Design Patterns
**Insight:** Custom naming pattern
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This sample shows the custom naming pattern applied to the classic typeahead search case — one of the most common real-world uses of `switchMap`.

```typescript
import { Observable, of, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

// Domain-named custom operator — encapsulates technical RxJS details
const typeaheadSearch = (
  searchApi: (query: string) => Observable<string[]>
): OperatorFunction<string, string[]> =>
  source$ => source$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => searchApi(query).pipe(
      catchError(() => of([]))
    ))
  );

// At the call site — reads like the domain, not the library:
// keystrokes$.pipe(typeaheadSearch(api.search)).subscribe(renderResults);
```

Let me walk through the implementation and then the call site.

`typeaheadSearch` is a factory function — it takes a `searchApi` function as a parameter and returns an `OperatorFunction<string, string[]>`. That return type is just a function from `Observable<string>` to `Observable<string[]>`. Any stream of query strings can be piped through this operator.

Inside, the implementation is the standard typeahead pipeline. `debounceTime(300)` waits for 300 milliseconds of silence after the last keystroke before emitting the query. This prevents a search request on every individual keystroke. `distinctUntilChanged` ensures that if the query hasn't actually changed — maybe the user typed then deleted the same character — we don't trigger a new search. `switchMap` takes the debounced query and calls `searchApi` with it. Critically, `switchMap` cancels any in-flight request from a previous query when a new query arrives. If the user types "re", then "rea", then "reac", then "react", only the search for "react" will complete; the earlier three are cancelled.

The `catchError` inside the `switchMap` — note that it's scoped inside `switchMap`'s inner Observable, not outside it — means that if one search request fails, the error is caught locally and replaced with an empty array. The outer stream doesn't terminate. The user sees an empty result set for that query, and subsequent keystrokes will trigger new searches normally.

The call site is what makes this pattern valuable: `keystrokes$.pipe(typeaheadSearch(api.search)).subscribe(renderResults)`. One line. Reads entirely in domain terms. A product manager could parse this — keystrokes flow into a typeahead search using the search API, and results are rendered.

Compare that to the inline version: `keystrokes$.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => api.search(q).pipe(catchError(() => of([])))), ...).subscribe(renderResults)`. Technically equivalent. Much harder to read at a glance. And if you have two or three search inputs in the application, the inline version is duplicated in each.

The domain name `typeaheadSearch` is the stable interface. The implementation behind it is free to change — add rate limiting, add a minimum query length, switch from HTTP to GraphQL — and no call site needs to know.
