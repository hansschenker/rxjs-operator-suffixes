# Erik Meijer's Synthesis

**Section:** The Core Duality
**Insight:** Erik Meijer's synthesis
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Erik Meijer didn't invent the Observer pattern. The Gang of Four described it in 1994. He didn't invent the Iterator pattern either — it predates object-oriented programming. What Meijer did was recognise that these two patterns, both widely used and independently well-understood, were mathematical duals of each other. And then he did something with that recognition.

If Iterable and Observable are duals, and if the Observer already handles values being pushed to it, then the Observer as defined by the Gang of Four was incomplete. The original Observer had only one channel: update, which delivered a value. But the Iterator had three channels: next returns a value, done signals completion, and throw propagates an error. For the duality to hold perfectly, the Observer needed to match. So Meijer added two more methods: complete, to signal that the stream has ended, and error, to propagate a failure. Now the Observer had exactly the same expressive power as the Iterator, just with arrows reversed.

The Observable is the structure that brings it all together. It wraps a producer function that knows how to call next, error, and complete on whoever subscribes. And the subscription itself — the act of subscribing — is the handshake that connects producer to consumer without either of them holding a permanent reference to the other.

The result is a single abstraction that handles values arriving over time, streams that finish cleanly, and streams that fail — all without callbacks nesting into each other. That's the synthesis. Two familiar patterns, seen to be duals, merged into something more powerful than either was alone.

---