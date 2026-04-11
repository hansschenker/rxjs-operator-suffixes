---
marp: true
theme: uncover
title: "merge, concat, race, zip: when to use each"
---

# merge, concat, race, zip: when to use each
> Every intermediate RxJS developer defaults to `merge` — then spends hours debugging out-of-order values, permanently blocked pipelines, and silent memory leaks caused by picking the wrong coordination model.

---

## Core Concept

- **`merge`** — subscribes to all sources simultaneously; emits values as they arrive from any source, interleaved
- **`concat`** — subscribes one source at a time; the next source only starts when the previous **completes**
- **`race`** — subscribes to all simultaneously; the **first source to emit wins** and all others are immediately unsubscribed
- **`zip`** — pairs the *nth* emission from each source; holds back until every source has emitted at index *n*
- > "If any source never completes, all subsequent `concat` sources are blocked forever."

---

## How It Works

```
merge — parallel, interleaved
  a$:  --1-----3--|
  b$:  ----2------4--|
  out: --1-2---3--4--|

concat — sequential, ordered
  a$:  --1--2--|
  b$:           --3--4--|
  out: --1--2----3--4--|

race — first emitter wins, rest unsubscribed
  a$:  ──────────1─►  (arrives late → disposed)
  b$:  ────2───────►  (first to emit → wins)
  out: ────2───────►

zip — pair by index, not by time
  a$:  --1-----------2------|
  b$:  ----------A------B---|
  out: ----------[1,A]--[2,B]--|
```

---

## Common Mistake

```typescript
// ❌ Wrong — using zip to "combine latest user + latest prefs"
// zip pairs by INDEX, not by latest value

const userWithPrefs$ = zip([
	currentUser$,   // BehaviorSubject: emits Alice, Bob, Carol…
	preferences$,   // BehaviorSubject: emits 'dark', 'light'…
]);

// Appears to work for the first pair: [Alice, 'dark']
// On next user change (Bob), zip waits for preferences$ index 2.
// If prefs don't re-emit, Bob is buffered in memory — forever.
// Fast-changing sources cause unbounded buffering → memory leak.
// Use combineLatest when you want "latest of each on any change".
```

---

## The Right Way

```typescript
import { merge, concat, race, zip, timer } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

// Parallel events — any source, no ordering needed: merge
const interactions$ = merge(
	click$.pipe(map(() => ({ type: 'click' as const }))),
	keydown$.pipe(map((e: KeyboardEvent) => ({ type: 'key' as const, key: e.key }))),
);

// Ordered steps — each must finish before next starts: concat
const appInit$ = concat(
	verifyAuth$,    // step 1 must complete before step 2 subscribes
	loadConfig$,    // step 2 must complete before step 3 subscribes
	renderShell$,
);

// First responder wins — timeout / fallback pattern: race
const data$ = race([
	primaryApi$,                              // fast path
	fallbackApi$,                             // slow path
	timer(3000).pipe(mapTo(null as null)),    // hard timeout
]);

// Coordinated pairs by position — not by time: zip
const qa$ = zip([questions$, answers$]).pipe(
	map(([q, a]: [string, string]) => ({ question: q, answer: a })),
);
```

---

## Key Rule
> **Choose by coordination model: `merge` for parallel events, `concat` for strictly ordered steps, `race` for first-wins fallback, `zip` for index-paired data sets — the wrong choice silently reorders values, starves downstream sources, or buffers unboundedly.**