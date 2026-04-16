---
module: 10
lesson: "10.2"
title: Hexagonal architecture with RxJS
key_insight: Hexagonal architecture applied to RxJS puts custom domain operators at the core, RxJS as infrastructure inside them, and components as adapters. The domain never imports from the infrastructure layer — RxJS is an implementation detail.
related: ["10.1", "10.3"]
---

## Hook

Most RxJS code has `switchMap`, `combineLatest`, and `shareReplay` scattered freely across components, services, and effects. When RxJS ships a breaking change, or when you want to swap a flattening strategy after a performance review, you touch dozens of files. Hexagonal architecture is the fix — not because it is architectural theory, but because it gives you a single rule that eliminates that problem: components never import RxJS operators directly.

## Insight

Hexagonal architecture (also called Ports and Adapters) organises code into three concentric layers. Applied to reactive code, the mapping is precise.

**Core — domain operators**: Functions like `searchOnQuery`, `throttlePriceUpdates`, and `withCurrentUser`. These are pure functions that return `OperatorFunction<T, R>`. RxJS operators live inside them as implementation details. The core layer defines what the system does in domain language.

**Infrastructure — RxJS itself**: `switchMap`, `debounceTime`, `shareReplay`, `withLatestFrom`. These live only inside domain operators, never in components. The infrastructure layer defines how the domain operators are implemented.

**Adapters — components and effects**: Components import and compose domain operators from the core layer. They never import `switchMap` or any other RxJS operator directly. The adapter layer connects the core to the outside world — user events, HTTP, timers — without knowing how the core works internally.

The dependency rule is strict: adapters depend on the core; the core depends on infrastructure; infrastructure depends on nothing else. This means: (1) components are readable without RxJS knowledge; (2) you can swap the flattening strategy inside a domain operator without touching any component; (3) domain operators are testable in isolation because their dependencies are injected.

When a new developer joins the team, they can read components and understand the system in domain terms without knowing RxJS. The RxJS complexity is contained inside the core layer, which is maintained by the people who understand it.

## Example

```typescript
// search.facade.ts — CORE layer: domain operators wrapping RxJS
import { Observable } from 'rxjs';
import { switchMap, withLatestFrom, map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { ajax } from 'rxjs/ajax';

interface SearchResult { id: number; title: string; }
interface User { id: string; token: string; }

export function searchOnQuery(
	api: (q: string, token: string) => Observable<SearchResult[]>,
): OperatorFunction<string, SearchResult[]> {
	return (query$: Observable<string>) =>
		query$.pipe(
			switchMap((q: string) => api(q, '')), // RxJS detail — invisible to caller
		);
}

export function withCurrentUser(
	user$: Observable<User>,
): OperatorFunction<SearchResult[], [SearchResult[], User]> {
	return (results$: Observable<SearchResult[]>) =>
		results$.pipe(withLatestFrom(user$));
}
```

```typescript
// search.component.ts — ADAPTER layer: no RxJS imports
import { searchOnQuery, withCurrentUser } from './search.facade';
import { currentUser$ } from './auth.facade';

// No switchMap, no withLatestFrom — pure domain language
const enrichedResults$ = searchQuery$.pipe(
	searchOnQuery((q, token) => fetchResults(q, token)),
	withCurrentUser(currentUser$),
);
```

The component contains zero RxJS operator imports. Swapping `switchMap` to `exhaustMap` inside `searchOnQuery` requires changing one file and one line.

## Summary

- Core = domain operators (`searchOnQuery`, `withCurrentUser`) — RxJS lives inside, invisible to callers
- Infrastructure = RxJS operators — imported only by the core layer, never by components
- Adapters = components — import domain operators, never import RxJS operators directly
- Dependencies point inward: adapters → core → infrastructure
- Swapping RxJS implementation details touches only the core layer — components are unaffected

## Pitfall

Importing `switchMap` or `debounceTime` directly in a component "just for this one case". Every RxJS import in a component file breaks the hexagonal boundary — the component now has knowledge of the infrastructure layer. Extract even single-use RxJS logic into a named domain operator; the naming forces you to think about what the operation means in domain terms.
