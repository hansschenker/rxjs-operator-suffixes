---
marp: true
theme: uncover
title: "The operator policy framework (8 axes)"
---

# The operator policy framework (8 axes)
> Operators feel like a grab-bag of magic until you have a framework — the 8 policies make every operator's implicit behaviour explicit and predictable.

---

## Core Concept
- Every RxJS operator is fully described by **8 policies**: Start · Emit · Completion · State · Cancellation · Error · Output Type · Input Type
- Policies 7 & 8 form the **type chain rule**: output type of operator *n* must equal input type of operator *n+1*
- TypeScript enforces the type chain **at compile time** inside `pipe()` — mismatches are errors, not surprises
- The Emit policy is the single most misread policy — it explains `scan` vs `reduce`, `debounceTime` vs `throttleTime`, `first` vs `take(1)`
- > "Every operator's output type must match the next operator's input type."

---

## How It Works

```typescript
// TypeScript infers the type chain at compile time
of(1, 2, 3)                            // Observable<number>
	.pipe(
		map(x => x * 2),               // OperatorFunction<number, number>
		map(x => x.toString()),        // OperatorFunction<number, string>
		map(s => s.length),            // OperatorFunction<string, number>
		filter(n => n > 0),            // OperatorFunction<number, number>
	);
// ──────────────────────────────────────
// scan  Emit policy → fires after EVERY source next  (streaming)
// reduce Emit policy → fires ONLY on source complete  (aggregate)
// All other policies are identical — one policy difference, one behaviour change
```

---

## Common Mistake

```typescript
// ✗ Wrong: reaching for reduce() because it looks like a Redux reducer
const action$ = new Subject<AppAction>();

const state$ = action$.pipe(
	// reduce() Emit policy: waits for complete().
	// A Subject driven by user events never completes naturally.
	// Every dispatched action is consumed silently — zero emissions to the UI.
	reduce(reducer, initialState),
);

state$.subscribe(s => renderUI(s)); // 💀 renderUI never called
action$.next({ type: 'INCREMENT', payload: 1 }); // silently swallowed
```

---

## The Right Way

```typescript
// ✓ Correct: scan() — Emit policy fires on every source next
const action$ = new Subject<AppAction>();

const state$ = action$.pipe(
	// scan Emit policy: emits the running accumulator after each action
	scan(reducer, initialState),
	// startWith satisfies the Start policy: subscribers get a value immediately
	startWith(initialState),
	// shareReplay satisfies the State policy: one shared execution, late-subscribe safe
	shareReplay(1),
);

state$.subscribe(s => renderUI(s)); // ✓ fires on every dispatched action
action$.next({ type: 'INCREMENT', payload: 1 }); // → renderUI({ count: 1 })
```

---

## Key Rule
> **When an operator misbehaves, exactly one of the 8 policies is violated — identify the policy, and the correct operator selects itself.**