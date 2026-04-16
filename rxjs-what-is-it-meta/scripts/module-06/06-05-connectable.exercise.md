---
module: 6
lesson: "6.5"
title: connectable
exercise: Use connectable() to delay producer start until all three consumers are registered, then demonstrate that all three receive every emission.
difficulty: advanced
---

## Scenario

A data export pipeline must not start until three downstream processors (CSV writer, JSON logger, analytics tracker) have all registered their subscriptions. Using `share()` would start the producer as soon as the first consumer subscribes, causing the other two to miss early emissions. Manual producer lifecycle control is required.

## Starter Code

```typescript
import { interval, connectable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface ExportRecord { index: number; value: string; }

const source$ = interval(100).pipe(
	take(5),
	map((i: number): ExportRecord => ({ index: i, value: `record-${i}` })),
);

// EXERCISE: wrap source$ in connectable() so start is manual
const export$: /* ??? */ = /* ??? */;

// Three consumers register BEFORE connect() is called:
export$.subscribe((r: ExportRecord) => console.log('CSV:', r.index));
export$.subscribe((r: ExportRecord) => console.log('JSON:', r.index));
export$.subscribe((r: ExportRecord) => console.log('Analytics:', r.index));

// EXERCISE: start the producer now that all consumers are ready
/* ??? */;
```

## Task

1. Implement `export$` using `connectable()` with a `Subject` connector so all subscribers share the same producer.
2. Add the line that starts execution after all three subscribers are attached.
3. Show what would happen if `share()` were used instead — which consumers would miss the first emission, and why?

## Hint

`connectable()` exposes the producer lifecycle directly. `connect()` is the key that starts the shared execution — call it after all consumers have subscribed.
