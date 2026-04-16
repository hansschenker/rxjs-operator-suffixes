---
module: 9
lesson: "9.5"
title: Error Handling Decision Tree
exercise: Apply the three-strategy decision tree to four error scenarios and implement the correct strategy for each.
difficulty: advanced
---

## Scenario

A production dashboard has four different error sources. Each needs a different error-handling strategy — using the same strategy for all four would either cause infinite loops, hide critical errors, freeze the UI, or — most dangerously — duplicate financial transactions.

## Starter Code

```typescript
import { ajax } from 'rxjs/ajax';
import { retry, catchError, throwError, tap, timer } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface DashboardConfig { theme: string; layout: string; }
interface UserProfile { id: number; name: string; }
interface MetricData { value: number; unit: string; }
interface PaymentResult { transactionId: string; }

// Scenario A: Dashboard config — network timeout, idempotent GET
// Strategy: ??? (retry / recover / rethrow)
const config$: Observable<DashboardConfig> = ajax
	.getJSON<DashboardConfig>('/api/config')
	.pipe(
		/* EXERCISE: apply the correct strategy */
	);

// Scenario B: User profile — 401 Unauthorized (auth token expired)
// Strategy: ??? (retry / recover / rethrow — what does rethrow enable here?)
const profile$: Observable<UserProfile> = ajax
	.getJSON<UserProfile>('/api/profile')
	.pipe(
		/* EXERCISE: apply the correct strategy — this should trigger a re-auth flow */
	);

// Scenario C: Live metric feed — malformed JSON from server
// Strategy: ??? (retry / recover — emit a zero-value metric and continue)
const metrics$: Observable<MetricData> = ajax
	.getJSON<MetricData>('/api/metrics/live')
	.pipe(
		/* EXERCISE: apply the correct strategy */
	);

// Scenario D: Payment submit — never retry, report all errors
// Strategy: ??? (retry is WRONG here — explain why)
const payment$: Observable<PaymentResult> = ajax
	.post<PaymentResult>('/api/payment', { amount: 99 })
	.pipe(
		/* EXERCISE: apply the correct strategy */
	);
```

## Task

1. For each of the four scenarios, identify the correct strategy (retry / recover / rethrow) and implement it with the appropriate RxJS operator.
2. For Scenario B, show what the `rethrow` strategy enables — what centralised handler would catch the re-thrown error, and how does it trigger a re-auth redirect?
3. For Scenario D, write a one-sentence comment explaining why `retry` would be dangerous.

## Hint

Three questions determine the strategy — Is the error transient and the operation idempotent? → retry. Do you have a meaningful fallback? → recover. Must the error reach a centralised handler? → rethrow.
