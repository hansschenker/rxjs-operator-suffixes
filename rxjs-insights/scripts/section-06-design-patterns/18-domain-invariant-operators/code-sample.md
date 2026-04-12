# Operators Don't Know Your Domain — Code Sample

**Section:** Design Patterns
**Insight:** Domain-invariant operators
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let me walk you through a code sample that makes the domain-invariance principle concrete by putting two completely different domains side by side.

```typescript
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface GpsPoint { lat: number; lng: number; accuracy: number }
interface Frame    { time: number; x: number; y: number; visible: boolean }

// GPS domain
const gps$ = of<GpsPoint>(
  { lat: 47.1, lng: 8.5, accuracy: 5  },
  { lat: 47.2, lng: 8.6, accuracy: 50 }
).pipe(
  filter(p => p.accuracy < 10),
  map(p => `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
);

// Animation domain — identical operators, different types
const animation$ = of<Frame>(
  { time: 0,  x: 0,  y: 0,  visible: true  },
  { time: 16, x: 10, y: 5,  visible: false }
).pipe(
  filter(f => f.visible),
  map(f => `(${f.x}, ${f.y})`)
);

gps$.subscribe(console.log);       // "47.1000, 8.5000"
animation$.subscribe(console.log); // "(0, 0)"
```

We have two interfaces: `GpsPoint` with latitude, longitude, and accuracy; and `Frame` with a timestamp, x and y coordinates, and a visible flag. These are completely different domains — geographic data and animation data — with nothing in common structurally.

Look at the GPS pipeline first. `of` creates a source with two GPS points. The first has an accuracy of 5 metres, the second has an accuracy of 50 metres. We filter to keep only points where accuracy is below 10, which drops the second point. Then we map the passing point to a formatted coordinate string. The output is `"47.1000, 8.5000"`.

Now look at the animation pipeline. Same structure: `of` with two frames. We filter to keep only visible frames — the second frame with `visible: false` is dropped. We map to a position string. The output is `"(0, 0)"`.

The operator sequence is identical: `filter` then `map`. The operators have no idea what a `GpsPoint` or a `Frame` is. TypeScript knows — it infers the type through the chain and validates that the predicate and projection functions match the element type. But `filter` and `map` as operators don't care. They receive an Observable, apply the function you gave them to each value, and emit the result.

This is the deeper point: the type system is what ensures correctness across domains, not the operators themselves. When you pass `filter(p => p.accuracy < 10)` to a `GpsPoint` Observable, TypeScript guarantees that `p` is a `GpsPoint` and that `accuracy` is a valid property. The operator just executes the predicate.

The practical takeaway is that you can build a mental library of `filter + map` patterns, `debounceTime + switchMap` patterns, `retry + catchError` patterns — and apply those patterns to any domain, confident that the operators will behave identically. You're investing in patterns, not in domain-specific solutions.

Swap the domain, keep the operators. That's the deal RxJS offers.
