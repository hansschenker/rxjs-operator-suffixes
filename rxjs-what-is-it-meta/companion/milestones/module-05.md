# Module 05 — Time Operators: debounceTime and the Two-Question Framework

`debounceTime(300)` in `app.ts` is a **Layer 2 (time) operator**. It waits for 300 ms of
silence after the last keystroke before emitting the query string downstream.

This is the **lossy** choice: every intermediate keystroke is discarded. Only the value present
after the silence window fires.

**The two-question framework for choosing a time operator:**

1. *Can we afford to lose intermediate values?*
   Yes — we only care about the final query, not every character typed.

2. *Do we want leading-edge or trailing-edge behaviour?*
   Trailing — we want to fire *after* the user stops typing, not the moment they start.

→ Answer: `debounceTime`. If we wanted leading-edge (fire immediately on first keystroke, then
suppress), we would use `throttleTime` with `{ leading: true, trailing: false }`.

**`distinctUntilChanged()` is NOT a Layer 2 operator.** It has no timer, no scheduler. It
filters by value equality — if the user types "rx", clears it, and types "rx" again, the debounce
emits "rx" twice but `distinctUntilChanged` suppresses the second. This is T-only filtering,
not time-based rate limiting.

The two operators serve different purposes and compose cleanly because they are independent concerns.
