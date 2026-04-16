---
module: 6
lesson: "6.4"
title: share() and shareReplay() — mechanics, configuration, and gotchas
key_insight: share() is a live radio broadcast — late subscribers miss everything already aired. shareReplay(1) is YouTube — late subscribers start from the last frame. Choosing wrong causes either stale data or memory leaks.
related: ["6.1", "6.5", "10.5"]
---

## Hook

`share()` and `shareReplay(1)` are both used for multicasting and both look almost identical at a call site. They have entirely different behavior for late subscribers — and one of them silently leaks memory if you use the wrong configuration. The wrong choice here is not a type error; it is invisible until you check your heap profiler or notice stale data in a component that mounted late.

## Insight

**`share()`** creates a `Subject` internally. It connects to the source Observable on the first subscriber — refCount increments to 1. Each additional subscriber increments refCount further. When the last subscriber unsubscribes, refCount drops to 0 and the source subscription is torn down. A subscriber that arrives after refCount hits 0 triggers a new source subscription from scratch — they do not receive any past values. Use `share()` for live event streams where past values have no meaning: DOM events, WebSocket messages, user interaction streams, timer ticks.

**`shareReplay({ bufferSize: N, refCount: true })`** creates a `ReplaySubject(N)` internally. Late subscribers immediately receive the last N buffered values when they subscribe, then continue receiving live emissions. The `refCount: true` configuration means: tear down the source subscription when refCount drops to 0, exactly like `share()`. The alternative, `refCount: false` — which was the RxJS 6 default and still the default when you call `shareReplay(1)` without an options object — means: never tear down the source. The source stays subscribed to indefinitely, even with zero active consumers. This is the memory leak. It is silent, automatic, and accumulates across every `shareReplay()` call in your application.

The rule is simple: always write `shareReplay({ bufferSize: 1, refCount: true })`. Never use the bare `shareReplay(1)` shorthand in production code.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

interface Config { apiBase: string; featureFlags: Record<string, boolean>; }

// Correct: one HTTP request, result cached for late subscribers, cleans up when all unsubscribe
const config$ = ajax.getJSON<Config>('/api/config').pipe(
	shareReplay({ bufferSize: 1, refCount: true }),
);

// First subscriber triggers the HTTP request
config$.subscribe((cfg: Config) => renderHeader(cfg));

// Second subscriber — even if it arrives after the response — gets the cached value immediately
config$.subscribe((cfg: Config) => renderSidebar(cfg));

// When both unsubscribe, refCount hits 0 and the source Observable is cleaned up
// A future subscriber will trigger a fresh HTTP request — no stale data, no leak

function renderHeader(_cfg: Config): void { /* ... */ }
function renderSidebar(_cfg: Config): void { /* ... */ }
```

## Summary

- `share()` = live broadcast via a Subject; no replay; disconnects at refCount 0; use for event streams
- `shareReplay({ bufferSize: 1, refCount: true })` = replay via ReplaySubject; replays last value; disconnects safely
- Never use `shareReplay()` without an explicit options object — the default `refCount: false` keeps the source subscribed forever

## Pitfall

Using `shareReplay(1)` (shorthand form) without `refCount: true`. The shorthand is equivalent to `shareReplay({ bufferSize: 1, refCount: false })` in RxJS 6, which keeps the internal subscription alive after all consumers unsubscribe. New subscribers then receive stale cached data instead of triggering a fresh execution. Always use `shareReplay({ bufferSize: 1, refCount: true })`.
