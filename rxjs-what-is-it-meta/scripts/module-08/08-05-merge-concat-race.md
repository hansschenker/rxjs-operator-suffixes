---
module: 8
lesson: "8.5"
title: merge, concat, and race — interleaving, sequencing, and first-wins
key_insight: merge, concat, and race do not combine values — they combine timing. merge interleaves, concat sequences, race takes the winner. These three cover every scenario where sources need to be ordered or raced rather than value-combined.
---

## Hook

Not every multi-source scenario requires values from different streams to be combined into tuples. Sometimes you want to listen to multiple streams simultaneously. Sometimes you want them to run in strict order. Sometimes you only care about whichever one responds first. Three operators cover all of these — and none of them produce tuples.

## Insight

**`merge([a$, b$, c$])`** subscribes to all sources at once. Every emission from every source flows through independently, interleaved by arrival time. The merged stream is lossless — nothing is dropped, nothing is combined. It completes only when every source has completed. Use for: unifying multiple event sources into a single stream (mouse and touch events, multiple WebSocket channels), combining action streams from different parts of a UI, listening to both a cache stream and a network stream simultaneously without preference.

**`concat([a$, b$])`** subscribes to sources one at a time, in strict order. It subscribes to `b$` only after `a$` completes. If `a$` never completes, `b$` never starts. The order of the array is the order of execution — no interleaving is possible. Use for: sequential loading phases (show skeleton screen → load real data → load enhancements), running animations or transitions in order, queuing operations that must not overlap.

**`race([a$, b$, c$])`** subscribes to all sources simultaneously, but the moment any one of them emits its first value, the other sources are immediately unsubscribed. The winner's subsequent values continue; the losers are gone. This is "first-wins" semantics — not "fastest average" but "first single emission wins everything." Use for: primary-with-fallback patterns (try cache, fallback to network — whichever responds first wins), timeout races where the timeout Observable competes with the real data Observable.

## Example

```typescript
// Race: use cached data if available, otherwise fetch from network
const cachedUser$: Observable<User> = getFromCache('user');
const networkUser$: Observable<User> = ajax.getJSON<User>('/api/user');

race([cachedUser$, networkUser$]).pipe(
	tap((user: User) => saveToCache('user', user)),
).subscribe((user: User) => renderProfile(user));
// Whichever resolves first — cache hit or network response — wins.
// The other Observable is immediately unsubscribed and its result discarded.
```

For contrast, a `merge` scenario where order does not matter:

```typescript
const allClicks$ = merge(
	fromEvent<MouseEvent>(document, 'mousedown'),
	fromEvent<TouchEvent>(document, 'touchstart'),
).pipe(
	tap((evt: MouseEvent | TouchEvent) => handleInteraction(evt)),
);
```

Both sources run in parallel; whichever device the user is on produces the events.

## Summary

- `merge` = interleave all sources as they arrive; lossless; completes when all sources complete
- `concat` = sequential subscription — next source starts only when previous completes; preserves order
- `race` = first source to emit wins and all others are immediately unsubscribed; use for cache-or-network fallback patterns
