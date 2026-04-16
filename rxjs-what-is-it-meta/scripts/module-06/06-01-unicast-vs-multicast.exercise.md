---
module: 6
lesson: "6.1"
title: Unicast vs Multicast
exercise: Fix a NotificationService that runs three independent producers by making it multicast.
difficulty: intermediate
---

## Scenario

A `NotificationService` exposes a cold Observable (HTTP polling every 5 seconds). Three components subscribe to the same `notifications$` property. Because the Observable is cold, each subscription creates its own independent interval and fires its own separate HTTP request — three polling loops run in parallel instead of one shared loop.

## Starter Code

```typescript
import { interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface Notification { id: number; message: string; }

// BUG: cold Observable — each subscribe creates an independent producer
class NotificationService {
	readonly notifications$: Observable<Notification[]> = interval(5000).pipe(
		switchMap(() => ajax.getJSON<Notification[]>('/api/notifications')),
	);
}

const service = new NotificationService();
// Three independent HTTP polling loops start:
service.notifications$.subscribe(n => renderHeader(n));
service.notifications$.subscribe(n => renderBadge(n));
service.notifications$.subscribe(n => updateCount(n));

declare function renderHeader(n: Notification[]): void;
declare function renderBadge(n: Notification[]): void;
declare function updateCount(n: Notification[]): void;
```

## Task

1. Explain why three separate polling loops start when `notifications$` is subscribed to three times.
2. Fix `notifications$` so one polling loop runs and its emissions are shared by all three consumers.
3. Ensure late subscribers see the most recent notification set immediately without waiting for the next poll interval.

## Hint

The Observable/Subscription distinction is everything — sharing the Subscription object is not the same as sharing the producer. The producer must be multicast.
