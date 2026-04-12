# Operators That Work on Time, Value, or Both

**Section:** The Data Model
**Insight:** Operator families: T / a / both
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Now that we've defined an Observable as a sequence of {T, a} pairs, we can do something immediately useful with that definition — we can classify every RxJS operator by which dimension it touches.

The first family operates only on a, the value. map, filter, reduce, scan — these operators transform what you're getting, but they don't care about when it arrives. You pass in a value at time T, and you get a transformed value out at the same time T. The clock is irrelevant to them.

The second family operates only on T, the timing. delay is the clearest example. delay(500) takes every {T, a} pair and shifts T forward by five hundred milliseconds. The value a is completely untouched — it passes through exactly as it arrived. throttleTime works similarly. It doesn't alter what you receive, only when.

The third family operates on both dimensions together, and this is where things get interesting. debounceTime looks at the gap between consecutive T values. If items are arriving faster than a given threshold, it suppresses everything until there's a quiet period — so it's making decisions about a based on T. auditTime samples the stream at regular T intervals and emits whatever the latest a was at that moment. sampleTime does the same kind of thing. These operators can't be understood without thinking about both axes simultaneously.

Knowing which family an operator belongs to tells you exactly what it can and cannot change. If you're debugging an unexpected value in a pipeline, you start by checking the a-operators. If you're debugging unexpected timing, you start with the T-operators. And if both the values and the timing look wrong, you look at the combined-axis operators. That taxonomy turns debugging from guesswork into a structured search.
