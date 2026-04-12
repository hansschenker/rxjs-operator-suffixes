# UI Events as First-Class Citizens — Code Sample

**Section:** Origins
**Insight:** Rx.NET made UI events first-class
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

Let me show you the composability of first-class events directly. We're going to take two separate DOM event streams — mousedown and mouseup — and compose them into a single unified stream without any shared state, without any flags, and without any callbacks coordinating with each other.

```typescript
import { fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
  map(() => 'pressed')
);
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
  map(() => 'released')
);

// Two event sources composed into one stream — no shared state, no callbacks
merge(mouseDown$, mouseUp$).subscribe(console.log);
```

Let's read through this. The first two declarations create Observables from DOM events using `fromEvent`. `mouseDown$` wraps the document's `mousedown` event, and `mouseUp$` wraps `mouseup`. The generic type `<MouseEvent>` is there for TypeScript to infer the event type correctly.

Each Observable is immediately transformed with `map`. Notice that the map callback for `mouseDown$` uses the arrow function `() => 'pressed'` — it ignores the event entirely and returns a fixed string. We don't care about the coordinates or the button pressed in this example. We just care that mousedown happened. Same for `mouseUp$`: it maps every mouseup event to the string `'released'`. After these pipes, both `mouseDown$` and `mouseUp$` are `Observable<string>` — they've been reduced to simple string streams.

The key line is `merge(mouseDown$, mouseUp$)`. The `merge` creator function accepts any number of Observables and combines them into a single stream that emits whenever any of the source Observables emits. It doesn't care what the sources are — they're both `Observable<string>`, and it forwards their values in arrival order. When the user presses the mouse button, the string `'pressed'` appears. When they release it, `'released'` appears. One subscription, one coherent stream, no shared state.

Now contrast this with the callback approach. You'd write `document.addEventListener('mousedown', () => { isDown = true; console.log('pressed'); })` and `document.addEventListener('mouseup', () => { isDown = false; console.log('released'); })`. To coordinate them, you need that `isDown` flag living somewhere in scope. And the moment you want to do something more complex — say, log presses and releases to a server, but only if they occur within a certain area of the screen — you're adding more shared state and more coupling between your two handlers.

With the Observable approach, adding that constraint is a matter of adding a `filter` to `mouseDown$` before the `map`. No changes to `mouseUp$`. No new shared state. The composition handles the coordination.

This is the promise of first-class events. Because `mouseDown$` and `mouseUp$` are values — proper JavaScript values that you can store in a variable, pass to a function, or hand to any operator — you can compose them the same way you compose any other data. And `merge` is just one of many composition strategies. You could use `combineLatest`, `zip`, `withLatestFrom`, or a flattening operator — and all of them would work on these event streams just as naturally. That flexibility is what Rx.NET introduced, and it's what RxJS delivers in the browser today.
