# UI Events as First-Class Citizens

**Section:** Origins
**Insight:** Rx.NET made UI events first-class
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Before reactive programming, handling UI events meant one thing: callbacks. You'd register a function to be called when an event fired, and if you needed to coordinate two events together — say, knowing whether the mouse button was down when a move event arrived — you'd reach for a shared variable. A flag. A piece of mutable state that you'd set in one callback and read in another. It worked, but it was brittle. The logic was scattered across multiple handlers, the state was implicit, and testing any of it meant simulating browser events in the right order.

Rx.NET changed the mental model. Instead of registering a callback that fires and disappears, `Observable.FromEvent` wraps the event source into a sequence — a persistent, composable stream of values. A button click isn't a one-off notification. It's the next item in an Observable sequence of clicks that you can filter, transform, delay, or combine with any other Observable.

This is what it means for events to be first-class citizens. First-class means they're values you can pass around, store in variables, and compose with other values. Callbacks aren't first-class — they're instructions you register with a specific source. Observables are first-class — they're values that represent an ongoing sequence, and you can hand them to any operator that works with Observable.

RxJS brings this directly to the browser. When you call `fromEvent(document, 'click')`, you get back an Observable. You can debounce it, filter it, merge it with a timer, combine it with a form field's value stream. You're not coordinating callbacks — you're composing values. A click event becomes as easy to work with as a number or a string, because it's just another Observable. And everything that works with Observable, works with your click stream. That's what first-class means, and it's one of Rx.NET's most lasting contributions.
