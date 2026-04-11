---
marp: true
theme: uncover
title: "RxJS as a dataflow graph"
---

# RxJS as a dataflow graph
> Developers who see operators as isolated helpers write nested subscriptions; developers who see them as graph nodes write flat, composable pipelines

---

## Core Concept

- An RxJS pipeline is a **directed dataflow graph**: operators are nodes, subscriptions are edges, values are tokens flowing through
- `pipe()` is the `|` of reactive programming — same composition principle as Unix pipes
- Every operator agrees on one contract: `OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>`
- The graph is **lazy** — nothing executes until `.subscribe()` connects a sink
- **"TypeScript enforces the type at each edge of the graph — broken graph, caught at design time"**

---

## How It Works

```
source$.pipe(
  filter(x => x > 0),       // Node 1: gate
  map(x => x * 2),          // Node 2: transform
  debounceTime(300),         // Node 3: rate-limit
  switchMap(x => fetch$(x)) // Node 4: fork → inner subgraph
).subscribe(sink)            // Sink: terminal node

INPUT                             OUTPUT
source ──→ filter ──→ map ──→ debounceTime ──→ switchMap ──→ sink
                                                    │
                                              fetch$(x)
                                          (inner subgraph;
                                           cancelled on re-emit)
```

---

## Common Mistake

```typescript
// ❌ Treating streams as callbacks — nested subscribes
// Why it fails: creates multiple live subscriptions with no cancellation,
// leaks memory on re-emission, and buries the graph where you can't see,
// test, or cancel any part of it

source$.subscribe(x => {
	if (x > 0) {
		fetch$(x * 2).subscribe(result => {
			// side effects buried two levels deep — untestable, uncancellable
			console.log(result);
		});
	}
});
```

---

## The Right Way

```typescript
// ✅ Declare the graph explicitly — every node visible and type-safe
source$.pipe(
	filter((x): x is number => x > 0),  // gate: only positive values pass
	map(x => x * 2),                     // transform: double each token
	debounceTime(300),                   // rate-limit: collapse bursts
	switchMap(x => fetch$(x)),           // fork: inner graph, auto-cancels
	takeUntil(destroy$),                 // terminate: clean shutdown
).subscribe(result => {
	// sink receives only final output — pure side effect, nothing hidden
	render(result);
});
```

---

## Key Rule

> **Every `pipe()` chain is a graph declaration — name your nodes with operators, not callbacks, and the compiler enforces every edge.**