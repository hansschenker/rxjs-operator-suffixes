# Erik Meijer's Synthesis — Deep Dive

**Section:** The Core Duality
**Insight:** Erik Meijer's synthesis
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

To understand what Meijer synthesised, you need to understand what he was working with — two well-established but separately developed patterns, each with its own blind spots.

The Gang of Four Observer pattern, as defined in 1994, is essentially a notification mechanism. You have a Subject — an object that maintains a list of observers — and when something interesting happens, the Subject calls update on each observer, passing the new value. That's it. One channel: next. There's no way for the Subject to tell observers "I'm done, nothing more is coming." There's no way to propagate an error back to observers. If the Subject encounters an exceptional state, the pattern gives you no mechanism to communicate that cleanly. The subject just stops calling update, and observers are left hanging forever, never knowing whether to wait for more values or clean up their state.

The Iterator pattern, by contrast, has always been more expressive. Whether you look at C++'s iterators, Java's Iterator interface, or JavaScript's Symbol.iterator protocol, the design accommodates three distinct outcomes. You call next() and get a value and a done flag — two signals in one. When done becomes true, you know the sequence is finished. If the underlying data source throws, the exception propagates out of next() to the caller. Some iterator designs even have a return() method for early termination and a throw() method for injecting errors. Three channels, not one.

Meijer's insight was that if Observer is supposed to be the dual of Iterator, the asymmetry was a defect. A proper dual needs to match channel for channel. So he extended the Observer interface with two additional methods to achieve parity. The complete() method is the push-based counterpart of done becoming true — the producer signals that the stream has ended and no more values will follow. The error(err) method is the push-based counterpart of an exception propagating out of next() — the producer signals that something went wrong and the stream can no longer continue. Once you add those two methods, the Observer is a complete dual of the Iterator.

The Observable itself is then just the object that knows how to wire up a producer to an observer — a factory for subscriptions. When you call subscribe(observer), you're telling the Observable "I'm ready to receive." The Observable runs its producer logic, and that logic holds a reference to your observer and calls its methods whenever it has something to say.

Now consider the Subject, which is the most visible manifestation of the synthesis. A Subject in RxJS is simultaneously an Observable and an Observer. As an Observable, you can subscribe to it — it manages a list of active subscribers just like the original Gang of Four Subject. As an Observer, you can call next, error, and complete directly on it — it accepts pushed values and forwards them to all subscribers. It's the object that inhabits both sides of the duality at once. Meijer's synthesis made that possible because both sides now speak the same three-channel language.

The significance of the complete channel deserves a moment of attention. A stream that can end cleanly unlocks an entire category of operators that simply can't exist on infinite streams. toArray() collects everything and emits once — only possible if you know when the sequence is over. reduce() accumulates and emits the final result — same requirement. take(n) can count to n and then close the subscription automatically, triggering teardown. Without complete, none of these could be implemented reliably. The synthesis isn't just theoretically elegant — it directly enables the practical operator vocabulary that makes RxJS so expressive.

---