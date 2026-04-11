---
marp: true
theme: uncover
title: "switchMap: live queries, search, cancellation"
---

# switchMap: live queries, search, cancellation
> Every live search that doesn't cancel stale requests risks rendering yesterday's results after today's — `switchMap` is the operator that makes that impossible.

---

## Core Concept

- `switchMap` projects each outer value to an inner Observable, subscribes to it, and **immediately unsubscribes from the previous inner** when the next outer value arrives
- Only **one inner Observable is ever active** at a time — memory is O(1)
- Cancellation is real RxJS unsubscription: HTTP aborts, timers clear, WebSockets close
- Rule verbatim: *"When a new outer value arrives, unsubscribe from the current inner and subscribe to the new one"*
- Completes only when the outer completes **and** the last active inner completes

---

## How It Works

```
outer:    --a-----------b-------c--->
          switchMap(v => inner$(v))

inner(a):   ----A1--A2--A3--|
inner(b):               --B1--B2--|
inner(c):                      --C1--|

output:   ------A1--A2----B1------C1--|
                ↑                ↑
          inner(a) cancelled   inner(b) cancelled
          when b arrives        when c arrives
```

`inner(a)` never emits `A3` in the output — it was unsubscribed mid-flight the moment `b` arrived on the outer stream.

---

## Common Mistake

```typescript
// ❌ Nested subscriptions — what intermediate devs reach for first
query$.subscribe(q => {
  http.get(`/search?q=${q}`).subscribe(results => {
    render(results);
    // Problem 1: all requests run concurrently with no cancellation
    // Problem 2: a slow earlier request can resolve AFTER a fast later one
    //            → user typed "rx", then "rxjs", but sees results for "rx"
    // Problem 3: no cleanup — subscriptions leak on component destroy
  });
});
```

The inner `subscribe` call has no reference to tear down — there is no mechanism to cancel the in-flight request when the next query arrives.

---

## The Right Way

```typescript
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

searchInput$.pipe(
  debounceTime(300),              // wait for typing to pause before firing
  distinctUntilChanged(),          // skip if the query string hasn't changed
  switchMap(query =>               // ← cancel previous inner, start fresh
    searchApi$(query).pipe(
      catchError(() => of([])),    // ← catch INSIDE the inner so outer survives
    )
  ),
).subscribe(renderResults);
// One active HTTP request at a time. Stale results are physically impossible.
```

Always place `catchError` **inside** the `switchMap` projection — an unhandled inner error would terminate the entire outer stream.

---

## Key Rule

> **`switchMap` guarantees that only the result of the most recent outer emission ever reaches your subscriber — use it for any live query where a stale response arriving late is a bug, not a nuisance.**