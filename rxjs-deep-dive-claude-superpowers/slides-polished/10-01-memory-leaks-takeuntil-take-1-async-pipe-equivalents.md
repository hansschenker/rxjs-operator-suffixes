---
marp: true
theme: uncover
title: "Memory leaks: takeUntil, take(1), async pipe equivalents"
---

# Memory leaks: takeUntil, take(1), async pipe equivalents
> Every `subscribe()` call you forget to clean up keeps running — silently consuming memory and firing callbacks into objects that no longer exist.

---

## Core Concept
- Every `subscribe()` returns a **Subscription** handle; the Observable runs until that handle is explicitly closed
- Streams like `interval`, `fromEvent`, and retried HTTP chains **never self-complete** — nothing cleans them up for you
- **"Not unsubscribing from long-lived Observables is the #1 source of memory leaks in RxJS"**
- Repeated construction without teardown stacks fresh subscriptions — the same callback fires multiple times per emission
- Three declarative exit strategies: `takeUntil` (lifecycle-scoped), `take(n)` (one-shot), `Subscription.unsubscribe()` (imperative escape hatch)

---

## How It Works

```
takeUntil(destroy$) — stream ends when the lifecycle signal fires:
source$:  --1--2--3--4--5--...
destroy$: ----------------x
output:   --1--2--3--4--5--|

take(1) — auto-completes after the first value, no signal needed:
source$:  --1--2--3--...
output:   --1|

Subscription store — collect handles, bulk-unsubscribe on teardown:
const subs = new Subscription();
subs.add(a$.subscribe(...));
subs.add(b$.subscribe(...));
subs.unsubscribe(); // closes all at once
```

---

## Common Mistake

```typescript
// ❌ WRONG: naked subscribe with no teardown in a plain TS component
class SearchWidget {
  private results: Result[] = [];

  init() {
    // Subscription never closes — survives widget removal from DOM.
    // Each time the widget is re-created, another subscription stacks up.
    // Stale callbacks mutate a dead object on every emission. 🚨
    searchService.results$.subscribe(r => {
      this.results = r;
      this.render();
    });
  }
}
```

---

## The Right Way

```typescript
class SearchWidget {
  private readonly destroy$ = new Subject<void>();
  private results: Result[] = [];

  init() {
    // ✅ takeUntil — any long-lived stream scoped to this widget's lifetime
    searchService.results$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(r => { this.results = r; this.render(); });

    // ✅ take(1) — one-shot read; completes automatically, no signal needed
    userService.profile$.pipe(take(1))
      .subscribe(profile => this.setTitle(profile.name));
  }

  destroy() {
    this.destroy$.next();     // signal every takeUntil subscribed on this widget
    this.destroy$.complete(); // release the Subject itself
  }
}
```

---

## Key Rule
> **Every subscription that can outlive its creator must have an explicit teardown — use `takeUntil(destroy$)` for lifecycle-scoped streams and `take(1)` for one-shot reads; call `destroy$.next()` in your cleanup hook.**
