# Schedulers Control Time and Concurrency

**Section:** Composition & Concurrency
**Insight:** Schedulers
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Everything in RxJS ultimately comes down to: when does this work actually run? You can compose the most elegant pipeline in the world, but if you don't control the execution context, you're at the mercy of JavaScript's event loop. Schedulers are the answer to that problem.

A Scheduler is a central dispatcher. Every time RxJS needs to schedule a piece of work — emit a value, delay a notification, tick an interval — it goes through a Scheduler. The Scheduler decides two things: when that work runs, and on what execution context. Without this mechanism, you'd have no way to tell RxJS whether to run something synchronously in the current call stack, on the microtask queue after the current task finishes, via a setTimeout on the macrotask queue, or synchronized to the browser's render cycle with requestAnimationFrame.

Four built-in Schedulers cover the common cases. The queueScheduler is synchronous but uses a trampoline to prevent stack overflows on recursive work. The asapScheduler schedules via the microtask queue — it runs before the next macrotask, similar to how Promise callbacks behave. The asyncScheduler is the default for time-based operators; it uses setTimeout and setInterval. And the animationFrameScheduler ties work to requestAnimationFrame, keeping DOM updates in sync with the browser's rendering.

But there's one more Scheduler that may matter most in practice: the TestScheduler. The TestScheduler replaces real clock time with a simulated virtual clock. Instead of waiting 500 real milliseconds to test a debounce operator, you write a marble string and let the TestScheduler fast-forward through virtual time. This is what makes time-based RxJS code genuinely testable — not by mocking setTimeout manually, but by giving the entire execution model a controllable clock. Understanding Schedulers means understanding when your code runs, why it runs in that order, and how to change it.
