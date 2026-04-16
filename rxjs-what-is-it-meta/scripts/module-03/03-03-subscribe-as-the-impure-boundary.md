---
module: 3
lesson: "3.3"
title: subscribe() as the single impure boundary
key_insight: subscribe() is not an RxJS feature — it is the exit from functional programming into the real world. Keeping it at the outer edge of your application is the entire discipline of reactive architecture.
---

## Hook

In Haskell, `main()` is the single impure action that executes an otherwise pure program. In RxJS, `subscribe()` plays exactly the same role. Most RxJS codebases have dozens of `subscribe()` calls scattered inside services, components, and utility functions — and each one is a `main()` that should not exist.

## Insight

There is a clean boundary between two worlds in RxJS. Inside `pipe()`: pure, referentially transparent, free of side effects. Code here is a description of what should happen — a program written as data. At `subscribe()`: the description executes. DOM mutations fire, HTTP requests go out, state changes propagate, console output appears. The inside of the pipe is the pure zone; `subscribe()` is the impure edge.

The architectural implication is direct: the further you push `subscribe()` toward the outer boundary of your application, the more business logic lives in the pure zone and the more of it is trivially testable without mocking frameworks or async utilities. You test pipelines, not subscriptions.

Framework effect systems exist precisely to enforce this boundary. NgRx Effects, Redux-Observable, and Akita's effect system all share the same premise: your application logic never calls `subscribe()` directly. The framework does it once, at a single managed boundary. Every effect you register is a pure pipeline from action-in to action-out; the framework applies the single `subscribe()` that activates it. The result is that all business logic is pure and all impure execution is handled by infrastructure — which is exactly what a well-designed reactive architecture looks like.

## Example

The "before" pattern is common and fragile: three `subscribe()` calls inside a component create three lifecycle concerns and three potential memory leak sites. The "after" pattern composes the same three pipelines into one, with a single `subscribe()` at the component boundary.

```typescript
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Before: 3 subscribe() calls — 3 leak sites, 3 lifecycle hooks to manage
user$.subscribe((user: User) => this.renderUser(user));
prefs$.subscribe((prefs: Prefs) => this.applyPrefs(prefs));
notifications$.subscribe((n: Notification[]) => this.showBadge(n));

// After: 1 subscribe() — 1 lifecycle concern, 1 cleanup
const destroy$ = new Subject<void>();

combineLatest([user$, prefs$, notifications$]).pipe(
	takeUntil(destroy$),
).subscribe(([user, prefs, notifications]: [User, Prefs, Notification[]]) => {
	this.renderUser(user);
	this.applyPrefs(prefs);
	this.showBadge(notifications);
});
```

The number of leak risk sites drops from three to one. The entire pipeline is now a single description that can be reasoned about as a unit.

## Summary

- Every `subscribe()` is an impure boundary — and a potential memory leak site
- Push `subscribe()` to the outermost edge; keep business logic inside pure pipelines
- Effect systems (NgRx Effects, Redux-Observable) manage the single `subscribe()` boundary so application code never has to
