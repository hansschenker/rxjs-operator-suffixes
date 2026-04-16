---
module: 1
lesson: "1.1"
title: From Haskell to LINQ — the intellectual lineage of RxJS
key_insight: RxJS didn't invent its operator library — it copied 10 years of LINQ knowledge that already existed for arrays, making async programming feel familiar on day one.
related: ["1.2", "3.5"]
---

## Hook

Most developers approach RxJS like a foreign language — a hundred new operator names to memorize before they can write a single line. But here is the uncomfortable truth: you already know most of these operators. They have different names on the tin, but the ideas behind `map`, `filter`, `reduce`, `concat`, and `zip` are the same ones you use every day on arrays.

## Insight

The lineage runs in a straight line: Haskell list comprehensions gave the world a declarative syntax for transforming sequences in the 1990s. C# borrowed this idea and formalized it as LINQ — Language Integrated Query — which shipped with .NET 3.5 in 2007 and let you write `from x in collection where x > 1 select x * 2` directly inside the language for any `IEnumerable<T>`.

Erik Meijer, one of LINQ's architects at Microsoft, then asked a deceptively simple question in 2009: if these operators work on pull-based sequences (`IEnumerable`), what would it look like to apply the exact same operators to push-based sequences? The answer became Rx.NET — Reactive Extensions for .NET — released between 2009 and 2012. RxJS followed as the JavaScript port in 2012.

Microsoft's key insight was that `map`, `filter`, `reduce`, `zip`, and `concat` are not inherently synchronous ideas. They are sequence ideas. Whether values arrive all at once in memory or one at a time over the network, you still want to transform them, filter them, and combine them. The operator set transferred intact, with no reinvention required. RxJS inherited over 100 operators that had already been proven correct for arrays over a decade of LINQ usage.

## Example

Compare the two pipelines below. The array pipeline uses the built-in `Array` prototype. The Observable pipeline uses RxJS `from` and `pipe`. Every operator name is identical; only the execution model differs — one is synchronous and pull-based, the other is lazy and push-based.

```typescript
import { from } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// Array pipeline — synchronous, pull-based
const arrayResult: number[] = [1, 2, 3]
	.filter((x: number) => x > 1)
	.map((x: number) => x * 2);
// [4, 6]

// Observable pipeline — lazy, push-based
const obs$ = from([1, 2, 3]).pipe(
	filter((x: number) => x > 1),
	map((x: number) => x * 2),
);
// Emits: 4, 6, complete
```

You already knew both of those operators. LINQ was the intellectual bridge that made this possible — the operators did not need to be invented twice.

## Summary

- RxJS operators feel like array methods because they are — LINQ was the intellectual bridge that carried them from synchronous to asynchronous sequences
- Erik Meijer's duality insight (2009) proved the same operator set applies to both pull and push collections, making the port possible without reinventing operators
- Learning array operators (`map`, `filter`, `reduce`) counts as partial credit toward RxJS — you already speak the vocabulary

## Pitfall

Treating `map` and `filter` as syntactic conveniences rather than a mathematical consequence. Because RxJS operators derive from the IEnumerable/IObservable duality, they compose by law — not by coincidence. Developers who treat them as arbitrary functions miss that the composition guarantees come from the mathematical structure, not from RxJS's implementation choices.
