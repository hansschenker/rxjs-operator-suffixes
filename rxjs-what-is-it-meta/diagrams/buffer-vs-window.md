# buffer vs window — collect without losing, two forms

```ascii
source$:   --1--2--3--4--5--6--7--8--|
boundary$: --------X-----------X-----|

── buffer(boundary$) ────────────────────────────────────────
output$:   --------[1,2,3]-----[4,5,6,7]--[8]--|
           (emits T[] arrays; trailing values collected into a final array on source complete)

── window(boundary$) ────────────────────────────────────────
output$:   --------W1----------W2------W3--|
           W1 emits: 1, 2, 3 then completes
           W2 emits: 4, 5, 6, 7 then completes
           W3 emits: 8 then completes (on source complete)
           (emits Observable<T> windows — must subscribe to each)
```

**Read it:**
- `buffer`: collects all values between boundary signals into an array and emits that array as a single `T[]` value. Simple to consume — just subscribe once.
- `window`: opens an inner Observable for each window. The inner Observable emits individual values in real time as the source emits. Subscriber must subscribe to each inner Observable. More complex but necessary when values arrive too fast to batch, or when each value needs to be processed as it arrives within the window.

**Use when:**
- `buffer`: collecting mouse clicks within a time window, batching log events for a network flush, grouping scroll events for analytics
- `window`: streaming large datasets with per-chunk processing, real-time sub-stream processing where buffering would be too memory-intensive

```typescript
import { fromEvent, interval } from 'rxjs';
import { bufferTime, windowTime, mergeAll } from 'rxjs/operators';

// Buffer: collect all clicks in 1-second windows, emit as arrays
const clickBatch$ = fromEvent<MouseEvent>(document, 'click').pipe(
	bufferTime(1000),
);

// Window: same clicks, but as inner Observables for real-time processing
const clickWindow$ = fromEvent<MouseEvent>(document, 'click').pipe(
	windowTime(1000),
	mergeAll(),
);
```
