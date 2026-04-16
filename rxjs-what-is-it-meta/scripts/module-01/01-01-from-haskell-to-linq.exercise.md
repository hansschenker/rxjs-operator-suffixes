---
module: 1
lesson: "1.1"
title: From Haskell to LINQ — the intellectual lineage of RxJS
exercise: Identify the LINQ-to-RxJS operator equivalents and explain what changed in the translation from pull to push.
difficulty: beginner
---

## Scenario

A team is debating whether to use RxJS or write custom async utility functions. A developer argues: "RxJS operators are just utility functions — we could write the same things ourselves." You need to explain why the operator vocabulary is a mathematical consequence of duality, not an arbitrary API.

## Starter Code

```typescript
// Match each LINQ method to its RxJS counterpart
// and fill in what changed in the translation from pull to push

const linqToRxjs: Array<{ linq: string; rxjs: string; whatChanged: string }> = [
	{ linq: 'Select',    rxjs: '???', whatChanged: '???' },
	{ linq: 'Where',     rxjs: '???', whatChanged: '???' },
	{ linq: 'Aggregate', rxjs: '???', whatChanged: '???' },
	{ linq: 'SelectMany',rxjs: '???', whatChanged: '???' },
	{ linq: 'Take',      rxjs: '???', whatChanged: '???' },
	{ linq: 'Zip',       rxjs: '???', whatChanged: '???' },
];
```

## Task

1. Fill in the `rxjs` field for each row with the correct RxJS operator name.
2. Fill in `whatChanged` — describe in one sentence how the semantics shift from synchronous pull to asynchronous push.
3. Add one row for an RxJS operator that has **no direct LINQ equivalent** (hint: it involves time) and explain why LINQ could not have it.

## Hint

The operators share names because the structure is dual — the operator vocabulary survives the arrow-flip from pull to push. Time-based operators are new because `IEnumerable` has no temporal dimension.
