---
module: 8
lesson: "8.5"
title: merge, concat, race
exercise: Implement a cache-or-network data fetching strategy using race so the faster source wins.
difficulty: intermediate
---

## Scenario

A product detail page should load data from the in-memory cache if it was recently fetched, otherwise wait for the network. Both cache and network are Observable sources. Whichever responds first should provide the data — and the loser should be unsubscribed immediately to avoid a duplicate render or a wasted network request completing silently.

## Starter Code

```typescript
import { race, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface Product { id: number; name: string; price: number; }

function getCachedProduct(id: number): Observable<Product | null> {
	// Returns the cached value immediately if available, or never emits if cache is empty
	const cache: Map<number, Product> = new Map([[1, { id: 1, name: 'Cached Widget', price: 9.99 }]]);
	const cached = cache.get(id);
	return cached ? of(cached) : new Observable<Product>(() => {}); // never emits
}

function fetchProduct(id: number): Observable<Product> {
	return ajax.getJSON<Product>(`/api/products/${id}`).pipe(delay(500));
}

// EXERCISE: use race() so the faster source wins and the loser is unsubscribed
const productId = 1;
const product$: Observable<Product> = /* ??? */;

product$.subscribe((product: Product) => renderProduct(product));
declare function renderProduct(product: Product): void;
```

## Task

1. Implement `product$` using `race()` with `getCachedProduct(productId)` and `fetchProduct(productId)` as the two competitors.
2. Explain what happens to the network request when the cache wins — is the in-flight HTTP request actually cancelled?
3. Test the scenario where `productId = 99` (not in cache) — which source wins, and why?

## Hint

`race()` subscribes to all sources simultaneously and takes only the first to emit, unsubscribing all others. Whether the network request is cancelled depends on whether the inner Observable has teardown logic.
