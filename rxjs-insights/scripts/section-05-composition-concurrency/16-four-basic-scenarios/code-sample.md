# Four Scenarios, One Library — Code Sample

**Section:** Composition & Concurrency
**Insight:** Four basic scenarios
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This snippet places one small example for each of the four scenarios side by side. The goal isn't to cover every operator; it's to make the diagnostic pattern concrete.

```typescript
import { of, merge } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

// Scenario 1: No Observable — create one
const source$ = of(1, 2, 3);

// Scenario 2: One Observable — transform values
const doubled$ = source$.pipe(
  map(x => x * 2)
);

// Scenario 3: Many Observables — combine into one
const combined$ = merge(
  of('a', 'b'),
  of('c', 'd')
);

// Scenario 4: Nested Observables — flatten
const nested$ = of(1, 2).pipe(
  mergeMap(x => of(x * 10, x * 100))
);

doubled$.subscribe(v => console.log('Doubled:', v));      // 2, 4, 6
combined$.subscribe(v => console.log('Combined:', v));    // a, b, c, d
nested$.subscribe(v => console.log('Flattened:', v));     // 10, 100, 20, 200
```

Scenario one. The line `of(1, 2, 3)` is all you need. You didn't have an Observable. You used a creation operator to make one from static values. In a real application this might be fromEvent wrapping a button click, or ajax wrapping an HTTP call, or interval representing a polling timer. The diagnosis is the same: no Observable yet — reach for the creation family.

Scenario two. source$ already exists, but we want different values out of it. We pipe it through map. This is pure value transformation — one stream in, one stream out with each value multiplied by two. doubled$ doesn't subscribe, doesn't run, doesn't produce anything until that last subscribe call. It's a description of a transformation, not the execution of one. In a real application this might be several operators chained together: map, filter, distinctUntilChanged, scan for accumulation. The diagnosis is: one Observable, different shape wanted — reach for the transformation family.

Scenario three. We have two separate Observables — of('a', 'b') and of('c', 'd'). Neither knows about the other. We want a single Observable that emits from both. merge subscribes to both simultaneously and forwards every emission as it arrives. Because both sources are synchronous of calls, they emit in sequence — 'a', 'b', then 'c', 'd'. With asynchronous sources the order would depend on timing. The key is that merge doesn't wait for one to complete before subscribing to the other. In a real application this might be merge combining click events from two different buttons, or combineLatest combining a user's auth state with their preferences. The diagnosis is: many Observables — reach for the combination family.

Scenario four. of(1, 2) emits integers, but each integer needs to become multiple values — two in this case. mergeMap maps each outer value to an inner Observable and subscribes to all inner Observables concurrently, forwarding their emissions to the output. So the value 1 becomes of(10, 100), which emits 10 then 100. The value 2 becomes of(20, 200), which emits 20 then 200. Because both inner Observables are synchronous and mergeMap is concurrent, you get 10, 100, 20, 200 in that order. In a real application this might be mergeMap from a stream of user IDs to HTTP requests fetching each user's data. The diagnosis is: nested Observables — reach for the flattening family and pick the right concurrency policy.

Four diagnostics. Four operator families. One mental model that makes the hundred-operator surface navigable.
