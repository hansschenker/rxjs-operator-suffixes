# RxJS Is a DSL for Time-Varying Values — Code Sample

**Section:** Composition & Concurrency
**Insight:** DSL for time-varying values
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This snippet demonstrates the core characteristic of a DSL for time-varying values: you declare a relationship once, and the library maintains it automatically as inputs change.

```typescript
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Two time-varying values — their relationship is declared, not computed imperatively
const width$  = new BehaviorSubject<number>(800);
const height$ = new BehaviorSubject<number>(600);

// This is a declaration: "area is always width × height"
const area$ = combineLatest([width$, height$]).pipe(
  map(([w, h]) => w * h)
);

area$.subscribe(area => console.log('Area:', area)); // 480000

width$.next(1024);   // area$ automatically recomputes → 614400
height$.next(768);   // area$ automatically recomputes → 786432
```

Two BehaviorSubjects — width$ and height$. A BehaviorSubject holds a current value and emits it immediately to any new subscriber. It's the right type for a time-varying value that always has a present value: the current width of a canvas, the current user preference, the current filter selection. The dollar-sign suffix marks it as an Observable.

The relationship is declared on the next line. combineLatest takes an array of Observables and emits a combined array of their latest values whenever any of them changes. pipe(map) then transforms that pair of numbers into their product. The result, area$, is itself an Observable — a time-varying value derived from two other time-varying values.

Notice what we haven't written. We haven't written an event handler on width$ that calls a recalculate function. We haven't written shared mutable state storing the last known width and height. We haven't written a recomputeArea function that gets called in two places. We declared the relationship — area is always width times height — and subscribed to see the results.

When we subscribe, combineLatest emits immediately because both BehaviorSubjects already have values. 800 times 600 is 480000. The subscriber logs it.

Then width$.next(1024) pushes a new value into the width BehaviorSubject. combineLatest detects that one of its sources emitted. It combines the new width with the latest height — still 600 — and forwards the pair to the map function. 1024 times 600 is 614400. The subscriber logs that automatically, without any manual invocation.

Then height$.next(768). Same mechanism. combineLatest sees a new height. It combines it with the latest width — now 1024 — and the map produces 786432. Logged automatically.

This is what it means to work in a DSL for time-varying values. You don't write "when A changes, update result." You write "result is always this function of A and B." The maintenance of that relationship is the library's job, not yours. The code you write is a description of the domain model, not a set of instructions for keeping the model consistent.

The same pattern scales up. A shopping cart total is always the sum of item prices combined with the latest tax rate. A submit button's disabled state is always the logical OR of form-invalid and in-flight. A displayed username is always the latest auth token mapped to a user display name. Each of these is a time-varying value derived from other time-varying values. Each of them is a combineLatest with a map. That's the DSL at work — a vocabulary for describing derived state rather than procedures for updating it.
