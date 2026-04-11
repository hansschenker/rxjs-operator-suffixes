---
marp: true
theme: uncover
title: "combineLatest: Formal Rules & the EMPTY Trap"
---

# combineLatest: Formal Rules & the EMPTY Trap
> Your stream combination emits nothing and you don't know why — the initial synchronisation rule is silently blocking all output.

---

## Core Concept
- **Rule 1 — Initial Sync:** No output until *every* source has emitted at least once
- **Rule 2 — Any-Source Trigger:** After sync, any source emission produces a new array output
- **Rule 3 — Latest Value Retention:** Each source holds exactly one slot; new values overwrite — `O(n)` memory
- **Rule 4 — All-Complete:** Completes only when **all** sources complete
- **Rule 5 — Error Propagation:** One source error immediately kills the combination and unsubscribes all siblings

> "∀i ∈ [1..n]: sourceᵢ must emit at least one value before combineLatest emits"

---

## How It Works

```
a$:  ──1──────3──────────
b$:  ─────2──────4───────
          ↑      ↑
       sync OK  b$ triggers;
      [1,2] out  a$ reuses 3

out: ─────[1,2]──[3,2]──[3,4]──
```

```typescript
const a$ = new Subject<number>();
const b$ = new Subject<number>();

combineLatest([a$, b$]).subscribe(console.log);

a$.next(1); // silence — b$ has not emitted yet (Rule 1)
b$.next(2); // → [1, 2]  both slots filled; sync achieved
a$.next(3); // → [3, 2]  a$ triggers, b$ retains 2 (Rule 2 + 3)
b$.next(4); // → [3, 4]  b$ triggers, a$ retains 3
```

---

## Common Mistake

```typescript
// WRONG: EMPTY completes immediately without ever emitting.
// Rule 1 requires every source to emit at least once — EMPTY never does.
const flags$ = featureFlagsReady ? of(defaultFlags) : EMPTY;
//                                                     ^^^^
//                                 Feels harmless — it's not.
//                                 EMPTY is absorptive: the entire
//                                 combination is poisoned and emits nothing.

combineLatest([
	userProfile$,
	flags$, // ← zero emissions before complete → Rule 1 never satisfied
]).subscribe(([user, flags]) => {
	// This callback NEVER fires, and there is no error to catch.
	renderDashboard(user, flags);
});
```

---

## The Right Way

```typescript
// ✓ BehaviorSubject always has a current value — Rule 1 is satisfied on subscribe
const flags$ = new BehaviorSubject<Flags>(defaultFlags);

combineLatest([
	userProfile$.pipe(
		catchError(() => EMPTY), // ✓ isolate errors per-source (Rule 5)
	),
	flags$,                      // ✓ emits synchronously on subscribe; never blocks
]).pipe(
	map(([user, flags]) => ({ user, flags })), // ✓ shape before subscribe
).subscribe(({ user, flags }) => {
	renderDashboard(user, flags);
});

// ✓ Cold HTTP source? Share it so Rule 1 is satisfied once, not per-subscriber
const data$ = ajax.getJSON('/api/data').pipe(shareReplay(1));
```

---

## Key Rule
> **`EMPTY` satisfies Rule 4 (it completes) but never satisfies Rule 1 (it emits nothing) — so any `combineLatest` that includes `EMPTY` as a source will complete silently having emitted zero values.**