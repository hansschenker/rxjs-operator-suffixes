# debounce vs throttle — same input, different output

```ascii
input$:    --a-b-c-----------d--|
           (burst of a, b, c then a long pause then d)

── debounceTime(5) ───────────────────────────────────────────
output$:   -----------c-------d--|
           (fires 5 units after the last value in the burst)
           (d fires on source complete — pending debounced value emits)

── throttleTime(5) ───────────────────────────────────────────
output$:   --a-----------d--|
           (fires on leading edge, blocks for 5 units)
           (b and c land inside the block window and are suppressed)
           (d arrives after the window closes — fires as the next leading edge)
```

**Read it:**
- `debounce` waits for silence. While a, b, and c keep arriving, the internal timer resets on each one. The timer only elapses after c — 5 units of silence pass before d arrives, so c fires. d fires immediately on source completion because no further values reset the timer.
- `throttle` fires the first value (a) immediately and then blocks all values for 5 units. b and c arrive inside the block window and are silently discarded. Once the window closes, d is the next value and fires as a new leading edge.

**Use when:**
- `debounceTime`: waiting for the user to stop typing (search, autocomplete, form validation)
- `throttleTime`: rate-limiting high-frequency events where you want immediate feedback (scroll, mouse move, resize)

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, throttleTime, map } from 'rxjs/operators';

const keyup$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
	map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
);

// Debounce: search only after the user pauses
const search$ = keyup$.pipe(debounceTime(300));

// Throttle: show live character count at most once per 100ms
const charCount$ = keyup$.pipe(throttleTime(100));
```
