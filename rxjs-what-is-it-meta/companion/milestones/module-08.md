# Module 08 — Combination Operators: combineLatest and withLatestFrom

The app's single `state$` stream can be extended with derived streams using combination operators.

**Example: a live results counter with `combineLatest`**

```typescript
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { state$ } from './state';

const resultsCount$ = combineLatest([state$, of(Date.now())]).pipe(
	map(([state]) => state.results.length),
);
```

`combineLatest` re-emits whenever *either* source emits. Here it re-derives `resultsCount`
every time `state$` changes. Use `combineLatest` when the derived value depends on *all* sources
and must update when any of them changes.

**Example: "Export Results" button with `withLatestFrom`**

```typescript
import { fromEvent } from 'rxjs';
import { withLatestFrom, map } from 'rxjs/operators';
import { state$ } from './state';

const exportBtn = document.getElementById('export') as HTMLButtonElement;

fromEvent(exportBtn, 'click').pipe(
	withLatestFrom(state$),
	map(([_, state]) => state.results),
).subscribe(results => console.log('export', results));
```

`withLatestFrom` *samples* `state$` at the moment of click without subscribing to it as a
trigger. The click drives the stream; state is read as a snapshot. This is the correct pattern
when one stream triggers and another provides context.
