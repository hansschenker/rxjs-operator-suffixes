# A Pipeline Is a Dependency Graph — Code Sample

**Section:** Design Patterns
**Insight:** Pipeline as dependency graph
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This sample makes the graph structure visible by placing `tap` at every node, so you can literally see values passing through each step and count the nodes in action.

```typescript
import { interval } from 'rxjs';
import { map, filter, tap, take } from 'rxjs/operators';

interval(200).pipe(
  tap(n  => console.log('  [node 1 — source]:', n)),
  filter(n => n % 2 === 0),
  tap(n  => console.log('  [node 2 — after filter]:', n)),
  map(n  => n * n),
  tap(n  => console.log('  [node 3 — after map]:', n)),
  take(3)
).subscribe(n => console.log('[subscriber — exit node]:', n));
```

Let me trace the execution.

`interval(200)` emits `0, 1, 2, 3, ...` every 200 milliseconds. The first `tap` at node 1 logs every emission from the source — this is before any filtering. You'd see `0, 1, 2, 3, ...` appearing here regardless of what the rest of the pipeline does with the values.

Then `filter(n => n % 2 === 0)` passes only even numbers. Odd values — `1, 3, 5` — are dropped here. They appear in node 1 but never reach node 2. That's the graph at work: values stop propagating downstream when a node decides not to forward them.

The second `tap` at node 2 shows only even numbers: `0, 2, 4, 6`. These are the values that survived the filter.

`map(n => n * n)` squares each even number. The third `tap` at node 3 shows the squared values: `0, 4, 16, 36`.

`take(3)` lets through the first three values that reach it — `0, 4, 16` — and then completes the stream. The subscriber logs those three values.

Now notice what happens with `take(3)`. After the third value, the stream completes. That completion signal propagates upstream through the graph: the subscriber completes, `take` unsubscribes from `map`, `map` unsubscribes from the second `tap`, the second `tap` unsubscribes from `filter`, `filter` unsubscribes from the first `tap`, and the first `tap` unsubscribes from `interval`. The interval stops ticking. The entire graph is torn down, right to left, automatically.

If you removed `take(3)`, the interval would run forever and all graph nodes would stay alive — a memory and resource leak. That's the practical importance of understanding teardown propagation. The graph stays alive until something terminates it.

`tap` is making the invisible visible here. In production code, you'd remove the `tap` calls, but the graph structure is identical. Each operator is a node, values flow downstream, teardown propagates upstream. `tap` just lets you observe that truth directly.
