# Operators That Work on Time, Value, or Both — Deep Dive

**Section:** The Data Model
**Insight:** Operator families: T / a / both
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

The three-family taxonomy — operators that act on a, operators that act on T, operators that act on both — is more than a conceptual convenience. It has direct consequences for how you write tests, how you debug pipelines, and how you reason about the correctness of an operator composition.

Let's go through each family in detail.

The value operators — the a-family — are essentially pure functions lifted into Observable context. map is the archetype: it takes a function from T to R and applies it to every incoming value. filter takes a predicate and passes only values that satisfy it. scan is a left fold that accumulates state. reduce is scan with a completion trigger. None of these operators have any concept of time. They don't look at when a value arrived. They don't delay, buffer, or reschedule. This means you can test them synchronously, without a TestScheduler. Just push values in with of() or from() and check the output. Timing is genuinely irrelevant to their correctness, so there's no reason to introduce virtual time into the test.

The time operators — the T-family — are the mirror image. They don't transform values at all. They reschedule them. delay(500) takes every emission and pushes it forward on the timeline by five hundred milliseconds. The value that comes out the other end is byte-for-byte identical to the value that went in. What changed is when it comes out. throttleTime(200) enforces a minimum gap between emissions. After one emission gets through, it silences the source for two hundred milliseconds. Again, the value that gets through is unchanged — the operator is purely a gatekeeper in the time dimension. Testing these operators meaningfully requires TestScheduler, because you need to advance virtual time to observe their effects. A synchronous test wouldn't trigger their behavior at all.

The combined operators — the {T, a}-family — are where the real power of the two-dimensional model shows up. debounceTime(300) maintains an internal timer that resets on every incoming emission. If three hundred milliseconds pass without a new emission, it lets the most recent value through. So it's making a decision about which a to emit (the latest one seen), and that decision is entirely driven by T (the three-hundred-millisecond gap). You can't understand debounceTime by thinking about values alone or time alone — you need to hold both axes in your head simultaneously.

auditTime(300) works differently. It sets a fixed repeating timer. At the end of each timer window, it samples whatever the current a value is and emits it. Items that arrived earlier in the window are silently discarded. Only the latest a at the T boundary survives. sampleTime does almost the same thing with slightly different trigger semantics. windowTime(300) doesn't emit individual values at all — it groups all the {T, a} pairs that fall within a three-hundred-millisecond window into an inner Observable and emits that Observable as the a value. So it's changing both dimensions: it's restructuring the T axis into windows and wrapping the a values in a container.

The testing implication is worth stating explicitly. For a-family operators, use synchronous marble tests with of() and expect(). For T-family operators, use TestScheduler with virtual time. For combined operators, use TestScheduler because you need to express both the values and the timing in your test scenario. A marble string like '--a--b--|' encodes both dimensions: the dashes are T, the letters are a. That's precisely why marble syntax exists — because the {T, a} model demands a notation that can express both.

When you're composing a pipeline and something doesn't behave as expected, run through the three families mentally. Which operators in this chain touch a? Which touch T? Which touch both? Narrow down the suspects by dimension, and the debugging problem becomes much smaller.
