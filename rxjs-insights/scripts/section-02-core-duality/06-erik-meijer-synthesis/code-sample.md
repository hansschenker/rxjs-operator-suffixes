# Erik Meijer's Synthesis — Code Sample

**Section:** The Core Duality
**Insight:** Erik Meijer's synthesis
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

The cleanest way to see Meijer's synthesis in code is through the Subject, because Subject is the object that is simultaneously Observable and Observer. Let me show you that.

```typescript
import { Subject } from 'rxjs';

// Subject implements BOTH Observer and Observable
const subject$ = new Subject<number>();

// As Observable — subscribe to it
subject$.subscribe({
  next:     v => console.log('Value:', v),
  error:    e => console.error('Error:', e),
  complete: () => console.log('Done')
});

// As Observer — push into it (Iterator-style control)
subject$.next(1);
subject$.next(2);
subject$.error(new Error('something went wrong'));
// After error, complete is not called — mirrors Iterator throw()
```

Let's read the subscribe call first. We're passing an observer object — a plain object with three methods: next, error, and complete. This is the extended Observer interface that Meijer defined. All three channels are wired up explicitly. If you were using the original Gang of Four Observer pattern, you'd only have the next callback. The error and complete methods are Meijer's additions.

Now look at the calls below. subject$.next(1) — this is us acting as the producer, calling next on the Subject in its role as an Observer. The Subject receives that value and forwards it to every subscriber. subject$.next(2) does the same. Then subject$.error(new Error('something went wrong')) fires the error channel. The subscriber's error callback runs and logs the error to the console.

Notice what doesn't happen after the error call: complete is never called. This mirrors the Iterator contract exactly. If you call throw() on an iterator — or if next() throws an exception — the iterator is considered exhausted. You don't then receive a done signal separately; the thrown exception IS the terminal event. Same here: error and complete are mutually exclusive terminal states. A stream can end cleanly with complete, or it can end with an error — never both.

That last comment in the code isn't just documentation. It's the synthesis made explicit: the three calls you can make on a Subject in its Observer role — next, error, complete — map directly onto the three outcomes of an Iterator: yielding a value, throwing an exception, and reaching the end. Same three channels. One is pull-based, one is push-based. Meijer's genius was seeing they were the same thing and building the bridge between them.

---