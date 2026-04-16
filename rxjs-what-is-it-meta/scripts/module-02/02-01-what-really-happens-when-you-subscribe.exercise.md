---
module: 2
lesson: "2.1"
title: What really happens when you subscribe
exercise: Fix a service that fires duplicate HTTP requests because two components subscribe to the same cold Observable.
difficulty: intermediate
---

## Scenario

A `UserService` exposes a `currentUser$` Observable that fetches the logged-in user. Two components both subscribe to it on page load. The network tab shows two identical `GET /api/me` requests firing simultaneously. Fix the service so exactly one HTTP request fires regardless of how many components subscribe.

## Starter Code

```typescript
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface User { id: number; name: string; role: string; }

// BUG: every subscribe() call fires a new HTTP request
class UserService {
	readonly currentUser$: Observable<User> = ajax
		.getJSON<User>('/api/me')
		.pipe(map((user: User) => ({ ...user, role: user.role.toUpperCase() })));
}

// Two components subscribe — two GET /api/me requests fire
const service = new UserService();
service.currentUser$.subscribe((user: User) => console.log('Header:', user.name));
service.currentUser$.subscribe((user: User) => console.log('Sidebar:', user.role));
```

## Task

1. Explain in one sentence exactly why two requests fire.
2. Fix `UserService` so exactly one HTTP request fires regardless of subscriber count.
3. Ensure late subscribers (those who subscribe after the HTTP response arrives) also receive the user value without triggering a new request.

## Hint

Each `subscribe()` call is not a listener — it is a fresh execution. To share one execution, the Observable must be multicast using `shareReplay` with `bufferSize` and `refCount` configured explicitly.
