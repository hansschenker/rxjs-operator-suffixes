---
module: 8
lesson: "8.3"
title: withLatestFrom
exercise: Fix a silent bug where withLatestFrom drops the first button click because the secondary source hasn't emitted yet.
difficulty: intermediate
---

## Scenario

An "Add to Cart" button click should capture the currently selected product and add it to the cart. The product is loaded via HTTP on page open. If the user clicks "Add to Cart" before the product HTTP response arrives, the click is silently swallowed — no error, no feedback, no cart addition.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { withLatestFrom, map, filter } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface Product { id: number; name: string; price: number; }
interface CartItem { productId: number; name: string; }

const addToCartBtn = document.getElementById('add-to-cart') as HTMLButtonElement;
const productId = 42;

const product$ = ajax.getJSON<Product>(`/api/products/${productId}`);
const clicks$ = fromEvent<MouseEvent>(addToCartBtn, 'click');

// BUG: if the user clicks before product$ emits, the click is silently dropped
const cartAdditions$: Observable<CartItem> = clicks$.pipe(
	withLatestFrom(product$),
	map(([_, product]: [MouseEvent, Product]) => ({
		productId: product.id,
		name: product.name,
	})),
);

cartAdditions$.subscribe((item: CartItem) => addToCart(item));
declare function addToCart(item: CartItem): void;
```

## Task

1. Explain in one sentence why the first click is silently dropped when the product hasn't loaded yet.
2. Add `startWith(null)` to `product$` so `withLatestFrom` always has a value to sample.
3. Add a `filter` after `withLatestFrom` that discards any `[click, null]` pairs so `addToCart` is never called with a null product.

## Hint

`withLatestFrom` silently produces no output until the secondary source has emitted. Guard with `startWith(null)` and filter out the null before it reaches downstream logic.
