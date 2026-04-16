# concatMap — serial queue, in order

```ascii
triggers$:   --A--B--C---------------|
              concatMap(x => animate$(x))

animate$(A): ------a1--a2--|
animate$(B):               ------b1--b2--|
animate$(C):                             ------c1--c2--|

output$:     ------a1--a2------b1--b2------c1--c2--|
```
B and C queue; each waits for its predecessor to complete before subscribing.

**Read it:** When B arrives while A is still animating, B is held in a queue. It does not start until A completes. C waits behind B. Every trigger produces a result; no trigger is dropped. The output preserves arrival order.

**Use when:** ordering matters and every input must produce an output — animations that must play in sequence, ordered writes, undo/redo stacks.

```typescript
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface AnimStep { element: string; duration: number; }

function animate(step: AnimStep): Observable<string> {
	return new Observable<string>(observer => {
		const id = setTimeout(() => {
			observer.next(step.element);
			observer.complete();
		}, step.duration);
		return () => clearTimeout(id);
	});
}

const trigger$ = new Subject<AnimStep>();

const animation$ = trigger$.pipe(
	concatMap((step: AnimStep) => animate(step)),
);
```
