# Operators That Work on Time, Value, or Both — Code Sample

**Section:** The Data Model
**Insight:** Operator families: T / a / both
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let's look at three short pipelines — one for each operator family. The goal is to see, in running code, how each family behaves differently with respect to the {T, a} model.

```typescript
import { of, interval } from 'rxjs';
import { map, delay, auditTime, take } from 'rxjs/operators';

// Operates on 'a' only — timing unchanged
of(1, 2, 3).pipe(
  map(x => x * 2)          // a: 1→2, 2→4, 3→6 | T: unchanged
).subscribe(console.log);   // 2, 4, 6

// Operates on 'T' only — value unchanged
of(42).pipe(
  delay(500)                // a: 42 | T: shifted +500ms
).subscribe(console.log);   // 42 (after 500ms)

// Operates on both 'T' and 'a' — samples value at time boundary
interval(100).pipe(
  auditTime(300),           // picks latest 'a' every 300ms
  take(3)
).subscribe(console.log);   // 2, 5, 8 (approx — latest value per 300ms window)
```

The first pipeline is as simple as it gets. of(1, 2, 3) emits three values synchronously — three {T, a} pairs where T is effectively the same moment. map(x => x * 2) processes each pair and doubles the a value. The T dimension is untouched. The output is 2, 4, 6, arriving at exactly the same time the source emitted, because map has no concept of rescheduling. If you timed these emissions, you'd see all three arrive within microseconds of each other, just as of() produced them.

The second pipeline introduces delay. of(42) emits the number forty-two immediately, producing one {T, a} pair. delay(500) intercepts that pair and reschedules it — it takes the a value forty-two and attaches it to a new T that is five hundred milliseconds later. The subscriber receives the value 42, but receives it half a second after the source emitted it. The a is identical. Only the T changed. That's the defining characteristic of a T-only operator: value fidelity, timing manipulation.

The third pipeline is where both dimensions come into play. interval(100) emits an incrementing integer every hundred milliseconds. In three hundred milliseconds it would naturally emit values 0, 1, and 2 — three {T, a} pairs. auditTime(300) interrupts that. Every three hundred milliseconds, it asks: what's the latest a value I've seen? It takes that value and emits it, discarding everything else that arrived in the window. So instead of seeing 0, 1, 2 in the first three hundred milliseconds, you see just 2 — the last value in that window. In the next window, interval has emitted 3, 4, and 5, so auditTime emits 5. Then 8. Then take(3) closes the subscription after three emissions.

Here's the annotation worth burning in. map never looks at the clock — it's purely a function over a. delay never looks at the value — it's purely a shift on T. auditTime uses the clock to decide which value gets through — it reads T to select from a. Three operators, three families, three completely different relationships to the two-dimensional model.

Label your operators this way as you build pipelines. When you write map(), mentally tag it as a-only. When you write delay(), tag it as T-only. When you write debounceTime() or auditTime(), tag it as {T, a}. That habit makes the behavior of complex pipelines predictable rather than mysterious.
