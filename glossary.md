# RxJS Course Glossary

Canonical term definitions for the RxJS course quality checker.
Each `## heading` is a term key (lowercase). Only the first paragraph is used for comparison.

---

## cold observable
An Observable whose producer function is invoked fresh for each new subscriber — nothing executes until `subscribe()` is called, and each subscriber gets its own independent execution.

## hot observable
An Observable whose producer exists independently of any subscriber — values are emitted regardless of whether anyone is subscribed, and late subscribers miss earlier emissions. DOM event streams and Subjects are hot.

## subscription
The object returned by `observable.subscribe()` that represents an active execution of the observable. Calling `unsubscribe()` on it cancels the execution and releases resources.

## operator
A pure function of the form `(source: Observable<T>) => Observable<R>` that transforms, filters, or combines observables without modifying the source. Operators are composed inside `pipe()`.

## flattening
The process by which a higher-order observable — one that emits inner observables — subscribes to those inner observables and merges their emissions into a single output stream. The four flattening strategies differ in how they manage concurrent inner subscriptions.

## subject
A special type of observable that is also an observer, allowing values to be pushed into it imperatively via `next()`. Subjects are hot and multicast — they share a single execution among all subscribers.

## scheduler
An object that controls when and on which execution context (microtask, macrotask, animation frame) observable notifications are delivered. Used via `observeOn()` and `subscribeOn()` to change timing without altering stream logic.

## marble diagram
A textual or graphical notation for depicting the timing of observable emissions over a virtual timeline. Hyphens represent time passing, letters represent emitted values, `|` represents completion, and `#` represents an error.

## backpressure
The condition where a producer emits values faster than a consumer can process them. RxJS handles backpressure through operators that drop (`throttleTime`, `debounceTime`), queue (`concatMap`), or cancel and restart (`switchMap`) inner work.

## multicasting
The act of sharing a single observable execution among multiple subscribers, so the producer runs only once regardless of subscriber count. Achieved via `Subject`, `shareReplay`, `share`, or `publish` + `connect`.
