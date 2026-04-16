---
module: 7
lesson: "7.3"
title: concatMap
exercise: Implement an ordered animation sequence using concatMap so each animation plays only after the previous one completes.
difficulty: intermediate
---

## Scenario

A UI tour shows three animated steps in sequence: highlight the search bar, then the results panel, then the action button. Using `mergeMap` caused all three to animate simultaneously. Using `switchMap` caused each new step to cancel the previous animation mid-play. Only one operator preserves strict sequential ordering.

## Starter Code

```typescript
import { of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators'; // BUG: should not be mergeMap
import { Observable } from 'rxjs';

interface AnimationStep { element: string; duration: number; }

function animate(step: AnimationStep): Observable<string> {
	return new Observable<string>(subscriber => {
		console.log(`Animating: ${step.element}`);
		const timer = setTimeout(() => {
			subscriber.next(`${step.element} done`);
			subscriber.complete();
		}, step.duration);
		return () => clearTimeout(timer);
	});
}

const steps$ = of(
	{ element: 'search-bar',    duration: 800 },
	{ element: 'results-panel', duration: 600 },
	{ element: 'action-button', duration: 400 },
);

// BUG: mergeMap runs all three simultaneously instead of sequentially
const tour$ = steps$.pipe(
	mergeMap((step: AnimationStep) => animate(step)),
);

tour$.subscribe((result: string) => console.log(result));
```

## Task

1. Replace `mergeMap` with the correct operator so animations play in order, each starting only after the previous one completes.
2. Add a comment explaining why `switchMap` would also be wrong here — what would happen to the search-bar animation when the results-panel step is emitted?
3. Describe the memory risk of using this operator on a source that emits 1000 items with slow inner Observables.

## Hint

Serial, ordered execution — the operator that never starts the next inner Observable until the current one completes.
