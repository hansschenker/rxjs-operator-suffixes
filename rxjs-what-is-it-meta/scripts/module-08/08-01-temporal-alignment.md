---
module: 8
lesson: "8.1"
title: Temporal alignment — the question behind every combining operator
key_insight: Every combining operator answers exactly two questions — when do I emit, and which values do I use? There are only a handful of answers to each, and those answers map directly to specific operators.
related: ["8.2", "8.3", "8.4", "8.5"]
---

## Hook

RxJS has over a dozen operators for combining multiple streams. Memorising them all is unnecessary. Two questions reduces the entire family to a decision you can make in seconds. Once you see the two-question framework, the operator list stops feeling like a catalogue to memorise and starts looking like a small set of logical consequences.

## Insight

Every combining operator answers two questions.

**Q1: When do I emit?**
The possible answers: (a) whenever any source emits — `combineLatest`; (b) only when the primary source emits — `withLatestFrom`; (c) when all sources have each contributed a new positionally-matched value — `zip`; (d) when all sources complete — `forkJoin`; (e) as each individual value arrives from any source — `merge` and `concat`.

**Q2: Which values do I use?**
The possible answers: (a) the latest cached value from every source — `combineLatest`, `withLatestFrom`; (b) values paired by position (first with first, second with second) — `zip`; (c) the final value each source emitted before completing — `forkJoin`; (d) each individual value on its own, not combined with anything — `merge`, `concat`.

Cross the two answers and you land on exactly one operator. That is the entire decision tree.

The most common mistake is using `combineLatest` when `withLatestFrom` is the correct choice. The developer wants output only when the primary source triggers, but `combineLatest` also fires when any secondary source emits — causing duplicate processing, unexpected saves, or stale computations. The two-question test catches this immediately: "does the secondary source emitting constitute a trigger?" If no, `withLatestFrom` is the answer.

## Example

Two scenarios, each resolved by applying the two questions:

**Scenario A:** "Recompute form validity whenever any field changes."
- Q1: any source triggers → Q2: latest from all sources → **`combineLatest`**

```typescript
const formValid$ = combineLatest([email$, password$]).pipe(
	map(([email, password]: [string, string]): boolean =>
		email.includes('@') && password.length >= 8,
	),
);
```

**Scenario B:** "Save the form when the save button is clicked, using current field values."
- Q1: only the save button triggers → Q2: latest from secondary sources → **`withLatestFrom`**

```typescript
saveBtn$.pipe(
	withLatestFrom(formValues$),
	map(([_, form]: [Event, FormData]) => form),
	switchMap((form: FormData) => saveToApi(form)),
).subscribe();
```

The code shape follows directly from the answers to the two questions — no memorisation required.

## Summary

- Two questions — when to emit? which values? — answer both and the operator is determined
- `combineLatest` = any source triggers, latest from all; `withLatestFrom` = primary triggers only
- Most common mistake: using `combineLatest` when `withLatestFrom` is correct, causing unintended secondary-triggered output
