# Module 02 — Cold vs Hot: Unicast and Multicast Observables

`query$` is a **cold Observable** — every call to `.subscribe()` creates a new, independent
event listener on the input element. Two subscribers would attach two listeners. Cold means
the producer is created *per subscription*.

`state$` in `state.ts` uses `shareReplay({ bufferSize: 1, refCount: true })` — this converts
the cold `scan` pipeline into a **hot, shared stream**. New subscribers receive the last emitted
state immediately (the `bufferSize: 1` replay) without re-running the reducer from scratch.

The `mockSearch` function in `search-on-query.ts` illustrates the **five-phase Observable
lifecycle** in real code:

1. **Setup** — `new Observable(subscriber => { ... })` defines the blueprint
2. **Running** — `setTimeout` fires and calls `subscriber.next(results)`
3. **Complete** — `subscriber.complete()` closes the inner stream
4. **Teardown** — `return () => clearTimeout(timer)` runs when the subscriber unsubscribes
5. **Unsubscribed** — `switchMap` triggers teardown when a new query arrives

The `clearTimeout` teardown is not boilerplate — it is the cancellation mechanism that prevents
stale results from arriving after the query has already changed.
