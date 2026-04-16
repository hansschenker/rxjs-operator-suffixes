---
module: 10
lesson: "10.1"
title: The Alias + Wrap pattern — domain-specific operator naming
key_insight: The Alias + Wrap pattern renames RxJS operators with domain-specific names, making the pipeline readable to domain experts and the operators testable in isolation by RxJS experts — a clean seam between the two.
related: ["3.5", "10.2"]
---

## Hook

An RxJS pipeline full of `switchMap`, `debounceTime`, and `distinctUntilChanged` is unreadable to a domain expert. Hand that same file to a trading desk analyst or a product manager and they see noise, not logic. But rename those operators to `loadOnSearch`, `waitForUserPause`, and `ignoreRepeatQuery` and the pipeline becomes self-documenting — readable to everyone, maintainable by anyone who knows RxJS. The Alias + Wrap pattern is how you achieve that split without sacrificing testability.

## Insight

The pattern has two steps. First, write the raw RxJS logic as a pure parameterized function — an `OperatorFunction<T, R>` that does exactly one thing. Second, export a domain-named wrapper that calls it and adds the cross-cutting context that belongs at the domain boundary: specific error messages, logging annotations, and test seams.

The test seam is the most important part. Instead of hard-coding the HTTP call inside the operator, inject it as a function parameter. `switchMap(query => searchApi(query))` becomes `searchOnQuery(searchApi: (q: string) => Observable<Result[]>)` — a parameterized operator that accepts the API function as a dependency. In tests, you pass a mock that returns `of(fakeResults)`. In production, you pass the real implementation. The function signature is the seam: domain users read the name, RxJS experts maintain the internals, and the boundary between those two worlds is just a function signature.

This keeps components clean. A search component should not contain `switchMap` — it should contain `searchOnQuery`. The component author does not need to know what flattening strategy is appropriate. The operator author encapsulates that decision once and names it correctly.

The pattern scales to entire facades: a `TradingFacade` module exports only domain-named operators. The `switchMap`, `throttleTime`, and `scan` inside are implementation details that never leak.

## Example

```typescript
import { Observable } from 'rxjs';
import { switchMap, throttleTime, scan } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

interface PriceUpdate { symbol: string; price: number; }
interface TradeVolume { symbol: string; total: number; }

// Raw operator — pure RxJS logic, no domain name
function rawThrottlePriceUpdates(): OperatorFunction<PriceUpdate, PriceUpdate> {
	return throttleTime<PriceUpdate>(100);
}

// Raw operator — accumulates trade volume using scan
function rawAccumulateTradeVolume(): OperatorFunction<PriceUpdate, TradeVolume> {
	return (source$: Observable<PriceUpdate>) =>
		source$.pipe(
			scan(
				(acc: TradeVolume, update: PriceUpdate): TradeVolume => ({
					symbol: update.symbol,
					total: acc.total + update.price,
				}),
				{ symbol: '', total: 0 },
			),
		);
}

// Domain aliases — names the domain team reads and understands
export const throttlePriceUpdates = rawThrottlePriceUpdates;
export const accumulateTradeVolume = rawAccumulateTradeVolume;

// Pipeline reads as pure domain language — no RxJS vocabulary visible
const dashboard$: Observable<TradeVolume> = priceUpdates$.pipe(
	throttlePriceUpdates(),
	accumulateTradeVolume(),
);
```

The component that uses `dashboard$` imports only domain names. The `throttleTime(100)` decision lives in one place and is tested there. Changing the throttle window to `150` is a single-line change with no component touchpoints.

## Summary

- Alias = rename the operator with a domain-meaningful name; no other change required
- Wrap = add error context, logging annotations, and injectable dependencies as function parameters
- The function parameter (injected dependency) is the test seam — swap the real API for a mock in tests
- Domain users read the names; RxJS experts maintain the internals; the function signature is the clean boundary between the two worlds

## Pitfall

Naming the wrapper function the same as the RxJS operator it wraps. `export const switchMap = (apiFn) => rxjsSwitchMap(...)` shadows the imported RxJS `switchMap` in any file that imports both, causing confusing "not a function" errors. Domain operator names must be distinct from the RxJS operators they wrap — that naming distinction is the entire point of the pattern.
