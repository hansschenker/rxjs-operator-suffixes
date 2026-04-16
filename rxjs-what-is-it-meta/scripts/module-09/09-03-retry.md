---
module: 9
lesson: "9.3"
title: retry and the resilience ladder
key_insight: retry resubscribes to the source Observable from scratch after every error. This is powerful for transient failures — and dangerous for non-idempotent operations where repeating the request causes duplicate side effects.
related: ["9.2", "9.5"]
---

## Hook

A network request fails. The sensible response is usually: try again. `retry` does exactly this — but "from scratch" is the phrase that catches most developers off guard. Retry does not resume a paused stream. It creates an entirely new subscription to the source Observable, triggering a completely new execution. For a GET request this is harmless. For a payment charge or a form submit, it is a disaster.

## Insight

`retry(count)` is the simplest form: on error, resubscribe up to `count` times before allowing the error through. If the source succeeds on any attempt, the retry is transparent — downstream sees normal `next` emissions.

RxJS 7 introduced the configuration object form, which adds crucial control:

- `retry({ count: 3, delay: 1000 })` — wait 1 second between each attempt
- `retry({ count: 5, delay: (err: unknown, attempt: number) => timer(Math.pow(2, attempt) * 1000) })` — exponential backoff, doubling the wait on each attempt

The `delay` function form receives the error and the attempt number (1-indexed), and returns an Observable whose first emission triggers the next retry attempt. This makes `timer()` the natural pairing — `timer(ms)` emits once after a delay and then completes.

**When to use retry:**
- Idempotent HTTP GET requests and read-only operations
- WebSocket reconnection after a dropped connection
- Polling sources where re-subscription is safe and expected

**When not to use retry:**
- Form submits that write data to the server
- Payment processing or any operation with financial side effects
- Any mutation that is not explicitly designed to be idempotent

The critical safety rule: always bound retries with a count. `retry()` with no argument retries infinitely — a source that never recovers will spin forever. Always follow `retry` with a `catchError` as the terminal handler for when all attempts are exhausted.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { retry, catchError } from 'rxjs/operators';
import { of, timer, Observable } from 'rxjs';

interface ApiResponse { data: string[] }

// Basic retry with delay: 3 attempts, 1 second apart, then empty fallback
const resilientData$: Observable<ApiResponse> = ajax
	.getJSON<ApiResponse>('/api/data')
	.pipe(
		retry({ count: 3, delay: 1000 }),
		catchError(() => of<ApiResponse>({ data: [] })),
	);

// Exponential backoff: delays of 2s, 4s, 8s before final failure
const withBackoff$: Observable<ApiResponse> = ajax
	.getJSON<ApiResponse>('/api/data')
	.pipe(
		retry({
			count: 3,
			delay: (_err: unknown, attempt: number) => timer(Math.pow(2, attempt) * 1000),
		}),
		catchError(() => of<ApiResponse>({ data: [] })),
	);

// WRONG — do not retry a form submit
// formSubmit$.pipe(retry(3)) // dangerous: may create 3 duplicate records
```

The rule is simple: if calling the operation twice produces the same result as calling it once, retry is safe. If calling it twice produces double the effect, retry is dangerous.

## Summary

- `retry` resubscribes to the source from scratch — it creates a new execution, not a resume
- Safe for idempotent reads; dangerous for writes, payments, and non-idempotent mutations
- Always provide a count — unbounded `retry()` creates infinite loops on permanent failures
- Pair exponential backoff with `timer()` in the `delay` function for production-grade resilience
- Always follow `retry` with `catchError` as the final safety net when all attempts are exhausted

## Pitfall

Using `retry()` with no argument, which retries infinitely. On a permanently failing endpoint — a server that is down, a URL that does not exist — `retry()` creates an infinite loop of HTTP requests until the browser tab is closed or crashes. Always bound retries with a count: `retry(3)` or `retry({ count: 3 })`.
