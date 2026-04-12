# The Three Kinds of Observable — Code Sample

**Section:** The Data Model
**Insight:** Three Observable variants
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Let's make the three Observable variants tangible with a single TypeScript file that demonstrates each one and makes their behavioral differences impossible to miss.

```typescript
import { Observable, Subject, interval } from 'rxjs';
import { share, take } from 'rxjs/operators';

// 1. Cold Observable — independent per subscriber
const cold$ = new Observable<number>(obs => {
  obs.next(Math.random());
  obs.complete();
});
cold$.subscribe(v => console.log('Cold A:', v)); // e.g. 0.42
cold$.subscribe(v => console.log('Cold B:', v)); // e.g. 0.87 — different!

// 2. Subject — hot, multicasting, imperative push
const subject$ = new Subject<number>();
subject$.subscribe(v => console.log('Subject A:', v));
subject$.subscribe(v => console.log('Subject B:', v));
subject$.next(42); // both A and B receive 42

// 3. ConnectableObservable via share() — one source, multiple consumers
const shared$ = interval(1000).pipe(share(), take(3));
shared$.subscribe(v => console.log('Shared X:', v));
shared$.subscribe(v => console.log('Shared Y:', v));
// X and Y see the same emissions from one shared interval
```

Let's walk through each block.

Block one: the cold Observable. The subscribe function calls Math.random() and immediately completes. Notice the two subscribe calls are separate. Cold A and Cold B each trigger their own independent invocation of the subscribe function. Each gets its own Math.random() call. So the two log lines show different numbers — 0.42 and 0.87 in the comment, but you'll get different random values each run. This is isolation in action. The Observable is a factory, not a single shared value. If you wrapped an HTTP request here instead of Math.random(), you'd fire two separate HTTP requests. That's sometimes what you want. Often it isn't, which is why we have the other two variants.

Block two: the Subject. Two subscribers are set up before any next() call. Then subject$.next(42) pushes the value imperatively. Both Subject A and Subject B receive 42 from that single push. One call to next(), two receivers — that's multicasting. And it's immediate: there's no subscribe function running in the background. The Subject holds a list of active observers and fans the value out to all of them synchronously. If you called next() before setting up either subscriber, neither would receive the value — it would be lost, because nobody was listening when the emission happened. That's what hot means.

Block three: share(). interval(1000) is a cold Observable that would normally start an independent timer per subscriber. By piping through share(), we transform it into a ConnectableObservable that starts one shared timer when the first subscriber connects. Both shared$.subscribe() calls in the example connect to that one timer. Shared X and Shared Y receive the same values at the same moments — 0 after one second, 1 after two seconds, 2 after three seconds — and then take(3) completes the sequence and share() tears down the underlying interval. One timer. Two subscribers. No duplicate work.

The contrast between block one and block three is the heart of the lesson. Same general pattern — subscribe twice to an Observable. But cold$ fires the factory twice. shared$ fires the factory once and multicasts. The difference is share(), and the reason it matters is cost: if interval(1000) were an HTTP request or a WebSocket connection, you'd care very much about not starting it twice.

Three patterns, three behaviors. Cold gives you isolation. Subject gives you imperative control and multicast. share() gives you multicast while preserving the cold Observable model for the underlying source. Know which one you're using, always.
