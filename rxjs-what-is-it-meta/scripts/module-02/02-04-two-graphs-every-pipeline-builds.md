---
module: 2
lesson: "2.4"
title: Two graphs every pipeline builds
key_insight: Every RxJS pipeline silently builds two graphs — a static dependency graph describing how values flow, and a dynamic subscription graph describing who tears down whom. Most memory leaks come from losing track of the second.
related: ["2.3", "9.4"]
---

## Hook

You can read an RxJS pipeline and understand exactly what it transforms. You cannot read it and immediately see what it cleans up when you call `unsubscribe()`. The cleanup graph is invisible — until it leaks. Every `.pipe()` call you write builds two distinct graphs simultaneously, and only one of them is visible in your source code.

## Insight

**Dependency graph**: built when you call `pipe()`. This graph describes data transformation — how values travel from source through each operator to the subscriber. It is a static structure that exists architecturally in your code. Zero subscriptions can be active and the dependency graph still exists, describing the shape of the dataflow. Each operator is a node; edges represent value flow. `pipe(map(f), filter(p), switchMap(g))` is a three-node directed graph. You can read this graph directly from your code.

**Subscription graph**: built at runtime when `subscribe()` is called. This graph describes lifecycle ownership — which Subscription owns which child Subscriptions and is responsible for tearing them down. It is dynamic: operators like `mergeMap` add new child Subscriptions to the tree every time an inner Observable is created. Calling `unsubscribe()` on the root node walks the entire tree and tears down every node in reverse order.

Leaks occur when a node enters the subscription graph but the root is never unsubscribed. Two common patterns: forgetting to call `unsubscribe()` on a long-lived component, and using `shareReplay` without `refCount: true` — which creates a subscription graph node permanently connected to the source with no root that can reach it to tear it down.

The mental model: `pipe()` wires the dependency graph. `subscribe()` plugs in the battery and builds the subscription graph. `unsubscribe()` pulls the plug and stops the electricity from reaching every node in the tree.

## Example

`mergeMap` makes the subscription graph dynamic — it adds a new child node for each inner Observable it creates. The diagram below shows the graph for a simple mergeMap pipeline.

```
Dependency Graph (static — built by pipe()):

source$ ──► mergeMap(x => inner$(x)) ──► subscriber

Subscription Graph (dynamic — built by subscribe()):

root subscription
├── source$ subscription        (teardown: stop source)
└── mergeMap operator node
    ├── inner$(value1) subscription  (teardown: cancel request 1)
    └── inner$(value2) subscription  (teardown: cancel request 2)

Calling root.unsubscribe() tears down the entire tree.
```

In code, the subscription graph is invisible but real:

```typescript
import { fromEvent, mergeMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

interface SearchResult {
	items: string[];
}

const input = document.querySelector<HTMLInputElement>('#search')!;

// pipe() builds the dependency graph
const search$ = fromEvent<InputEvent>(input, 'input').pipe(
	mergeMap((event: InputEvent) => {
		const term = (event.target as HTMLInputElement).value;
		// Each mergeMap emission adds a new node to the subscription graph
		return ajax.getJSON<SearchResult>(`/api/search?q=${term}`);
	}),
);

// subscribe() builds the subscription graph and returns the root
const sub = search$.subscribe({
	next: (result: SearchResult) => console.log(result.items),
});

// unsubscribe() walks and tears down the entire subscription graph
sub.unsubscribe();
```

## Summary

- `pipe()` builds the dependency graph (static, describes data transformation, readable from source)
- `subscribe()` builds the subscription graph (dynamic, describes lifecycle ownership, invisible without tooling)
- Memory leaks are subscription graph nodes that are never reached by a call to `unsubscribe()` — always hold a reference to the root and call it when the consumer is destroyed
