# debounce vs throttle — same input, different output

```ascii
input$:    --a-b-c-----d--e-f-g-----h--|

debounceTime(3):
output$:   --------c-----------g-----h--|
           (emits after 3 units of silence)

throttleTime(3):
output$:   --a---------d----------h--|
           (emits leading value, blocks for 3 units)
```

**Read it:**
- `debounce` waits for a pause. If values keep arriving, nothing emits. The emission fires only after the input goes silent for the specified duration. c emits because there is a gap after it; a and b are suppressed.
- `throttle` emits the first value immediately, then blocks all subsequent values for the duration. a emits (leading edge); b and c are suppressed during the block window. d emits as the next leading edge.

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
