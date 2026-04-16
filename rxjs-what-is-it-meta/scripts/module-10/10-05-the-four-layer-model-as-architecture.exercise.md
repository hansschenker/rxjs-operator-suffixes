---
module: 10
lesson: "10.5"
title: The Four-Layer Model as Architecture
exercise: Diagnose two production bugs using the 4-Layer Model framework before looking at the implementation.
difficulty: advanced
---

## Scenario

A live analytics dashboard has three separate bugs reported by users. The goal is to identify which layer each bug belongs to, name the specific operator to inspect, and describe the fix — using the 4-Layer Model as a diagnostic framework, before reading any implementation code.

## Starter Code

```typescript
// Bug report A: "The user's name in the header shows the wrong format — it's showing
// 'ALICE SMITH' when it should show 'Alice Smith'."
// 4-Layer diagnosis:
// Layer: ???  (1=Values, 2=Time, 3=Sharing, 4=Flattening)
// Operator to inspect: ???
// Likely fix: ???

// Bug report B: "After the user changes their subscription plan, the pricing shown
// on the checkout page still shows their old plan's price for about 30 seconds."
// 4-Layer diagnosis:
// Layer: ???
// Operator to inspect: ???
// Likely fix: ???

// Bug report C: "The 'Export CSV' button sometimes exports data from 2 requests ago
// when the user has already changed the date filter."
// 4-Layer diagnosis:
// Layer: ???
// Operator to inspect: ???
// Likely fix: ???
```

## Task

1. Fill in the complete 4-Layer diagnosis for Bug A — which layer, which operator to inspect, what one-sentence fix.
2. Fill in the diagnosis for Bug B — the 30-second stale data strongly suggests a specific Layer 3 misconfiguration; name it.
3. Fill in the diagnosis for Bug C — "data from 2 requests ago" with a changed filter is a classic Layer 4 race condition; name the operator that should replace the current one.

## Hint

The 4-Layer Model is a diagnostic compass. Wrong value shape = Layer 1 (map/filter/scan). Wrong timing = Layer 2 (debounce/throttle). Stale shared data = Layer 3 (shareReplay/share). Wrong inner Observable winning = Layer 4 (switchMap/exhaustMap/concatMap).
