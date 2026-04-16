---
module: 3
lesson: "3.3"
title: Subscribe as the impure boundary
exercise: Consolidate scattered subscribe() calls to the outer boundary using takeUntil(destroy$).
difficulty: intermediate
---

## Scenario

A UI component has three subscriptions created in different places — one in the constructor that streams live prices, one in a click handler that fires a one-off load, and one in a lifecycle hook that syncs a form field. None of them are ever unsubscribed. When the component is removed from the DOM, all three subscriptions keep running and emit into detached DOM nodes.

## Starter Code

```typescript
import { Observable, Subject, fromEvent } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface Price { symbol: string; value: number; }
interface Product { id: number; name: string; }

class ProductDashboard {
	private priceDisplay = document.getElementById('price')!;
	private productList = document.getElementById('products')!;
	private nameField = document.getElementById('name') as HTMLInputElement;

	private prices$: Observable<Price>;
	private loadButton = document.getElementById('load')!;
	private formInput$: Observable<string>;

	constructor(prices$: Observable<Price>, formInput$: Observable<string>) {
		this.prices$ = prices$;
		this.formInput$ = formInput$;

		// BUG: subscription in constructor, never cleaned up
		this.prices$.subscribe((p: Price) => {
			this.priceDisplay.textContent = `${p.symbol}: ${p.value}`;
		});
	}

	onMount(): void {
		// BUG: subscription in event handler, never cleaned up
		fromEvent(this.loadButton, 'click').pipe(
			switchMap(() => ajax.getJSON<Product[]>('/api/products')),
		).subscribe((products: Product[]) => {
			this.productList.innerHTML = products.map(p => `<li>${p.name}</li>`).join('');
		});

		// BUG: subscription in lifecycle hook, never cleaned up
		this.formInput$.pipe(
			map((v: string) => v.trim()),
		).subscribe((name: string) => {
			this.nameField.value = name;
		});
	}

	onDestroy(): void {
		// Nothing here — all three streams keep running
	}
}
```

## Task

1. Add a `destroy$` Subject to the class and emit from it in `onDestroy()`.
2. Refactor the class to use a single subscription boundary: move all three `subscribe()` calls into `onMount()` (or keep them in their current places if appropriate) and attach `takeUntil(this.destroy$)` to each pipeline.
3. Explain in two sentences why consolidating subscriptions to `onMount` and using `takeUntil(destroy$)` is safer than manually calling `.unsubscribe()` on each stored subscription reference.

## Hint

`takeUntil(destroy$)` converts the tear-down concern from imperative bookkeeping into a declarative push event. When `destroy$` emits, every pipeline that references it completes automatically — no stored subscription references, no risk of forgetting one.
