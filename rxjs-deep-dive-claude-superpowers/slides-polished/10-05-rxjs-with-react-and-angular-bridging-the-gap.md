---
marp: true
theme: uncover
title: "RxJS with React and Angular: bridging the gap"
---

# RxJS with React and Angular: bridging the gap
> Components have a lifecycle — raw Observable subscriptions don't, so they outlive their host and corrupt or leak state

---

## Core Concept

- React and Angular have opposite reactivity models: React pulls state via hooks; Angular pushes via change detection — neither natively tracks Observable subscriptions
- An unmanaged subscription continues emitting into an unmounted React component or a destroyed Angular component
- The bridge problem: convert a stream into component-friendly state **and** cancel it when the component dies
- Angular ships two built-in bridges: `AsyncPipe` (template) and `takeUntilDestroyed()` (class body)
- React has no built-in bridge — the canonical solution is a `useObservable` hook backed by `useEffect` cleanup
- **Rule: every subscription must be bound to a lifecycle boundary**

---

## How It Works

```typescript
// ── REACT BRIDGE ──────────────────────────────────────────────────
// useEffect cleanup = automatic unsubscribe on unmount
function useObservable<T>(source$: Observable<T>, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const sub = source$.subscribe(setValue); // subscribe on mount
    return () => sub.unsubscribe();          // ← teardown on unmount
  }, [source$]);
  return value;
}

// ── ANGULAR BRIDGE A: AsyncPipe ────────────────────────────────────
// template: <li *ngFor="let r of results$ | async">{{ r.name }}</li>
// AsyncPipe subscribes on init, unsubscribes on destroy — zero boilerplate

// ── ANGULAR BRIDGE B: takeUntilDestroyed() ─────────────────────────
export class SearchComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.query$.pipe(
      switchMap(q => this.api.search(q)),
      takeUntilDestroyed(this.destroyRef) // completes stream on destroy
    ).subscribe(results => (this.results = results));
  }
}
```

---

## Common Mistake

```typescript
// ── REACT: subscribe without cleanup ──────────────────────────────
useEffect(() => {
  // BUG: no return value — subscription is never cancelled
  // After unmount, setValue() still fires → React warns about
  // "state update on unmounted component" and leaks memory
  search$.subscribe(results => setResults(results));
}, []);

// ── ANGULAR: subscribe in ngOnInit without unsubscribing ──────────
ngOnInit(): void {
  // BUG: this subscription lives for the entire app session,
  // not just the component lifetime — HTTP calls stack up,
  // and closed-over component state is never released
  this.data$.subscribe(data => (this.data = data));
}
```

---

## The Right Way

```typescript
// ── REACT: useObservable hook ──────────────────────────────────────
function SearchResults({ query$ }: { query$: Observable<string> }) {
  const results = useObservable(
    query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => searchApi(q))   // cancelled on each new keystroke
    ),
    []
  );
  return <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}

// ── ANGULAR: keep streams in the template layer via AsyncPipe ──────
@Component({
  template: `<li *ngFor="let r of results$ | async">{{ r.name }}</li>`
})
export class SearchComponent {
  // declare the stream — AsyncPipe owns the subscription lifecycle
  readonly results$: Observable<Result[]> = this.query$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => this.api.search(q)), // switchMap cancels in-flight requests
    shareReplay(1)                      // share across multiple async bindings
  );
  constructor(
    private query$: Observable<string>,
    private api: SearchService
  ) {}
}
```

---

## Key Rule

> **Never call `.subscribe()` in a component body without a paired teardown — use React's `useEffect` return or Angular's `AsyncPipe`/`takeUntilDestroyed()`, or you are writing a timed memory bomb.**