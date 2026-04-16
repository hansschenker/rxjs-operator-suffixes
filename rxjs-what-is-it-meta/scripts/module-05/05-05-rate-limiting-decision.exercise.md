---
module: 5
lesson: "5.5"
title: Rate-limiting decision
exercise: Apply the two-question decision framework to choose the correct rate-limiting operator for four different UI interactions.
difficulty: intermediate
---

## Scenario

A developer is building a responsive dashboard with four event sources that all need rate limiting. Without a decision framework, they reach for `debounceTime` everywhere by habit, producing subtle UX bugs: scroll handlers that never fire during fast scrolls, resize handlers that miss the final dimension, payment buttons that can be double-submitted, and search boxes that fire too eagerly. The two-question framework — (1) can data be lost? (2) leading, trailing, or periodic? — selects the right operator every time.

## Starter Code

```typescript
import { fromEvent, interval, Observable } from 'rxjs';
import {
	map, debounceTime, throttleTime, auditTime, sampleTime,
} from 'rxjs/operators';

// Source A: window scroll events — update a "scroll %" indicator
const scroll$ = fromEvent<Event>(window, 'scroll').pipe(
	map(() => Math.round((window.scrollY / document.body.scrollHeight) * 100)),
);
const scrollPercent$ = scroll$.pipe(/* ??? */);

// Source B: window resize events — recompute a chart's SVG dimensions
const resize$ = fromEvent<Event>(window, 'resize').pipe(
	map(() => ({ width: window.innerWidth, height: window.innerHeight })),
);
const chartDimensions$ = resize$.pipe(/* ??? */);

// Source C: payment submit button — charge a card, must not double-fire
const payButton = document.getElementById('pay')! as HTMLButtonElement;
const payClick$ = fromEvent<MouseEvent>(payButton, 'click');
const payment$ = payClick$.pipe(/* ??? */);

// Source D: search input — fire autocomplete query after typing pause
const searchInput = document.getElementById('search')! as HTMLInputElement;
const search$ = fromEvent<Event>(searchInput, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value),
);
const autocomplete$ = search$.pipe(/* ??? */);

// Source E: A server-sent dashboard metric that arrives continuously.
// You need to sample it at fixed 2-second intervals regardless of how fast it emits.
const metric$ = interval(200).pipe(map(i => ({ value: i * 3.14, unit: 'rps' })));
const sampledMetric$: Observable<{ value: number; unit: string }> = /* ??? */;
```

## Task

1. For each of the four sources, answer the two framework questions: (a) can data be lost without breaking correctness? (b) should the first value fire immediately (leading), the last value after silence (trailing), or a periodic sample?
2. Apply the correct operator to each source. Choose from: `throttleTime`, `debounceTime`, `auditTime`, `sampleTime`. Justify each in one sentence.
3. Explain why `debounceTime` applied to Source A (scroll) produces a broken UX: describe the specific failure mode when the user scrolls continuously for 3 seconds.
4. Implement `sampledMetric$` for Source E using the operator that samples at fixed periodic intervals regardless of emission rate. Explain in one sentence why `throttleTime` would give different (wrong) behavior here.

## Hint

Two questions decide everything: (1) "Can I drop intermediate values?" — if yes, lossy strategies are fine. (2) "Do I want the first value (leading), the last value after a pause (trailing), or a regular sample?" Leading + lossy = `throttleTime({ leading: true, trailing: false })`. Trailing after silence = `debounceTime`. Trailing at end of window = `auditTime`. Periodic sample regardless of activity = `sampleTime`. Periodic sampling at fixed intervals regardless of source rate = `sampleTime` — `throttleTime` would only fire on the leading edge of each window and stay silent if the source goes quiet, so it is wrong when you need a guaranteed tick every N ms.
