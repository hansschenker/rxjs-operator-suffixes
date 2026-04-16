---
module: 1
lesson: "1.5"
title: The 3-Step Workflow — enter, transform, exit
exercise: Refactor mixed-zone code so all side effects live exclusively in the exit zone.
difficulty: intermediate
---

## Scenario

The code below was written by a developer who mixed side effects into the transformation zone. It works, but it is impure, untestable, and has a subtle bug that only shows up when the Observable is subscribed to more than once.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

const input = document.getElementById('search') as HTMLInputElement;

// BUG: side effects scattered through the transformation zone
const results$ = fromEvent<Event>(input, 'input').pipe(
	map((e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		console.log('[search] query changed:', value);                    // BUG
		document.getElementById('spinner')!.style.display = 'block';     // BUG
		return value;
	}),
	filter((v: string) => v.length > 2),
	debounceTime(300),
	map((query: string) => {
		const result = `Searching for: ${query}`;
		localStorage.setItem('lastQuery', query);                        // BUG
		return result;
	}),
);

results$.subscribe((result: string) => {
	document.getElementById('spinner')!.style.display = 'none';
	document.getElementById('results')!.textContent = result;
});
```

## Task

1. Identify and list the three side effects currently inside the transformation zone.
2. Rewrite the pipeline, moving all side effects into `tap()` operators. The `map` operators must become pure — they return only a transformed value and touch nothing outside.
3. Explain in two sentences why putting `document.getElementById('spinner').style.display = 'block'` inside `map` creates a bug when `results$` is subscribed to twice.

## Hint

The pure transformation zone must contain only functions that take a value and return a new value — no logging, no DOM mutation, no storage writes. Use `tap` to declare those side effects without breaking the zone's purity contract.
