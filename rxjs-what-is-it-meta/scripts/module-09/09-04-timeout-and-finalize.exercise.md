---
module: 9
lesson: "9.4"
title: timeout and finalize
exercise: Add timeout detection and guaranteed spinner cleanup to an HTTP request that may stall silently.
difficulty: intermediate
---

## Scenario

An HTTP request for a large report sometimes stalls for 30+ seconds with no response. The loading spinner stays visible indefinitely, and the user cannot tell if the page is loading or broken. Two problems need fixing: a timeout that converts silence into an error, and guaranteed spinner cleanup that runs no matter how the stream ends.

## Starter Code

```typescript
import { ajax } from 'rxjs/ajax';
import { map, timeout, catchError, finalize } from 'rxjs/operators';
import { Observable, of, throwError, TimeoutError } from 'rxjs';

interface ReportData { rows: unknown[]; generatedAt: string; }

function setSpinner(visible: boolean): void {
	document.getElementById('spinner')!.style.display = visible ? 'block' : 'none';
}

// BUG: no timeout — stalled request shows spinner forever
// BUG: no finalize — spinner stays if request errors or is unsubscribed
const report$: Observable<ReportData> = ajax
	.getJSON<ReportData>('/api/report/large')
	.pipe(
		map((data: ReportData) => ({ ...data, rows: data.rows.slice(0, 1000) })),
		// EXERCISE: add timeout and finalize here
	);

setSpinner(true);
report$.subscribe({
	next: (data: ReportData) => renderReport(data),
	error: (err: unknown) => console.error('Report failed:', err),
});
declare function renderReport(data: ReportData): void;
```

## Task

1. Add `timeout({ each: 10000 })` to the pipe so the stream errors if no emission arrives within 10 seconds.
2. Add `catchError(err => err instanceof TimeoutError ? of({ rows: [], generatedAt: 'timeout' }) : throwError(() => err))` to handle timeout specifically without swallowing other errors — import `TimeoutError` from `'rxjs'`.
3. Add `finalize(() => setSpinner(false))` and explain in a comment why `tap({ complete: () => setSpinner(false) })` would not work here.

## Hint

`timeout` detects frozen streams — a fast stream is unaffected. `finalize` is the only cleanup hook that fires on all three termination paths: complete, error, and unsubscribe.
