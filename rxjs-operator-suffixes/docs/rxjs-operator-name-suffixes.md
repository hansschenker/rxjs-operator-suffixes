# RxJS Operator Name Suffixes

Operators are grouped by **category**, then by the shared **base name** (prefix). The base captures the core semantic — the suffix narrows *how* that semantic is triggered or configured.

---

# Higher-Order Operators (Flattening)

Each source value is projected into an inner Observable. The inner streams are then flattened back into a single output. The **base name** determines the inner subscription strategy — how many run concurrently and what happens when a new inner arrives while others are active.

## concat

**Base:** Queue inner Observables strictly **in order** — subscribe to the next only after the previous completes. Concurrency = 1, no cancellation, no drops. Preserves every value and the order of arrival.

### [concatAll](./operators/concatAll)()
Flattens a higher-order Observable by serialising inner Observables. Queues incomers during an active subscription.

### [concatMap](./operators/concatMap)()
Projects each source value to an inner Observable via a mapping function, then concatenates them. The most common form — identical to `mergeMap` with `concurrent = 1`.

### [concatMapTo](./operators/concatMapTo)()
Like `concatMap` but every source value maps to the **same static** inner Observable. Use when the projected stream does not depend on the emitted value.

### [concatWith](./operators/concatWith)(...others)
Appends one or more Observables after the source completes — sugar for `concat(source$, a$, b$)` inside a `pipe()`.

---

## exhaust

**Base:** Subscribe to the **first** inner Observable that arrives; **drop** all subsequent incomers while it is still active. First-wins, not last-wins. Zero concurrency, zero cancellation.

### [exhaustAll](./operators/exhaustAll)()
Flattens a higher-order Observable by ignoring any new inner Observable while the current one is active.

### [exhaustMap](./operators/exhaustMap)()
Projects source values to inner Observables via a mapping function. New projected Observables are silently discarded while an inner is running. Canonical use: form submit — prevents double-submission.

---

## merge

**Base:** Subscribe to **all** inner Observables concurrently with no ordering guarantee. Emissions are interleaved as they arrive. Lossy only by configuration (`concurrent` limit); by default all values pass through.

### [mergeAll](./operators/mergeAll)()
Flattens a higher-order Observable by subscribing to every inner Observable immediately as it arrives.

### [mergeMap](./operators/mergeMap)()
Projects each source value to an inner Observable and merges all concurrently. The default flattening operator when ordering does not matter.

### [mergeMapTo](./operators/mergeMapTo)()
Like `mergeMap` but every source value maps to the **same static** inner Observable.

### [mergeScan](./operators/mergeScan)(accumulator, seed)
Like `scan` but the accumulator returns an Observable; results are merged — useful for stateful async accumulation (e.g. accumulated HTTP results).

### [mergeWith](./operators/mergeWith)(...others)
Merges one or more Observables with the source, interleaving their emissions. Sugar for `merge(source$, a$, b$)` inside a `pipe()`.

---

## switch

**Base:** On each new inner Observable, **cancel the previous** inner and subscribe to the new one. Always tracks only the most recent — previous values in-flight are lost.

### [switchAll](./operators/switchAll)()
Flattens a higher-order Observable by switching: each new inner Observable cancels the previous one.

### [switchMap](./operators/switchMap)()
Projects source values to inner Observables; cancels the active inner whenever a new projection arrives. Canonical use: search typeahead — only the last query matters.

### [switchMapTo](./operators/switchMapTo)()
Like `switchMap` but every source value maps to the **same static** inner Observable.

### [switchScan](./operators/switchScan)(accumulator, seed)
Like `scan` but the accumulator returns an Observable that is flattened via `switchMap` semantics — the new inner replaces the previous one.

---

# Windowing & Buffering

Collect source emissions into **groups** instead of passing them one by one. `buffer` emits **arrays**, `window` emits **Observables**. The suffix controls the boundary condition that closes each group.

## buffer

**Base:** Accumulate source values into an array; emit the array when a boundary is triggered. Non-lossy — every value is kept until the flush.

### [bufferCount](./operators/bufferCount)(count, startBufferEvery?)
Flushes when the buffer has collected exactly `count` values. With `startBufferEvery`, a new overlapping buffer starts every N values.

### [bufferTime](./operators/bufferTime)(timeSpan, interval?, maxBufferSize?)
Flushes on a fixed time boundary. Emits an empty array if the source is silent during a window.

### [bufferToggle](./operators/bufferToggle)(openings$, closingSelector)
Opens a buffer when `openings$` emits; closes it when the Observable returned by `closingSelector` emits. Multiple overlapping buffers are possible simultaneously.

### [bufferWhen](./operators/bufferWhen)(closingSelector)
Opens one buffer immediately; closes and re-opens it each time the Observable returned by `closingSelector` emits.

---

## window

**Base:** Like `buffer` but emits an **Observable** (the window) for each group instead of a plain array. Downstream operators can process each window as a live stream before it completes.

### [windowCount](./operators/windowCount)(windowSize, startWindowEvery?)
Emits a new inner Observable every `windowSize` values.

### [windowTime](./operators/windowTime)(windowTimeSpan, windowCreationInterval?, maxWindowSize?)
Emits a new inner Observable on a fixed time boundary.

### [windowToggle](./operators/windowToggle)(openings$, closingSelector)
Opens a window when `openings$` emits; closes it when the returned Observable emits.

### [windowWhen](./operators/windowWhen)(closingSelector)
Closes and re-opens a window each time the closing Observable emits.

---

# Rate Limiting

Control the **pace** of emissions by selectively suppressing values within a time window. All four families are **lossy** — values that fall in the suppression window are silently dropped. The `Time` suffix replaces a trigger Observable with a plain millisecond duration.

## audit

**Base:** After a source value arrives, open a silence window and emit the **most recent** value at the end of that window. Ignores all intermediate values during the window.

### [auditTime](./operators/auditTime)(duration, scheduler?)
The silence window is a fixed millisecond duration. Equivalent to `audit(() => timer(duration))`.

---

## debounce

**Base:** Emit a value only after the source has been **silent** for the full window duration. Resets the timer on every new emission — only the last value in a rapid burst passes through.

### [debounceTime](./operators/debounceTime)(dueTime, scheduler?)
The silence window is a fixed millisecond duration. Standard operator for search-as-you-type — waits until the user stops typing before firing.

---

## sample

**Base:** Emit the **most recent** source value whenever a separate **notifier** Observable emits. If the source has not emitted since the last sample, nothing is emitted.

### [sampleTime](./operators/sampleTime)(period, scheduler?)
The notifier is a regular interval — samples the source every `period` milliseconds.

---

## throttle

**Base:** Emit the **first** value in a burst, then suppress all subsequent values for the duration. The inverse of `debounce` — the leading edge wins, the trailing burst is silenced.

### [throttleTime](./operators/throttleTime)(duration, scheduler?, config?)
The suppression window is a fixed millisecond duration. Default config `{ leading: true, trailing: false }` — set `trailing: true` to also emit the last value after the window expires.

---

# Filtering

Decide **which values pass** through the stream. Unlike rate limiting (drops by time), filtering drops by **position**, **count**, **content**, or **identity**.

## distinct

**Base:** Suppress **consecutive duplicate** values. Never drops the first occurrence — only drops when the incoming value matches the previous one (or a key derived from it).

### [distinctUntilChanged](./operators/distinctUntilChanged)(comparator?)
Compares consecutive values with `===` by default, or a custom `comparator` function. Emits only when the value has actually changed.

### [distinctUntilKeyChanged](./operators/distinctUntilKeyChanged)(key, comparator?)
Like `distinctUntilChanged` but extracts a named **property key** from each object and compares only that field. Avoids the reference-equality trap for objects.

---

## find

**Base:** Emit the **first value satisfying a predicate**, then complete. Does not require source completion.

### [findIndex](./operators/findIndex)(predicate)
Instead of emitting the matching value, emits its **zero-based index**. Emits `-1` if the source completes without a match (note: `find` emits `undefined` in that case).

---

## skip

**Base:** Suppress values **from the start** of the stream; let values through only after a condition has been met or a count exceeded.

### [skipLast](./operators/skipLast)(count)
Suppresses the last `count` values. Requires source completion; buffers the trailing N values internally.

### [skipUntil](./operators/skipUntil)(notifier$)
Suppresses all values until a separate notifier Observable emits, then passes everything through.

### [skipWhile](./operators/skipWhile)(predicate)
Suppresses values as long as the predicate returns `true`. Once it returns `false`, all subsequent values pass through — the predicate is no longer evaluated.

---

## take

**Base:** Let through a **limited number of values** from the start of the stream, then complete. The mirror image of `skip`.

### [takeLast](./operators/takeLast)(count)
Emits only the last `count` values. Requires source completion; buffers the trailing N values internally.

### [takeUntil](./operators/takeUntil)(notifier$)
Emits values until a separate notifier Observable emits, then completes. Standard subscription teardown pattern: `takeUntil(destroy$)`.

### [takeWhile](./operators/takeWhile)(predicate, inclusive?)
Emits values as long as the predicate returns `true`. When `false`, the operator completes. With `inclusive: true`, the value that failed the predicate is included in the output before completion.

---

## first

**Base:** Emit the **first** value (or first matching a predicate) and complete immediately — without waiting for the source to complete.

### [first](./operators/first)(predicate?, defaultValue?)
Emits the first value satisfying the predicate, then unsubscribes. Errors with `EmptyError` if the source completes without a match (unless `defaultValue` is provided).

### [firstValueFrom](./operators/firstValueFrom)(observable$)
A Promise-based utility — subscribes, resolves with the first emitted value, then unsubscribes. Rejects with `EmptyError` if the source completes without emitting.

---

## last

**Base:** Emit the **last** value (or last matching a predicate) — requires source completion.

### [last](./operators/last)(predicate?, defaultValue?)
Buffers values internally, emits the last one that satisfies the predicate once the source completes. Errors if no match is found and no `defaultValue` is provided.

### [lastValueFrom](./operators/lastValueFrom)(observable$)
A Promise-based utility — resolves with the last emitted value once the source completes. Rejects with `EmptyError` if the source completes without emitting.

---

## single

**Base:** Assert that exactly **one** value matches — emits it and completes. Errors if zero or more than one value satisfies the predicate. Stricter than `first`.

### [single](./operators/single)(predicate?)
No suffix variants. Without a predicate, errors if the source emits more than one value. With a predicate, errors if zero or more than one value matches.

---

## element

**Base:** Emit only the value at a specific **zero-based index** in the source sequence, then complete.

### [elementAt](./operators/elementAt)(index, defaultValue?)
Emits the value at position `index`. With `defaultValue`, emits that instead of erroring if the source completes before reaching `index`.

---

## default

**Base:** Provide a **fallback emission** when the source completes without emitting any value — the safe path.

### [defaultIfEmpty](./operators/defaultIfEmpty)(defaultValue)
If the source completes without emitting, emits `defaultValue`. If the source does emit at least once, passes through normally without touching `defaultValue`.

---

## throw

**Base:** **Error** when the source does not satisfy an expected condition — the fail-fast counterpart to `default`.

### [throwIfEmpty](./operators/throwIfEmpty)(errorFactory?)
Errors with `EmptyError` (or a custom error from `errorFactory`) if the source completes without emitting any value. Pair with `defaultIfEmpty` when you want to choose between safe default and hard failure.

---

# Combination

Join **multiple streams** into one. The suffix describes the join strategy: latest-value merge, sequential append, or positional pairing.

## combine

**Base:** Merge the **latest** value from each source stream whenever any one of them emits a new value. Requires all sources to have emitted at least once before the first combined emission.

### [combineLatest](./operators/combineLatest)(observables[])
Static creation form — takes an array (or dictionary) of Observables and emits an array (or dictionary) of their latest values on each emission.

### [combineLatestAll](./operators/combineLatestAll)()
Pipeable — collects all inner Observables from a higher-order Observable (waiting for the outer to complete), then applies `combineLatest` to them.

### [combineLatestWith](./operators/combineLatestWith)(...others)
Pipeable — combines the source with additional Observables. Sugar for using `combineLatest` inside a `pipe()`.

---

## start

**Base:** **Prepend** one or more values synchronously before the source begins emitting. The inserted values arrive before any async source emissions.

### [startWith](./operators/startWith)(...values)
Emits the provided values first, then passes through all source emissions.

---

## end

**Base:** **Append** one or more values after the source completes.

### [endWith](./operators/endWith)(...values)
Emits the provided values after the source completes, then completes itself.

---

## zip

**Base:** Combine values **positionally** — pairs the 1st from each source with the 1st from all others, the 2nd with the 2nd, and so on. Waits for all sources to have emitted at position N before emitting the N-th tuple. Slower sources dictate the pace.

### [zipAll](./operators/zipAll)()
Pipeable — collects all inner Observables from a higher-order Observable (waiting for the outer to complete), then zips them positionally.

### [zipWith](./operators/zipWith)(...others)
Pipeable — zips the source with additional Observables. Sugar for `zip(source$, a$, b$)` inside a `pipe()`.

---

## race

**Base:** Subscribe to all sources simultaneously; the **first to emit wins** — its emissions are forwarded and all other source subscriptions are cancelled immediately.

### [raceWith](./operators/raceWith)(...others)
Pipeable version of `race`. Races the source against additional Observables. Canonical use: timeout via `raceWith(timer(5000))` — whichever arrives first wins.

---

## fork

**Base:** Wait for **all** source Observables to **complete**, then emit one combined result of their last values. The RxJS analogue of `Promise.all` — collect all results before proceeding.

### [forkJoin](./operators/forkJoin)(sources[] | sourcesDict)
Takes an array or object of Observables; subscribes to all; waits for every source to complete; emits a single combined array or object. Errors immediately if any source errors. Never emits if any source is infinite.

---

## with

**Base:** **Sample** a secondary Observable at the moment the primary source emits — augment each primary value with the latest value from the secondary without subscribing to it on every tick.

### [withLatestFrom](./operators/withLatestFrom)(...others)
On each source emission, takes the most recent value from each `others` Observable and emits a combined tuple. Does not emit if any secondary has not yet produced a value. Canonical use: attach current state to each dispatched action in an MVU effect.

---

# Multicasting & Sharing

Cause a **single upstream subscription** to be shared among multiple downstream subscribers — preventing repeated cold-Observable side effects such as duplicate HTTP requests.

## publish

**Base:** Multicast the source via a `Subject`, giving explicit control over when to connect (`connect()` / `refCount()`). The suffix selects the **Subject variant** used internally. Deprecated in RxJS 7 — prefer `share()` / `connectable()`.

### [publishBehavior](./operators/publishBehavior)(initialValue)
Uses a `BehaviorSubject` — late subscribers immediately receive the **last emitted value**.

### [publishLast](./operators/publishLast)()
Uses an `AsyncSubject` — emits only the **final value** once the source completes.

### [publishReplay](./operators/publishReplay)(bufferSize?)
Uses a `ReplaySubject` — late subscribers receive the last `bufferSize` values replayed.

---

## share

**Base:** Multicast with automatic `refCount` — subscribes upstream when the first subscriber arrives and unsubscribes when the last one leaves.

### [shareReplay](./operators/shareReplay)(bufferSize | config)
Like `share` but also **replays** the last `bufferSize` values to new subscribers. The config form `{ bufferSize, refCount, windowTime }` controls whether the replay buffer persists after all subscribers unsubscribe — a common source of memory leaks when `refCount: false`.

---

# Error Handling & Recovery

## retry

**Base:** On an upstream error, **re-subscribe** to the source Observable from the start.

### [retryWhen](./operators/retryWhen)(notifier)
Deprecated in RxJS 7 — use `retry({ delay })` instead. Delegates the retry decision to a `notifier` Observable: re-subscribes when notifier emits, errors when notifier errors, completes when notifier completes.

---

## catch

**Base:** Intercept an upstream **error** and replace it with an alternative Observable — turning a failure into a recovery stream. The stream continues from the replacement; no error propagates downstream.

### [catchError](./operators/catchError)(selector)
Receives `(error, caught$)` — `caught$` is the original source, enabling retry-once by returning it. Returning `EMPTY` swallows silently; returning a fallback stream degrades gracefully; re-throwing reroutes the error downstream.

---

## repeat

**Base:** On source **completion** (not error), **re-subscribe** automatically — looping the stream. The completion-side counterpart to `retry`.

### [repeat](./operators/repeat)(count? | config)
Without arguments, loops forever. With a count, repeats that many additional times. The config form `{ count, delay }` adds a delay between repetitions (RxJS 7.4+).

### [repeatWhen](./operators/repeatWhen)(notifier)
Deprecated in RxJS 7 — use `repeat({ delay })` instead. Delegates the re-subscribe decision to a `notifier` Observable, allowing conditional or delayed repetition.

---

# Scheduling & Timing

Control *when* subscriptions are established (`subscribeOn`) or *when* notifications are delivered (`observeOn`), and operators whose primary axis is the **clock**.

## delay

**Base:** Shift all source notifications forward in time by a fixed duration.

### [delayWhen](./operators/delayWhen)(delayDurationSelector, subscriptionDelay?)
Per-value delay — each source value waits until the Observable returned by `delayDurationSelector(value)` emits before being forwarded. More flexible than a fixed offset.

---

## observe

**Base:** Move the **delivery** of notifications (next, error, complete) onto a different scheduler/context without changing the subscribe-side context.

### [observeOn](./operators/observeOn)(scheduler, delay?)
All downstream observer callbacks are scheduled via `scheduler`. Useful for moving work onto the async queue, animationFrame, or a custom scheduler.

---

## subscribe

**Base:** Move the **subscription call itself** onto a different scheduler/context. The inverse of `observeOn` — affects when upstream `subscribe()` fires, not when notifications are delivered.

### [subscribeOn](./operators/subscribeOn)(scheduler, delay?)
Defers the upstream `subscribe()` call until `scheduler` dispatches it. Rarely needed in application code — mostly useful for library authors and testing.

---

## time

**Base:** A shared root for operators whose primary concern is **clock time** — emission timing, creation on a schedule, and deadline enforcement.

### [timeInterval](./operators/timeInterval)()
Transforms each source value into `{ value, interval }` — `interval` is the elapsed milliseconds since the previous emission. Useful for profiling or measuring gaps between events.

### [timeout](./operators/timeout)(config | dueTime)
Errors with `TimeoutError` if the source does not emit within `dueTime` ms. The config form allows per-emission deadlines and switching to a fallback Observable instead of erroring.

### [timer](./operators/timer)(dueTime, interval?, scheduler?)
Creation operator — emits `0` after `dueTime` ms, then emits incrementing integers every `interval` ms. With no interval, acts like a delayed `of(0)`.

### [timestamp](./operators/timestamp)()
Transforms each source value into `{ value, timestamp }` — `timestamp` is the `Date.now()` value at the moment of emission.

---

# Transformation

Transform the **shape or value** of each emission without affecting which values are emitted or the number of subscriptions. One value in, one transformed value out (unless the operator also aggregates — see Aggregation).

## map

**Base:** Apply a **pure function** to every source value and emit the result. The most fundamental transformation — one-in, one-out, synchronous.

### [mapTo](./operators/mapTo)(value)
Deprecated in RxJS 7 — use `map(() => value)` instead. Replaces every source value with the same constant. Common pattern: mapping click events to action objects.

---

## scan

**Base:** Apply an **accumulator function** to each value, carrying forward a running state — like `Array.prototype.reduce` but emitting every intermediate accumulated value, not just the final one. The core of MVU reducer composition.

### [scan](./operators/scan)(accumulator, seed?)
No suffix variants on `scan` itself. The higher-order accumulator variants that also flatten inner Observables live in the flattening families: `mergeScan` and `switchScan`.

---

## expand

**Base:** Apply a projection **recursively** — the output of each projection is fed back into the projection, creating a depth-first expansion tree. Think `mergeMap` that also maps its own results.

### [expand](./operators/expand)(project, concurrent?, scheduler?)
Projects each source value (and each projected emission) into an inner Observable, merging them all. Useful for paginated API traversal, tree/graph walks, or generating recursive sequences.

---

## pairwise

**Base:** Buffer **two consecutive** values and emit them as a `[previous, current]` tuple on each emission. The first source value is held until the second arrives — no emission on the first value.

### [pairwise](./operators/pairwise)()
No configuration. Equivalent to `bufferCount(2, 1)` but typed as `[T, T]`. Classic use: compute deltas between consecutive mouse positions, scroll offsets, or state snapshots.

---

## group

**Base:** **Split** one source stream into multiple sub-streams keyed by a selector function — one `GroupedObservable` per distinct key.

### [groupBy](./operators/groupBy)(keySelector, element?, duration?, connector?)
Emits a `GroupedObservable<K, T>` for each new key seen. Each group is itself a stream of values sharing that key. Inner groups complete when the source completes or when the `duration` Observable for that key emits. Classic use: partition a WebSocket event stream by event type.

---

# Creation

Operators that **produce** an Observable from scratch — no upstream source Observable required. The base name describes the origin or shape of the values.

## from

**Base:** Adapt an **existing async or iterable structure** into an Observable. The universal adapter for things that are not Observables yet — Promises, arrays, iterables, async iterables.

### [fromEvent](./operators/fromEvent)(target, eventName, options?)
Wraps a DOM or Node.js event listener. Subscribing adds the listener; unsubscribing removes it. Cold per-subscriber — each subscription gets its own listener.

### [fromEventPattern](./operators/fromEventPattern)(addHandler, removeHandler, resultSelector?)
Like `fromEvent` but works with arbitrary add/remove handler APIs — custom event emitters, WebSocket handlers, legacy libraries with non-standard listener interfaces.

### [fromFetch](./operators/fromFetch)(input, init?)
Wraps the Fetch API — each subscription fires one `fetch()` call. Supports `AbortController` cancellation on unsubscribe, preventing in-flight requests from resolving after navigation.

---

## of

**Base:** Emit a **fixed list of values** synchronously, then complete. The simplest creation operator — no timing, no async, just emit and finish.

### [of](./operators/of)(...values)
No suffix variants. `of(1, 2, 3)` emits `1`, `2`, `3` synchronously. Commonly used in effects to return a synchronous action: `of(loadSuccess(data))`.

---

## range

**Base:** Emit a **consecutive sequence of integers** synchronously, then complete. A typed replacement for a `for` loop.

### [range](./operators/range)(start, count?, scheduler?)
Emits integers from `start` up to `start + count - 1`. With a scheduler, each emission is dispatched separately — useful for spreading a batch of synthetic values across microtasks.

---

## interval

**Base:** Emit an **incrementing integer** on a repeating time interval, indefinitely. Never completes on its own.

### [interval](./operators/interval)(period, scheduler?)
Emits `0, 1, 2, …` every `period` ms. Requires `take`, `takeUntil`, or another termination operator. Prefer `timer(0, period)` when the first emission should be immediate.

---

## defer

**Base:** Delay Observable **creation** until subscription time — the factory function is called fresh for each subscriber, ensuring cold behaviour even when the Observable captures mutable state.

### [defer](./operators/defer)(observableFactory)
No variants. The factory `() => Observable<T>` is called on every `subscribe()`. Essential when the Observable wraps a Promise created on demand (`defer(() => from(fetch(...)))`), ensuring the request is not fired at construction time.

---

## generate

**Base:** Create an Observable from a **synchronous iteration** — the RxJS equivalent of a `for` loop, emitting the result of each iteration.

### [generate](./operators/generate)(initialState, condition, iterate, resultSelector?, scheduler?)
Starts with `initialState`; emits `resultSelector(state)` while `condition(state)` is true; advances with `iterate(state)`. Rarely needed in application code — useful for producing numeric or geometric sequences without side effects.

---

# Side Effects

Operators that let you **observe or react** to stream events without modifying the values passing through. Transparent to the data flow but essential for debugging, logging, and cleanup.

## tap

**Base:** Perform a **side effect** on each notification — next, error, or complete — without altering the stream in any way. The correct place for `console.log`, analytics calls, or external state mutations triggered by stream events.

### [tap](./operators/tap)(observerOrNext, error?, complete?)
Accepts either a partial observer object or up to three callbacks. Errors thrown inside `tap` propagate downstream as stream errors. Since `tap` sees every value, place a `filter` upstream if the side effect should be conditional.

---

## finalize

**Base:** Execute a **cleanup callback** when the subscription ends — whether by completion, error, or explicit `unsubscribe()`. The RxJS equivalent of a `try/finally` block.

### [finalize](./operators/finalize)(callback)
No variants. The callback always runs on any termination path, including manual unsubscription. Canonical use: hide a loading spinner, release a resource, or cancel an external timer regardless of how the stream terminates.

---

# Notification Objects

Operators that **reify** stream notifications into plain value objects (`Notification<T>`), or **unreify** them back into live notifications. Used for higher-order error handling, stream introspection, and testing.

## materialize

**Base:** Convert each **next**, **error**, and **complete** notification into a `Notification<T>` value object emitted on the `next` channel. After materializing, the stream never errors or completes conventionally — all lifecycle events become data.

### [materialize](./operators/materialize)()
No variants. `next(v)` → `Notification.createNext(v)`, `error(e)` → `Notification.createError(e)`, `complete()` → `Notification.createComplete()`. The resulting stream completes normally after the materialized complete notification is emitted.

---

## dematerialize

**Base:** The inverse of `materialize` — converts a stream of `Notification<T>` objects back into live next/error/complete notifications.

### [dematerialize](./operators/dematerialize)()
No variants. Typically paired with `materialize` to implement operators that manipulate notifications as values — delay an error, suppress a specific error type, or replay error events through a non-error channel.
