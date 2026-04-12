# What an Observable Actually Is — Code Sample

**Section:** The Data Model
**Insight:** Observable formal definition [{T,a}…]
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let's make the {T, a} model concrete with a short TypeScript snippet. The goal here is to take the formal definition off the whiteboard and show it running in a terminal output you can actually read.

```typescript
import { interval } from 'rxjs';
import { timestamp, take } from 'rxjs/operators';

// timestamp() makes the {T, a} pair explicit
interval(1000).pipe(
  timestamp(),
  take(3)
).subscribe(({ timestamp: t, value }) => {
  console.log(`T=${t}ms  V=${value}`);
});

// Output (approximate):
// T=1704067201000ms  V=0
// T=1704067202001ms  V=1
// T=1704067203002ms  V=2
```

Let's walk through this line by line. interval(1000) creates a cold Observable that emits an incrementing integer every thousand milliseconds. By default, all you see when you subscribe is the value — the a dimension. You never see T directly.

That's where timestamp() comes in. timestamp() is a value operator that wraps each incoming value in an object containing two fields: value, which is the original a, and timestamp, which is the number of milliseconds since the Unix epoch at the moment the emission occurred. In other words, timestamp() makes the implicit T dimension explicit. It lifts the hidden {T, a} pair to the surface so you can inspect both coordinates.

Then take(3) adds a completion boundary. Without it, interval() would run forever, because a potentially infinite Observable has no built-in end. take(3) says: emit the first three {T, a} pairs, then call complete() and unsubscribe.

Look at the output. T=1704067201000ms is the Unix timestamp in milliseconds when the first emission landed. V=0 is the a value at that moment. The second line shows T has advanced by roughly a thousand milliseconds, and V has advanced by one. The third line is the same story. You're looking at two independent axes of information printed side by side.

Here's the key observation. The gap between consecutive T values is the spacing on the time axis — approximately one thousand milliseconds because that's what interval(1000) produces. The incrementing V values are the a axis — a simple counter that goes up by one each tick. Neither axis depends on the other. interval() could emit the string "ping" instead of a number and the T values would look identical. And if you switched to interval(500), the V values would still be 0, 1, 2 — but the T gaps would be half as large. The two dimensions vary independently.

One more thing worth noting: the output says "approximate" for a reason. The T values aren't exactly 1000 milliseconds apart. They're 1001 milliseconds apart in the sample output. That small drift is real — JavaScript timers aren't perfectly accurate. In production code running against real time, T values will always have some jitter. In TestScheduler marble tests, that jitter disappears because T is virtual and exact. That's one of the strongest practical arguments for using TestScheduler when testing anything that involves the T dimension.

This tiny snippet — interval, timestamp, take, subscribe — gives you a visible instance of the formal model. Every row in the console output is a {T, a} pair. The T column is time made visible. The V column is value made visible. Together they are exactly what an Observable is.
