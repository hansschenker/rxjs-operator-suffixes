---
module: 9
lesson: "9.3"
title: retry
exercise: Add bounded exponential-backoff retry to a flaky HTTP request, then explain why the same pattern must not be applied to a form submit.
difficulty: intermediate
---

## Scenario

A dashboard metrics endpoint is flaky — it fails about 20% of the time due to intermittent server issues. The fix is to retry automatically with increasing delays. The developer initially wrote `retry()` with no arguments and accidentally created an infinite request loop on permanent failures, hammering the server until the user closed the tab.

## Starter Code

```typescript
import { ajax } from 'rxjs/ajax';
import { retry, catchError, map } from 'rxjs/operators';
import { of, timer, Observable } from 'rxjs';

interface MetricsResponse { cpu: number; memory: number; requests: number; }

// BUG: retry() with no arguments retries infinitely on permanent failure
const metrics$: Observable<MetricsResponse> = ajax
	.getJSON<MetricsResponse>('/api/metrics')
	.pipe(
		retry(),   // BUG: infinite retries
		map((data: MetricsResponse) => ({ ...data, cpu: Math.round(data.cpu) })),
	);

metrics$.subscribe({
	next: (m: MetricsResponse) => renderMetrics(m),
	error: (err: unknown) => console.error('Metrics load failed:', err),
});
declare function renderMetrics(m: MetricsResponse): void;
```

## Task

1. Fix the `retry()` call with a bounded count of 3 and exponential backoff — use `retry({ count: 3, delay: (_, attempt) => timer(Math.pow(2, attempt - 1) * 1000) })` to produce delays of 1s, 2s, 4s between attempts.
2. Add `catchError(() => of({ cpu: 0, memory: 0, requests: 0 }))` after `retry` as a final fallback for when all retries are exhausted.
3. Write a comment explaining why this exact `retry` pattern must NOT be copied onto a form submit handler — what would go wrong with 3 automatic retries on a payment POST?

## Hint

`retry` resubscribes to the source Observable from scratch — safe for idempotent reads, dangerous for writes where repeating the operation causes duplicate side effects.
