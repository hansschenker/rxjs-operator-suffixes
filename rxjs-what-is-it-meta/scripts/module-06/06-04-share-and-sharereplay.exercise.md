---
module: 6
lesson: "6.4"
title: share and shareReplay
exercise: Diagnose and fix a stale-data bug caused by shareReplay without refCount, then demonstrate the difference between share and shareReplay for a late subscriber.
difficulty: intermediate
---

## Scenario

After a user logs out and logs back in, the profile panel still shows the previous user's name for several seconds. The bug is in `UserProfileService` — `shareReplay(1)` is keeping a stale cached value alive after the subscription should have reset. A fresh subscriber after logout gets the old cached user from the previous session.

## Starter Code

```typescript
import { ajax } from 'rxjs/ajax';
import { shareReplay, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface UserProfile { id: number; name: string; email: string; }

// BUG: shareReplay without refCount — stale cache survives after logout
class UserProfileService {
	readonly profile$: Observable<UserProfile> = ajax
		.getJSON<UserProfile>('/api/profile')
		.pipe(
			map((p: UserProfile) => ({ ...p, name: p.name.trim() })),
			shareReplay(1),   // BUG
		);
}

// Demonstrate the bug:
const service = new UserProfileService();
const sub = service.profile$.subscribe(p => console.log('User:', p.name));
sub.unsubscribe(); // logout

// After re-login, new subscriber gets STALE cached value instead of fresh request:
service.profile$.subscribe(p => console.log('After login:', p.name));
```

## Task

1. Explain why `shareReplay(1)` produces stale data after all subscribers unsubscribe.
2. Fix the service using `shareReplay({ bufferSize: 1, refCount: true })` so the cache resets when the last subscriber unsubscribes.
3. Add a comment showing what `share()` would produce for a late subscriber instead — and when that trade-off is acceptable.

## Hint

`share()` is a live radio broadcast — late subscribers miss what already aired. `shareReplay(1)` is a replay buffer — but without `refCount: true`, the buffer never invalidates.
