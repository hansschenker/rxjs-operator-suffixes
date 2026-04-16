# Module 01 — Entering RxJS: Creation Operators

The app demonstrates Layer 1 of the 3-Step Workflow — creation operators as the entry point.

`fromEvent` is used to enter RxJS from the DOM. A raw browser `Event` object flows into the
pipeline the moment the user types in the search input.

The `map` operator immediately transforms that raw `Event` into a plain `string` value, keeping
the rest of the pipeline unaware of the DOM. This is the first pure transformation step.

**Focus of this module:** `fromEvent` and creation operators are how you *enter* RxJS. Without a
creation operator, there is no Observable — nothing to subscribe to, no data flowing.

**Not yet explained in this module:**
- Time-based operators (`debounceTime`, `distinctUntilChanged`) — Module 05
- Sharing / multicasting (`shareReplay`) — Module 06
- Flattening / inner Observables (`switchMap`) — Module 07
- Error handling (`catchError`) — Module 09

The pipeline so far: `fromEvent` → `map(event => string)`. Simple, synchronous, pure.
