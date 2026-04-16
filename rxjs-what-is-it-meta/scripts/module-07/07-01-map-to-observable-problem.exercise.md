---
module: 7
lesson: "7.1"
title: The map-to-Observable Problem
exercise: Fix code that maps to an Observable and gets Observable<Observable<T>> — select and apply the correct flattening operator.
difficulty: beginner
---

## Scenario

A user ID stream needs to load user profiles from an API. The developer used `map` to transform each ID into an HTTP request, producing `Observable<Observable<UserProfile>>`. Nothing renders because the inner Observables are never subscribed to — they are just values flowing through the stream, not active requests.

## Starter Code

```typescript
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface UserProfile { id: number; name: string; }

const userIds$ = of(1, 2, 3);

// BUG: map produces Observable<Observable<UserProfile>> — inner Observables never subscribe
const profiles$: Observable<Observable<UserProfile>> = userIds$.pipe(
	map((id: number) => ajax.getJSON<UserProfile>(`/api/users/${id}`)),
);

profiles$.subscribe(inner => {
	// inner is Observable<UserProfile>, not UserProfile — nothing renders
	console.log(inner); // logs Observable {}, not { id: 1, name: '...' }
});
```

## Task

1. Explain in one sentence why `profiles$` is typed as `Observable<Observable<UserProfile>>`.
2. Fix the pipeline by replacing `map` with the correct flattening operator — the three requests should run in parallel (order does not matter).
3. Update the `subscribe` callback to receive `UserProfile` values directly and log `profile.name`.

## Hint

When you map a value to an Observable, you need to flatten the result. The four flattening operators each answer the same question differently — which one you choose depends on the concurrency requirement.
