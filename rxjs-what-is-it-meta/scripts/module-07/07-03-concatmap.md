---
module: 7
lesson: "7.3"
title: concatMap — serial, ordered execution
key_insight: concatMap never subscribes to a new inner Observable until the previous one completes, enforcing strict ordering — and silently building an unbounded queue if inner Observables are slow.
related: ["7.1", "7.2"]
---

## Hook

If you have ever needed a guarantee that a sequence of async operations runs in exactly the order it was requested — not in parallel, not with any skipping — `concatMap` is the only flattening operator that provides this guarantee unconditionally. The cost is that it is also the only one that can silently grow a queue and exhaust memory if the outer source is faster than the inner work.

## Insight

`concatMap(project)` subscribes to the inner Observable for the first outer value, then waits for it to complete before subscribing for the second outer value, then waits again before the third. Concurrency is always exactly 1: at most one inner Observable is active at any moment.

Output order is guaranteed to match input order. The nth output batch always corresponds to the nth input value. This is the property that makes `concatMap` correct for writes: database mutations, file system operations, ordered save operations, user action audit logs where sequence is semantically critical.

If five outer values arrive while the first inner Observable is still running, all five are queued in memory. When the first inner Observable completes, the second starts. When that completes, the third starts. The queue drains in arrival order with no parallelism.

This introduces a memory risk that `mergeMap` and `switchMap` do not share. If the outer source emits quickly — say, a user typing fast where each keystroke triggers a database write — and each inner Observable takes 200ms, the queue grows without bound. Eventual memory pressure is the failure mode. Know your emission rate and your inner Observable latency before choosing `concatMap`.

## Example

```typescript
interface SaveResult { id: string; savedAt: number; }

// User edits arrive rapidly — each must be saved in exact order
userEdits$.pipe(
	concatMap((edit: Edit) => saveEdit(edit)),
	// saveEdit returns Observable<SaveResult>
	// Each save completes before the next begins
	tap((result: SaveResult) => showSavedIndicator(result)),
).subscribe();
```

With `mergeMap` here, a slow first save could arrive after a fast second save, silently overwriting newer data with older data. `concatMap` makes this class of bug structurally impossible — the second save cannot start until the first save has confirmed completion.

## Summary

- `concatMap` enforces serial execution — one inner Observable at a time, strictly ordered
- Output order is guaranteed to match input order, making it the correct choice for writes and ordered mutations
- Slow inner Observables silently build an unbounded queue — measure emission rate against inner latency before using `concatMap` on a high-frequency source
