---
module: 10
lesson: "10.5"
title: The Four-Layer Model as Architecture
exercise: Diagnose two production bugs — wrong value format and stale data after token refresh — using the 4-Layer Model framework before looking at the implementation.
difficulty: advanced
---

## Scenario

A live analytics dashboard has two bugs reported by users. The goal is to identify which layer each bug belongs to, name the specific operator to inspect, and describe the fix — using the 4-Layer Model as a diagnostic framework, before reading any implementation code.

## Starter Code

```typescript
// Bug report A: "The user's name in the header shows the wrong format — it's showing
// 'ALICE SMITH' when it should show 'Alice Smith'."
// 4-Layer diagnosis:
// Layer: ???  (1=Values, 2=Time, 3=Sharing, 4=Flattening)
// Operator to inspect: ???
// Likely fix: ???

// Bug report B: "After the user's authentication token is refreshed in the background,
// the dashboard still shows data from the previous session for several minutes."
// 4-Layer diagnosis:
// Layer: ???
// Operator to inspect: ???
// Likely fix: ???
```

## Task

1. Fill in the complete 4-Layer diagnosis for Bug A — which layer, which operator to inspect, what one-sentence fix.
2. Fill in the diagnosis for Bug B — the stale-data-after-token-refresh pattern strongly suggests a specific Layer 3 misconfiguration; name the operator and the parameter that causes the cache to survive a new subscription.
3. Write a one-sentence general rule: given any reported bug symptom, how do you decide which layer to start your investigation at?

## Hint

The 4-Layer Model is a diagnostic compass. Wrong value shape = Layer 1 (map/filter/scan). Wrong timing = Layer 2 (debounce/throttle). Stale shared data = Layer 3 (shareReplay/share). Wrong inner Observable winning = Layer 4 (switchMap/exhaustMap/concatMap).
