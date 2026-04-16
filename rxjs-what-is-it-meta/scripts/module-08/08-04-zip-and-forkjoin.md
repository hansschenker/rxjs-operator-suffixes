---
module: 8
lesson: "8.4"
title: zip and forkJoin — pairing by index and parallel completion
key_insight: zip pairs values by position across streams and emits progressively. forkJoin waits for all sources to complete and emits the final values once. Use zip for ordered pairing; forkJoin for parallel initialization.
related: ["8.1", "8.5"]
---

## Hook

Two operators that both wait before emitting. One is patient and progressive — it emits a new pair each time both sources have each contributed one more value. The other waits for everyone to finish and hands you the final results all at once. They look similar from a distance but they serve entirely different contracts.

## Insight

**`zip([a$, b$])`** pairs values by index. It emits `[a[0], b[0]]` when both sources have emitted their first value, then holds until both emit again for `[a[1], b[1]]`, and so on. Like a physical zipper — each tooth from one side pairs with the corresponding tooth from the other side; no tooth from either side is skipped or shared.

The memory risk is real: if one source emits at 10 values per second and the other at 1 value per second, the faster source's unmatched values accumulate in an internal buffer. On infinite or high-volume streams, this buffer can grow without bound. `zip` completes when any source completes. Use for: pairing HTTP requests with their corresponding responses identified by sequence number, correlating two streams where positional correspondence is meaningful.

**`forkJoin([a$, b$, c$])`** subscribes to all sources simultaneously and waits for all to complete. When the last source completes, it emits a single `[lastA, lastB, lastC]` tuple containing the final value each source produced. It never emits intermediate values — you either get one combined emission at the end or nothing.

Two hard failure modes: if any source errors, `forkJoin` errors immediately and the other sources are unsubscribed; if any source never completes, `forkJoin` never emits. The standard defence is `catchError` applied individually to each source, giving each a fallback value so a single failure does not abort the entire combination.

Use `forkJoin` for: parallel HTTP requests on page load where all data is required before rendering, parallel cache lookups, any "start everything at once, wait for all results" pattern.

## Example

```typescript
interface PageData {
	user: User;
	config: Config;
	permissions: Permission[];
}

forkJoin({
	user: loadUser().pipe(
		catchError(() => of(null as User | null)),
	),
	config: loadConfig().pipe(
		catchError(() => of(defaultConfig)),
	),
	permissions: loadPermissions().pipe(
		catchError(() => of([] as Permission[])),
	),
}).pipe(
	tap((data: PageData) => console.log('Page data loaded', data)),
).subscribe((data: PageData) => renderPage(data));
```

The object form of `forkJoin` (rather than array) produces a named result object directly, removing the need for destructuring by index. Each source has its own `catchError` so a failed permissions call does not prevent the user profile from rendering.

## Summary

- `zip` = pair by index, emits progressively, memory risk when sources emit at mismatched rates
- `forkJoin` = wait for all sources to complete, one final emission, errors if any source errors or never completes
- Use `zip` for ordered positional correlation; use `forkJoin` for parallel page initialisation with individual `catchError` guards
