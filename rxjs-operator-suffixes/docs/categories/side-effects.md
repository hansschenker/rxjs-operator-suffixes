---
title: "Side Effects"
---

> Not sure which operator to use? [Decision tree →](../decisions/side-effects)

Operators that let you **observe or react** to stream events without modifying the values passing through. Transparent to the data flow but essential for debugging, logging, and cleanup.

## tap

**Base:** Perform a **side effect** on each notification — next, error, or complete — without altering the stream in any way. The correct place for `console.log`, analytics calls, or external state mutations triggered by stream events.

### [tap](../operators/tap)(observerOrNext, error?, complete?)
Accepts either a partial observer object or up to three callbacks. Errors thrown inside `tap` propagate downstream as stream errors. Since `tap` sees every value, place a `filter` upstream if the side effect should be conditional.

---

## finalize

**Base:** Execute a **cleanup callback** when the subscription ends — whether by completion, error, or explicit `unsubscribe()`. The RxJS equivalent of a `try/finally` block.

### [finalize](../operators/finalize)(callback)
No variants. The callback always runs on any termination path, including manual unsubscription. Canonical use: hide a loading spinner, release a resource, or cancel an external timer regardless of how the stream terminates.

---
