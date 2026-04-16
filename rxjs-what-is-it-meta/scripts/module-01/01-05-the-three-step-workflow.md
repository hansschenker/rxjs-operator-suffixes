---
module: 1
lesson: "1.5"
title: The 3-Step Workflow — enter, transform, exit
key_insight: Every RxJS program has exactly three zones — impure entry, pure transformation, impure exit. Code that puts side effects in the middle zone is the source of most RxJS bugs.
related: ["3.1", "3.3"]
---

## Hook

The most common RxJS bugs are not caused by choosing `switchMap` when you should have used `concatMap`. They are caused by putting a `console.log` inside a `map`, dispatching an HTTP call from inside a `filter`, or mutating shared state inside a `mergeMap`. The problem is not the operator — it is the zone. RxJS has a canonical three-zone architecture, and every program that ignores it eventually pays in mysterious, hard-to-reproduce side-effect bugs.

## Insight

Every RxJS program, no matter how complex, moves through exactly three zones.

**Zone 1 — Enter.** Creation operators (`fromEvent`, `interval`, `of`, `from`, `ajax`, `defer`) convert impure real-world sources into Observables. This is the impure-to-pure boundary. A mouse click is messy; `fromEvent(button, 'click')` is a clean, lazy description of that click. Nothing runs yet — you have only described what will happen.

**Zone 2 — Transform.** Every operator inside `pipe()` is a pure function. `map` returns a new Observable. `filter` returns a new Observable. `switchMap` returns a new Observable. Nothing mutates, nothing logs, nothing dispatches. This zone is referentially transparent: you can replace any sub-pipeline with its definition and the program behaves identically. This is where all business logic lives, and it is trivially testable with any source — swap a real `fromEvent` for `of('test')` and the entire pipeline runs identically.

**Zone 3 — Exit.** `subscribe()` is the single impure boundary where planned side effects execute — DOM updates, HTTP dispatches, state mutations, console output. This is the only place effects belong. The sole permitted exception inside the pipe is `tap()`, which is designed explicitly for side effects like debug logging or unavoidable imperatives — but it should be used sparingly and never for business logic.

This three-zone model mirrors the functional programming principle of staying pure as long as possible and moving all effects to the edge of the program.

## Example

A search typeahead with all three zones clearly labelled in comments.

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface Result {
	id: number;
	title: string;
}

const searchInput = document.querySelector<HTMLInputElement>('#search')!;

// Zone 1 — Enter: convert impure DOM source into a pure Observable
const query$ = fromEvent<Event>(searchInput, 'input').pipe(

	// Zone 2 — Transform: pure operators only, no side effects
	map((e: Event) => (e.target as HTMLInputElement).value),
	debounceTime(300),
	distinctUntilChanged(),
	tap((query: string) => console.debug('[search] debounced query:', query)), // debug peek only
	switchMap((query: string) =>
		ajax.getJSON<Result[]>(`/api/search?q=${encodeURIComponent(query)}`),
	),
);

// Zone 3 — Exit: one subscribe call, side effects execute here
query$.subscribe((results: Result[]) => {
	renderList(results); // DOM mutation belongs here
});

function renderList(results: Result[]): void {
	// update DOM
}
```

Notice that `tap` is the only concession inside Zone 2, and it is used only for debug logging — not for dispatching actions or mutating state.

## Summary

- Zone 1 (enter): creation operators convert impure real-world sources into pure Observable descriptions — the impure-to-pure boundary
- Zone 2 (transform): pure operators inside `pipe()` only — no side effects, fully testable by swapping any source
- Zone 3 (exit): one `subscribe()` call at the edge of the program — the only place where side effects legitimately belong

## Pitfall

Putting DOM updates or logging inside `map`. The pure transformation zone must contain only pure functions returning transformed values. A `map` that calls `console.log` or mutates state breaks referential transparency — the same pipe now has different behavior depending on whether it is subscribed once or ten times.
