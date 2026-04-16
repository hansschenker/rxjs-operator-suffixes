---
module: 3
lesson: "3.4"
title: tap vs map
exercise: Replace side effects inside map() with tap(), and ensure map() contains only pure transformations.
difficulty: beginner
---

## Scenario

An analytics-enriched user pipeline was written by someone who didn't know about `tap`. Every `map` call does both a transformation and a side effect. The code works in production, but it is impossible to unit-test the transformation logic without also triggering analytics calls — and the side effects run a second time if the pipeline is subscribed to twice.

## Starter Code

```typescript
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

interface RawUser { id: number; name: string; email: string; active: boolean; }
interface DisplayUser { id: number; displayName: string; initials: string; }

declare const analytics: { track: (event: string, data: unknown) => void };
declare const logger: { info: (msg: string) => void };

declare const rawUsers$: Observable<RawUser>;

const displayUsers$ = rawUsers$.pipe(
	filter((u: RawUser) => u.active),
	map((u: RawUser) => {
		// BUG: side effect mixed into transformation
		analytics.track('user_seen', { id: u.id });
		logger.info(`Processing user ${u.id}`);
		return {
			id: u.id,
			displayName: u.name.trim().toUpperCase(),
			initials: u.name.split(' ').map(w => w[0]).join('').toUpperCase(),
		} satisfies DisplayUser;
	}),
	map((u: DisplayUser) => {
		// BUG: another side effect mixed into transformation
		localStorage.setItem(`user-${u.id}`, JSON.stringify(u));
		return u;
	}),
);
```

## Task

1. Rewrite the pipeline so that both `map` calls are pure — they return a transformed value and do nothing else.
2. Move the `analytics.track` and `logger.info` calls into a `tap` before the first `map`. Move the `localStorage.setItem` call into a `tap` after the second `map`.
3. Explain in one sentence why the `satisfies DisplayUser` annotation is preferable to a type cast (`as DisplayUser`) for the return type of the pure `map`.

## Hint

`map` is for transformation: in goes one value, out comes another, nothing else happens. `tap` is for observation: the value passes through unchanged, and the side effect fires. Keep them separate and both become independently testable.
