---
title: "Multicasting & Sharing"
---

> Not sure which to use? [Decision tree →](../decisions/multicasting)

Cause a **single upstream subscription** to be shared among multiple downstream subscribers — preventing repeated cold-Observable side effects such as duplicate HTTP requests.

## publish

**Base:** Multicast the source via a `Subject`, giving explicit control over when to connect (`connect()` / `refCount()`). The suffix selects the **Subject variant** used internally. Deprecated in RxJS 7 — prefer `share()` / `connectable()`.

### [publishBehavior](../operators/publishBehavior)(initialValue)
Uses a `BehaviorSubject` — late subscribers immediately receive the **last emitted value**.

### [publishLast](../operators/publishLast)()
Uses an `AsyncSubject` — emits only the **final value** once the source completes.

### [publishReplay](../operators/publishReplay)(bufferSize?)
Uses a `ReplaySubject` — late subscribers receive the last `bufferSize` values replayed.

---

## share

**Base:** Multicast with automatic `refCount` — subscribes upstream when the first subscriber arrives and unsubscribes when the last one leaves.

### [shareReplay](../operators/shareReplay)(bufferSize | config)
Like `share` but also **replays** the last `bufferSize` values to new subscribers. The config form `{ bufferSize, refCount, windowTime }` controls whether the replay buffer persists after all subscribers unsubscribe — a common source of memory leaks when `refCount: false`.

---
