---
module: 10
lesson: "10.3"
title: withTelemetry
exercise: Implement a withTelemetry wrapper and apply it to searchOnQuery so all telemetry is added in one place.
difficulty: advanced
---

## Scenario

The `searchOnQuery` operator needs logging, error tracking, and duration metrics. Writing those three concerns directly into the operator body creates tight coupling — telemetry cannot be toggled, cannot be reused, and breaks tests that mock the operator. The fix is to add telemetry as a transparent decorator.

## Starter Code

```typescript
import { Observable, OperatorFunction } from 'rxjs';
import { tap, catchError, finalize, throwError, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface TelemetryService {
	log(event: string, data?: unknown): void;
	trackError(operatorName: string, error: unknown): void;
	trackDuration(operatorName: string, durationMs: number): void;
}

// EXERCISE: implement withTelemetry
function withTelemetry<T>(
	operatorName: string,
	operator: OperatorFunction<T, T>,
	telemetry: TelemetryService,
): OperatorFunction<T, T> {
	return (source$: Observable<T>): Observable<T> => {
		/* EXERCISE:
		   1. Record start time using Date.now()
		   2. Use tap to log each input value (entry telemetry)
		   3. Apply the wrapped operator
		   4. Use tap to log each output value (success telemetry)
		   5. Use catchError to track errors then rethrow
		   6. Use finalize to record duration
		*/
		return /* ??? */;
	};
}

interface SearchResult { id: number; title: string; }

// Raw operator to wrap
function rawSearchOnQuery(
	apiFn: (q: string) => Observable<SearchResult[]>,
): OperatorFunction<string, SearchResult[]> {
	return switchMap(apiFn);
}

// EXERCISE: export the telemetry-wrapped version
declare const telemetry: TelemetryService;
declare function searchProducts(q: string): Observable<SearchResult[]>;
export const searchOnQuery = /* ??? */;
```

## Task

1. Implement `withTelemetry` using `tap`, `catchError`, `finalize`, and a closure for the start time — the wrapped operator is applied in the middle of the pipeline.
2. Export `searchOnQuery` as `withTelemetry('searchOnQuery', rawSearchOnQuery(searchProducts), telemetry)`.
3. Explain in one sentence why `finalize` must be used for duration tracking instead of `tap({ complete: ... })`.

## Hint

`withTelemetry` is AOP — the cross-cutting concern (telemetry) is declared once and applied transparently. The wrapped operator's interface is identical to the original; the telemetry is invisible to the caller.
