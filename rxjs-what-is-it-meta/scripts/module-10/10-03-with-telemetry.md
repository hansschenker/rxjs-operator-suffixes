---
module: 10
lesson: "10.3"
title: withTelemetry — aspect-oriented operators
key_insight: withTelemetry is a higher-order operator wrapper that adds logging, metrics, and error tracking to any operator without changing its logic — Aspect-Oriented Programming applied to streams.
related: ["10.2", "3.4"]
---

## Hook

Every custom operator in a production system eventually needs the same three things: log what came in, log what went out, and record what went wrong. Writing those three concerns into every operator is duplication that compounds over time — twenty operators means twenty places to update when the logging format changes. `withTelemetry` writes those concerns once and applies them to any operator transparently, without touching the operator's logic at all.

## Insight

`withTelemetry` takes two arguments: an operator name string and the raw `OperatorFunction<T, T>` to wrap. It returns a new `OperatorFunction<T, T>` that behaves identically to the original — same input type, same output type, same error behavior — but with four cross-cutting behaviors injected around it:

A `tap` before the operator logs the incoming value and records a call counter. A `tap` after the operator logs the outgoing value and records a success metric with duration. A `catchError` catches any error, logs it with the operator name as context, records an error metric, and rethrows — so downstream error handling is unaffected. A `finalize` records the total duration regardless of how the stream ended.

This is Aspect-Oriented Programming applied to streams. In traditional AOP, a cross-cutting concern like logging is declared once in an aspect and woven into target functions without modifying them. `withTelemetry` is that weave for RxJS operators: the concern is declared once, and all operators that are wrapped inherit it automatically.

The integration into the Alias + Wrap pattern is seamless. After writing the raw domain operator, export it wrapped: `export const searchOnQuery = withTelemetry('searchOnQuery', rawSearchOnQuery)`. From that point forward, every call to `searchOnQuery` in any pipeline emits metrics and logs to whatever telemetry backend you configure — without any change to the components using it, and without any change to the operator's tests (because the wrapped operator still has the same signature and same output).

## Example

```typescript
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

interface Telemetry {
	log: (event: string, data: unknown) => void;
	increment: (metric: string) => void;
	timing: (metric: string, ms: number) => void;
}

function withTelemetry<T>(
	operatorName: string,
	operator: OperatorFunction<T, T>,
	telemetry: Telemetry,
): OperatorFunction<T, T> {
	return (source$: Observable<T>) => {
		const start = Date.now();
		return source$.pipe(
			tap((value: T) => telemetry.log(`${operatorName}:input`, value)),
			operator,
			tap((value: T) => {
				telemetry.log(`${operatorName}:output`, value);
				telemetry.increment(`${operatorName}.success`);
			}),
			catchError((err: unknown) => {
				telemetry.log(`${operatorName}:error`, err);
				telemetry.increment(`${operatorName}.error`);
				return throwError(() => err); // rethrow — downstream unchanged
			}),
			finalize(() => telemetry.timing(`${operatorName}.duration`, Date.now() - start)),
		);
	};
}

// Usage: raw operator wrapped once, telemetry inherited everywhere
const rawSearchOnQuery = (api: SearchApi): OperatorFunction<string, SearchResult[]> =>
	switchMap((q: string) => api(q));

export const searchOnQuery = (api: SearchApi): OperatorFunction<string, SearchResult[]> =>
	withTelemetry('searchOnQuery', rawSearchOnQuery(api), productionTelemetry);
```

Every pipeline that uses `searchOnQuery` is now instrumented. Changing the telemetry format means editing `withTelemetry` in one place.

## Summary

- `withTelemetry` wraps any `OperatorFunction<T, T>` and returns the same type — zero signature change
- Injects four cross-cutting behaviors: input log, output log + metric, error log + metric, duration timing
- All injected behaviors are side effects placed in `tap`, `catchError`, and `finalize` — never in `map`
- This is AOP for streams: write the cross-cutting concern once, apply it to all operators transparently
- Wrapped operators have identical signatures — all existing tests pass without modification
