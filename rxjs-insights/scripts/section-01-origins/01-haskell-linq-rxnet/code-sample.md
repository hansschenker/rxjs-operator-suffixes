# From Haskell to RxJS — Code Sample

**Section:** Origins
**Insight:** Haskell → LINQ → Rx.NET → RxJS
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let's make the lineage concrete with code. I want to show you the same logical query expressed first in C# LINQ pseudocode, and then in RxJS — so you can see with your own eyes that these aren't just vaguely similar ideas. They're the same idea, wearing different clothes.

```typescript
import { from } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// LINQ (C# pseudocode):
// from x in numbers where x > 2 select x * 2

// The same query in RxJS
const numbers$ = from([1, 2, 3, 4, 5]);

numbers$.pipe(
  filter(x => x > 2),
  map(x => x * 2)
).subscribe(console.log);
// Output: 6, 8, 10
```

The C# comment at the top is actual LINQ query syntax. It reads almost like English: "from the numbers collection, where a number is greater than two, select that number multiplied by two." The C# compiler translates this into calls to `Where` and `Select` — which are LINQ's names for filter and map.

Now look at the RxJS code directly underneath. The `from` function on line six creates an Observable from the array `[1, 2, 3, 4, 5]`. That Observable is cold — nothing happens until we subscribe at the bottom. Notice the dollar sign suffix on `numbers$`. That's a naming convention in RxJS to signal that a variable holds an Observable, and it's one we'll use consistently throughout this course.

The `pipe` call is where the query lives. Inside it, `filter(x => x > 2)` is LINQ's `Where`. It accepts each value and only passes it downstream if the predicate returns true. So values 1 and 2 are dropped, and 3, 4, and 5 continue.

Then `map(x => x * 2)` is LINQ's `Select`. It transforms each value that made it through the filter — 3 becomes 6, 4 becomes 8, 5 becomes 10. That's exactly the output you see in the comment: 6, 8, 10.

What I want you to notice is that the shape of the query is identical to the C# LINQ version. The only structural difference is that LINQ used keyword syntax built into the compiler, while RxJS uses a `pipe` chain with functions. That `pipe` pattern is actually more flexible, because it means every operator is just a function you can compose in any order, test in isolation, and import only when needed.

Now here's the deeper point. The source array could be replaced with `fromEvent(document, 'click')` — a stream of mouse clicks — and the `filter` and `map` wouldn't change at all. They don't care where the values come from. They just transform whatever arrives. That source-independence is the unified model that LINQ pioneered and RxJS inherited. The query logic is completely decoupled from the data source. You write it once, and it works against any Observable — whether that Observable wraps a static array, a live WebSocket, an HTTP call, or a timer firing every second.

That's the legacy of thirty years of functional sequence theory, running in your browser right now.
