---
marp: true
theme: uncover
title: "Memory leaks: takeUntil, take(1), async pipe equivalents"
---

# Memory leaks: takeUntil, take(1), async pipe equivalents
> Every `subscribe()` call you forget to clean up keeps running — silently consuming memory and firing callbacks into components that no longer exist.

---

## Core Concept
- Every `subscribe()` returns a **Subscription** handle; the Observable runs until that handle is explicitly closed
- Streams like `interval`, `fromEvent`, and retried HTTP chains **never self-complete** — the framework will not clean them up for you
- **"Not unsubscribing from long-lived Observables is the #1 source of memory leaks in RxJS"**
- Repeated navigation without teardown stacks fresh subscriptions on every visit — the same callback fires multiple times per emission
- Three declarative exit strategies exist: `takeUntil` (lifecycle-scoped), `take(n)` (one-shot), `async` pipe (framework-owned)

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

async pipe — Angular subscribes on init, unsubscribes on destroy:
template: {{ data$ | async }}
           ↑ zero manual subscribe/unsubscribe in the component class
```

---

## Common Mistake

```typescript
// ❌ WRONG: naked subscribe with no teardown
@Component({ selector: 'app-search', template: '...' })
export class SearchComponent implements OnInit {
  results: Result[] = [];

  ngOnInit() {
    // Subscription never closes — survives component destruction.
    // Each navigation creates another subscription on the same stream.
    // Stale callbacks write into a dead component on every emission. 🚨
    this.searchService.results$.subscribe(r => {
      this.results = r;
    });
  }
}
```

---

## The Right Way

```typescript
// ✅ Option 1 — takeUntil for any long-lived stream
@Component({ selector: 'app-search', template: '...' })
export class SearchComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>(); // one per component
  results: Result[] = [];

  ngOnInit() {
    this.searchService.results$.pipe(
      takeUntil(this.destroy$)  // unsubscribes the moment destroy$ emits
    ).subscribe(r => { this.results = r; });
  }

  ngOnDestroy() {
    this.destroy$.next();      // signal every takeUntil on this component
    this.destroy$.complete();  // release the Subject itself
  }
}

// ✅ Option 2 — take(1) for one-shot initialisation reads
this.user$.pipe(take(1)).subscribe(u => this.initForm(u));

// ✅ Option 3 — async pipe; the framework owns the full lifecycle
// <li *ngFor="let r of results$ | async">{{ r.name }}</li>
```

---

## Key Rule
> **Every subscription that can outlive its creator must have an explicit teardown — use `takeUntil` for lifecycle-scoped streams, `take(1)` for one-shots, and `async` pipe whenever the framework can own the subscription.**