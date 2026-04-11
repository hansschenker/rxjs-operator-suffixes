I have the wiki source content from the user's message. I'll construct the slide deck from the provided ReplaySubject.md and AsyncSubject.md content, following the exact Marp structure required.

---
marp: true
theme: uncover
title: "ReplaySubject and AsyncSubject: when BehaviorSubject is not right"
---

# ReplaySubject and AsyncSubject: when BehaviorSubject is not right
> BehaviorSubject forces a null initial value when state isn't ready yet — leaking a meaningless emission to every subscriber and requiring guards everywhere it's consumed.

---

## Core Concept

- **`ReplaySubject(N)`** buffers the last N emitted values and replays them instantly to any late subscriber — no initial value required
- **`ReplaySubject(1)` vs `BehaviorSubject`**: both replay one value to late subscribers, but ReplaySubject(1) emits *nothing* until a real value arrives; BehaviorSubject always emits immediately
- **`AsyncSubject`** silently buffers all values and emits **only the last one when `complete()` is called** — the Promise analog among Subjects
- Rule: *"Use `ReplaySubject(1)` when there may be no initial value; use `BehaviorSubject` when state must always have a value."*
- For async/await bridging prefer `lastValueFrom()` / `firstValueFrom()` over `AsyncSubject` directly (RxJS 7+)

---

## How It Works

```typescript
// ReplaySubject(3): buffers last 3, replays immediately to late subscriber
// Input:   --1--2--3--4--|
//                   ^ late subscriber joins
// Output:  2--3--4--|       ← 2,3,4 replayed instantly, then live

const buf$ = new ReplaySubject<number>(3);
buf$.next(1); buf$.next(2); buf$.next(3); buf$.next(4);
buf$.subscribe(v => console.log(v)); // 2, 3, 4

// AsyncSubject: holds all values, emits last ONLY on complete()
// Input:   --1--2--3--|   (complete fires)
// Output:  ----------3|   ← emitted at complete() to ALL subscribers

const last$ = new AsyncSubject<number>();
last$.subscribe(v => console.log('early:', v)); // waits silently
last$.next(1); last$.next(2); last$.next(3);
last$.complete(); // early: 3  ← fires now
last$.subscribe(v => console.log('late:', v));  // late:  3  ← immediate
```

---

## Common Mistake

```typescript
// ❌ BehaviorSubject with null — null is not a real initial state
const user$ = new BehaviorSubject<User | null>(null);

// Subscribers fire immediately with null — every consumer must guard
user$.subscribe(user => {
  if (!user) return;       // ← defensive boilerplate in every subscriber
  render(user);
});

// ❌ BehaviorSubject for a one-shot async result
const config$ = new BehaviorSubject<Config | null>(null);
fetchConfig().subscribe(result => config$.next(result));
// A late subscriber receives null first — silent rendering bug;
// the component may render an empty/broken state before data arrives
```

---

## The Right Way

```typescript
import { ReplaySubject, AsyncSubject, lastValueFrom } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

// ✅ ReplaySubject(1) — no null, no guards; emits when data is real
const user$ = new ReplaySubject<User>(1);
fetchUser().subscribe(user$);           // pipe the source into the subject

user$.pipe(
  map((u: User) => u.displayName),     // only real User values reach here
).subscribe(render);

// ✅ AsyncSubject — collect a stream, expose only the final result
const config$ = new AsyncSubject<Config>();
loadConfig().subscribe(config$);        // completion propagates through
config$.subscribe(applyConfig);         // fires exactly once, on complete()

// ✅ Prefer lastValueFrom() for async/await — cleaner than AsyncSubject directly
const config: Config = await lastValueFrom(loadConfig());

// ✅ shareReplay(1) for shared derived state — ReplaySubject(1) under the hood
const shared$ = source$.pipe(
  map(transform),
  shareReplay(1),                       // late subscribers get the cached value
);
```

---

## Key Rule
> **Never fake an initial value with `null` just to satisfy `BehaviorSubject` — that's the signal that `ReplaySubject(1)` is the right tool.**