---
marp: true
theme: uncover
title: "Persisted state with localStorage"
---

# Persisted state with localStorage
> State lives in memory — every page refresh silently throws away everything your user just did.

---

## Core Concept
- `localStorage` is synchronous key/value storage — read **once** at startup, write reactively on change
- **Rehydration** happens at store construction, before any subscriber fires
- Persistence is a **side effect** of state change — it belongs outside the reducer, at the stream edge
- Raw subscriptions write on every emission; use `debounceTime` to coalesce rapid state bursts
- > "Never write to `localStorage` inside a `map` or a reducer — use `tap` at the edge of the pipe."

---

## How It Works

```typescript
// INPUT: attempt to restore previous session
const saved = JSON.parse(
  localStorage.getItem('app') ?? 'null'
) as AppState | null;           // typed null-guard — getItem returns null on miss

// STORE: seed with restored state, or fall back to fresh initialState
const state$ = new BehaviorSubject<AppState>(saved ?? initialState);

// OUTPUT: persist every settled state change as a reactive side effect
state$.pipe(
  debounceTime(500),            // wait for burst to settle (e.g. fast typing)
  distinctUntilChanged(),       // skip write when reference is unchanged
).subscribe(s =>
  localStorage.setItem('app', JSON.stringify(s))
);
```

---

## Common Mistake

```typescript
// ❌ Writes on every single emission — no debounce, no dedup
state$.subscribe(state => {
  // 50 keystrokes → 50 synchronous writes
  // State reference unchanged? Writes anyway.
  localStorage.setItem('app', JSON.stringify(state));
});

// ❌ Side effect smuggled into map — breaks pipe purity
state$.pipe(
  map(state => {
    localStorage.setItem('app', JSON.stringify(state)); // map is for transformation only
    return state;
  })
).subscribe();
// Both patterns hammer storage and make effects untraceable
```

---

## The Right Way

```typescript
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

// ✅ Rehydrate at construction — one read, typed, null-safe
const seed = JSON.parse(
  localStorage.getItem('app') ?? 'null'
) as AppState | null;

const state$ = new BehaviorSubject<AppState>(seed ?? initialState);

// ✅ Persistence lives in a dedicated side-effect pipe
state$.pipe(
  debounceTime(500),           // coalesce bursts before committing
  distinctUntilChanged(),      // only write when state actually changed
  tap(s =>                     // tap = side effect, leaves value untouched
    localStorage.setItem('app', JSON.stringify(s))
  )
).subscribe();                 // activate — one subscribe, zero nesting
```

---

## Key Rule
> **Rehydrate once at construction with a null-guard, and persist through a `debounceTime` + `tap` pipe — never write storage inside a reducer or a `map`.**