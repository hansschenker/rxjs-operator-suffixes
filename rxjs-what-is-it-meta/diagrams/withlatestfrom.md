# withLatestFrom — primary triggers output, secondary is sampled

```ascii
clicks$:   ----A---------B---------C--|
prices$:   --10---20---------30-------|

clicks$.pipe(withLatestFrom(prices$)):

output$:   ----[A,10]----[B,20]----[C,30]--|
```
Output fires only when `clicks$` emits. The current value of `prices$` is sampled at that moment. `prices$` never triggers output on its own.

**Read it:** When A clicks, the latest price is 10 → [A,10]. By the time B clicks, price has updated to 20 → [B,20]. When price updates to 30 before C, C samples 30 → [C,30]. If clicks$ fires before prices$ has emitted anything, that click is silently dropped — no output, no error.

**Use when:** a user action needs the current value of a stream that it should not depend on for triggering — "Add to Cart" button click that captures the currently selected product.

```typescript
import { fromEvent } from 'rxjs';
import { withLatestFrom, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

interface Product { id: number; name: string; price: number; }
interface CartItem { product: Product; quantity: number; }

const addToCart$ = fromEvent<Event>(
	document.getElementById('add-btn')!,
	'click',
);

const selectedProduct$ = new BehaviorSubject<Product | null>(null);

const cartItem$ = addToCart$.pipe(
	withLatestFrom(selectedProduct$),
	map(([_, product]: [Event, Product | null]): CartItem | null =>
		product ? { product, quantity: 1 } : null,
	),
);
```
