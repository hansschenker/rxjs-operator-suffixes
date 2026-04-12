# One Model for Every Data Source — Code Sample

**Section:** Origins
**Insight:** Unified Programming Model
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let's see the unified model in action. I want to show you two completely different data sources — a DOM event stream and a timer — being processed with exactly the same operators. That identity is the point.

```typescript
import { fromEvent, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Source 1: DOM events
const clicks$ = fromEvent<MouseEvent>(document, 'click').pipe(
  map(e => `Click at ${e.clientX},${e.clientY}`)
);

// Source 2: A timer
const ticks$ = interval(1000).pipe(
  map(n => `Tick ${n}`)
);

// Same operators — different sources
clicks$.pipe(take(3)).subscribe(console.log);
ticks$.pipe(take(3)).subscribe(console.log);
```

Let's walk through this. The first source, `clicks$`, is created with `fromEvent`. We pass it the document and the string `'click'`, and it returns an Observable that will emit a `MouseEvent` every time the user clicks anywhere on the page. The generic type annotation `<MouseEvent>` isn't strictly required, but it gives us proper type inference downstream, so I include it as a habit.

Inside the first `pipe`, we apply `map` to transform each `MouseEvent` into a human-readable string using `e.clientX` and `e.clientY` — the pixel coordinates of the click. After this map, `clicks$` is an `Observable<string>`.

The second source, `ticks$`, is created with `interval`. It accepts a period in milliseconds — 1000 here, so one second — and returns an Observable that emits an incrementing integer every second: 0, 1, 2, 3, and so on. Inside its `pipe`, we apply `map` again, this time converting the integer into a string like "Tick 0" or "Tick 1".

Now look at the bottom two lines. Both `clicks$` and `ticks$` are processed with `take(3)` before subscribing. `take(3)` is an operator that passes through the first three emissions and then completes the Observable automatically, cleaning up any underlying resources. For the click stream, that means the subscription ends after three clicks. For the timer, it ends after the third tick — three seconds.

The critical observation is that `map` and `take` appear in both pipelines, performing the same logical role in each. These operators don't know they're operating on mouse events or on timer ticks. They don't have any awareness of the source. They operate on values — plain JavaScript values — and the source is completely hidden behind the Observable interface.

This is why you can write an operator like `take` once in the RxJS codebase and have it work correctly on every Observable ever created. It doesn't need to know about DOM APIs, timers, WebSockets, or HTTP clients. It just counts values and signals completion. That's source independence. And it's the same insight LINQ demonstrated in C# twenty years ago: define the operator against the interface, not against the source, and your query vocabulary becomes infinitely reusable.
