---
marp: true
theme: uncover
title: "The Eight Execution Phases"
---

# The Eight Execution Phases
> Intermediate developers write pipe() chains and wonder why side effects fire twice, or never — because they don't know where the boundary between blueprint and live process sits.

---

## Core Concept

- RxJS has a hard phase boundary: **Plan** (phases 1–3) and **Execution** (phases 5–8), split by `subscribe()` at phase 4
- **Plan phase** — `declare → compose → store`: zero computation, zero values, zero side effects
- **Execution phase** — `producer activates → scheduler dispatches → values flow → teardown arms`
- Each `subscribe()` creates a **fully independent execution** of all eight phases (cold by default)
- Schedulers are *declared* in the plan but only *act* in the execution phase
- > **"Nothing runs until you subscribe."**

---

## How It Works

```
── PLAN PHASE (lazy, cold, reusable) ──────────────────────────────────────
Phase 1  DECLARE    const src$ = interval(1000)
Phase 2  COMPOSE    .pipe(filter(x => x % 2 === 0), map(x => x * 10), take(5))
Phase 3  STORE      const result$ = src$  ← inert; pass, return, compose further
                                ↓
                          subscribe()   ← Phase 4: THE TRIGGER
                                ↓
── EXECUTION PHASE (live, per-subscription) ───────────────────────────────
Phase 5  PRODUCER   interval() activates its internal setInterval timer
Phase 6  SCHEDULER  asyncScheduler dispatches ticks at t=1000ms, 2000ms …
Phase 7  VALUES     0→filter✓→map→ 0 | 1→filter✗ | 2→filter✓→map→20 | …
Phase 8  TEARDOWN   take(5) completes → timer cleared → subscription closed
```

---

## Common Mistake

```typescript
// ❌ WRONG: assuming pipe() triggers execution
const user$ = fetchUser(id).pipe(
  tap(user => cache.set(id, user)), // "this caches immediately, right?"
  map(user => user.name),
);
// Nothing ran. No HTTP request. No cache write.
// user$ is still an inert blueprint at phase 3.

// The real trap — subscribe() twice = two full executions = two HTTP requests
user$.subscribe(renderUI);
user$.subscribe(logToAnalytics); // ← independent execution; fetchUser fires again
```

---

## The Right Way

```typescript
// ✅ CORRECT: know where the boundary is, then control it explicitly
const user$ = fetchUser(id).pipe(
  tap(user => cache.set(id, user)), // declared in plan, executes at phase 7 only
  map(user => user.name),           // non-lossy transform — runs once per emission
);

// shareReplay(1) collapses phases 5–8 into a single shared execution
const user$ = fetchUser(id).pipe(
  tap(user => cache.set(id, user)),
  map(user => user.name),
  shareReplay(1), // ← phases 5–8 run ONCE; latecomers get the replayed value
);

user$.subscribe(renderUI);       // triggers exactly one HTTP request
user$.subscribe(logToAnalytics); // reuses the replay — phases 5–8 not re-run
```

---

## Key Rule
> **`pipe()` is a blueprint (phases 1–3); `subscribe()` fires a full independent execution of phases 5–8 — every caller pays the full cost unless you collapse it with `shareReplay`.**