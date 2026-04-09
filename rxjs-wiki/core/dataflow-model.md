---
title: "RxJS as a Dataflow Model"
category: core
tags: [core, dataflow, pipeline, graph, unix, composition, mental-model]
related: [Observable.md, operators.md, custom-operators.md, observable-internals.md]
sources: 1
updated: 2026-04-08
---

# RxJS as a Dataflow Model

> An RxJS pipeline is a **directed dataflow graph**: operators are nodes, subscriptions are edges, and values are data tokens that flow through the graph. This is not a metaphor — it is the precise execution model.

## What Dataflow Programming Is

Dataflow programming models a program as a directed graph:

```
[Source node] ──data──→ [Transform node] ──data──→ [Sink node]
```

- **Node** = an operation that accepts input data and produces output data
- **Edge** = a directed channel carrying data from one node to the next
- A node fires when its inputs are available

Classic dataflow languages (Lustre, LabVIEW, Simulink) use this model explicitly with visual graphs. RxJS expresses the same model as composable functions — the graph is implicit in the operator chain.

## The Observable Pipeline Is a Dataflow Graph

```typescript
source$.pipe(
	filter(x => x > 0),          // Node 1: filter
	map(x => x * 2),              // Node 2: transform
	debounceTime(300),            // Node 3: rate-limit
	switchMap(x => fetch$(x)),    // Node 4: fork to inner graph
).subscribe(sink);               // Sink
```

This is exactly:

```
source → filter → map → debounceTime → switchMap → sink
                                            ↓
                                        fetch$ (inner graph)
```

Each operator is a node. `pipe()` wires them together. Values flow left to right. The graph is **lazy** — it does nothing until `.subscribe()` connects a sink.

## Operators as Dataflow Components

```typescript
// map, filter, and fold are the canonical dataflow triad
// — the same three functions used in functional dataflow, Hadoop, and stream processing

source$.pipe(
	filter(isEven),      // filter node — drops tokens that don't match
	map(square),         // map node   — transforms each token
	scan(sum, 0),        // fold node  — accumulates into running state
)
```

These three operators have a universal interface: an Observable in, an Observable out. That shared interface is what makes composition possible — exactly the same principle as Unix pipes:

```bash
# Unix dataflow (shell)
cat numbers.txt | grep "^[0-9]*[02468]$" | awk '{print $1^2}' | awk '{sum+=$1} END{print sum}'

# RxJS dataflow
numbers$.pipe(filter(isEven), map(square), reduce(sum, 0))
```

The RxJS `pipe()` operator is the `|` of reactive programming. The parallel is not accidental — both are applications of the same composition principle.

## Unix Philosophy Applied to Streams

Eric S. Raymond's *Rule of Composition* (The Art of Unix Programming):

> "Write programs that do one thing well. Write programs that work together. Write programs that handle text streams, because that is a universal interface."

Applied to RxJS operators:

| Unix Rule | RxJS Equivalent |
|-----------|----------------|
| Do one thing well | Each operator has one clearly defined transformation |
| Work together | `OperatorFunction<T,R>` is a universal interface enabling composition |
| Universal interface | `Observable<T>` — every operator accepts and returns one |
| `\|` pipe | `pipe()` — chains operators left to right |

A well-designed operator does exactly one thing. Composition builds complex behaviour from simple parts — without any operator needing to know about its neighbours.

## The Shared Interface Is the Power

The reason RxJS operators are composable:

```typescript
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
```

Every operator agrees on one input type and one output type: `Observable`. This is analogous to how Unix programs agree on stdin/stdout as a universal text interface. Any operator can be connected to any other, as long as the generic types align.

```
filter: Observable<T>  → Observable<T>      (MonoTypeOperatorFunction)
map:    Observable<T>  → Observable<R>      (OperatorFunction<T,R>)
scan:   Observable<T>  → Observable<State>  (OperatorFunction<T,State>)
```

TypeScript enforces the type at each edge of the graph. If `map` produces `Observable<string>` and the next operator expects `Observable<number>`, the compiler rejects it — broken graph, caught at design time.

## Directed Acyclic Graph vs Cyclic Graph

Most Observable pipelines are **directed acyclic graphs (DAGs)** — data flows in one direction:

```
a$ ──┐
     ├── combineLatest → map → subscribe
b$ ──┘
```

Cyclic graphs (feedback loops) require Subjects:

```typescript
// feedback loop — output feeds back into input
const action$ = new Subject<Action>();
const state$ = action$.pipe(scan(reducer, initial), shareReplay(1));

// state$ feeds back into the UI which fires action$ — a cycle
state$.subscribe(render);
// render triggers user actions → action$.next(...)
```

Subjects are the only way to introduce a cycle in an RxJS dataflow graph. This is why they should be used sparingly — cycles are harder to reason about.

## Higher-Order Operators: Nested Graphs

`switchMap`, `mergeMap`, `concatMap`, `exhaustMap` create **nested subgraphs** — each value spawns an inner Observable chain:

```
source → switchMap → inner graph 1 (cancelled when source re-emits)
                  → inner graph 2 (current)
```

The four higher-order operators differ only in their **graph management policy**: how many inner graphs can run concurrently, and what happens when a new source value arrives.

## Parallel Execution Is Free

Dataflow graphs enable parallelism without explicit coordination — nodes at the same depth can execute concurrently:

```typescript
// These two fetches run in parallel — no extra coordination needed
combineLatest([
	http.get('/api/user'),    // node A — runs independently
	http.get('/api/config'),  // node B — runs independently
]).subscribe(([user, config]) => bootstrap(user, config));
```

`forkJoin` and `merge` are the explicit parallelism operators — they model graph nodes that have multiple incoming edges.

## Related

- [Observable](Observable.md) — Observable as the universal interface
- [operators](operators.md) — All operators as dataflow nodes
- [custom-operators](custom-operators.md) — Building reusable nodes; `OperatorFunction<T,R>` as edge contract
- [observable-internals](observable-internals.md) — How the graph is wired at subscribe time (outside-in) and how values flow (inside-out)
