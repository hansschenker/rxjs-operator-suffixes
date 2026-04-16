---
module: 10
lesson: "10.4"
title: Testing with TestScheduler and marble diagrams
key_insight: TestScheduler lets you fake time in marble notation, making every time-based operator deterministic and synchronous in tests — a marble test for a debounced search proves behavior that would take 300ms in real time, in under 1ms.
related: ["5.1", "10.5"]
---

## Hook

Testing a `debounceTime(300)` pipeline in real time means your test suite waits 300ms per assertion. Ten such tests cost three seconds of wall time — and that is before flakiness introduced by CI machines under load, where `setTimeout` fires late. `TestScheduler` eliminates both problems: the 300ms runs as a single virtual tick, the assertion completes synchronously, and flakiness is architecturally impossible because there is no real clock involved.

## Insight

`TestScheduler` lives in `rxjs/testing`. Its `run()` method accepts a callback that receives a set of helper functions: `hot`, `cold`, `expectObservable`, `expectSubscriptions`, and `flush`. Inside that callback, all time-based operators — `debounceTime`, `throttleTime`, `delay`, `timeout`, `interval`, `timer` — use virtual time instead of the real clock.

Marble notation is the language of virtual time. Each character in a marble string represents one frame, which by default equals 10 virtual milliseconds. The key characters: `-` is one frame (10ms) of silence; a letter like `a` or `b` is an emission at that position; `|` is completion; `#` is an error; `(ab)` is two synchronous emissions at the same frame; `^` marks the subscription point (hot observables only); `!` marks the unsubscribe point.

The difference between `hot` and `cold` matters. A `cold` observable starts its sequence from the moment it is subscribed — like an HTTP request. A `hot` observable is already running at time zero — like a UI event stream. Use `cold` for the inner observables produced by your HTTP layer. Use `hot` for the outer query or event source that triggers them.

Domain facades are the natural target for marble tests. Mock the HTTP dependency with a cold observable, run the facade pipeline inside `run()`, and assert the output marble. If the facade uses `debounceTime(300)` internally, the test describes that as 30 frames in the marble string, not as a literal 300ms wait.

## Example

```typescript
import { TestScheduler } from 'rxjs/testing';
import { debounceTime, switchMap } from 'rxjs/operators';
import { describe, test, expect } from 'vitest';

interface SearchResult { id: number; title: string; }

function searchFacade(
	query$: Observable<string>,
	search$: (q: string) => Observable<SearchResult[]>,
): Observable<SearchResult[]> {
	return query$.pipe(
		debounceTime(300),
		switchMap((q: string) => search$(q)),
	);
}

describe('searchFacade', () => {
	test('emits only the final query after a burst of keystrokes', () => {
		const scheduler = new TestScheduler((actual, expected) => {
			expect(actual).toEqual(expected);
		});

		scheduler.run(({ hot, cold, expectObservable }) => {
			// Frames: each '-' = 10ms. 300ms debounce = 30 frames.
			const query$    = hot('--a-b-c--------------------------------|');
			//                     ^ bursts of keystrokes, only 'c' survives debounce
			const search$   = (_q: string) => cold('--r|', { r: [{ id: 1, title: 'hit' }] });
			const expected  =     '-----------------------------(r|)-------';
			//                                                    ^ 30 frames after 'c'

			const result$ = searchFacade(query$, search$);

			expectObservable(result$).toBe(expected, {
				r: [{ id: 1, title: 'hit' }],
			});
		});
	});
});
```

The test runs in under 1ms. The 300ms debounce, the `switchMap` flattening, and the async HTTP response are all asserted from a readable, deterministic marble string.

## Summary

- `TestScheduler.run()` virtualises all time-based operators — no real clock, no flakiness, no `sleep` calls
- Marble notation: `-` = 10ms frame, letter = emission, `|` = complete, `#` = error, `(ab)` = synchronous group
- `hot()` for event sources already running at time zero; `cold()` for per-subscription sequences like HTTP
- Domain facades are the natural marble test unit — inject the HTTP layer as a `cold()` mock
- `expectObservable` asserts the entire temporal structure of the output in a single readable string

## Pitfall

Using `setTimeout`, `Date.now()`, or `setInterval` inside a `TestScheduler.run()` block. Real timers run in wall-clock time, not virtual time — they never fire inside the virtual scheduler's synchronous execution. All time in marble tests must come from RxJS schedulers (the ones `TestScheduler` replaces). If your operator uses a non-RxJS timer, marble testing cannot control it.
