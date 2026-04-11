---
marp: true
theme: uncover
title: "Hot vs Cold: precise definition, not intuition"
---

# Hot vs Cold: precise definition, not intuition
> The folk definition — "hot means always running" — breaks down the moment you encounter multicasting, `shareReplay`, or `defer`, leaving you guessing instead of reasoning.

---

## Core Concept
- **Cold** — *may* cause subscription side effects; a new execution is created per subscriber
- **Hot** — does *not* cause subscription side effects; subscribing only registers the observer
- **Subscription side effects** = anything beyond registering an observer: HTTP calls, timers, memory allocation, computation, mutations
- The intuitive model ("cold starts fresh, hot is always-on") is a *consequence* of this definition, not the definition itself
- > **"hot = does not cause subscription side effects. cold = may cause subscription side effects. Everything else follows from this."** — Dave Sexton

---

## How It Works

```typescript
import { interval, fromEvent } from 'rxjs';
import { share } from 'rxjs/operators';

// COLD — side effect: a fresh timer starts for each subscriber
const cold$ = interval(1000);
cold$.subscribe(v => console.log('A:', v)); // timer 1: 0, 1, 2…
cold$.subscribe(v => console.log('B:', v)); // timer 2: 0, 1, 2… (independent)

// HOT — no side effect: subscribing only appends a listener to an existing source
const clicks$ = fromEvent(document, 'click');
clicks$.subscribe(() => console.log('A clicked')); // listener registered
clicks$.subscribe(() => console.log('B clicked')); // same click event, both fire

// COLD → HOT: share() converts subscription side effects to connection side effects
const shared$ = cold$.pipe(share()); // one timer, N subscribers
shared$.subscribe(v => console.log('A:', v)); // 0, 1, 2… (shared)
shared$.subscribe(v => console.log('B:', v)); // same values, no extra timer
```

---

## Common Mistake

```typescript
import { ajax } from 'rxjs/ajax';
import { combineLatest } from 'rxjs';

// ajax.getJSON is COLD — it issues an HTTP request per subscription
const data$ = ajax.getJSON<User[]>('/api/users');

// ✗ WRONG: referencing the same cold Observable twice in a query
// combineLatest subscribes to each argument independently —
// this fires TWO separate HTTP requests for identical data
combineLatest([data$, data$]).subscribe(([a, b]) => {
  // a and b look the same but came from two round-trips
  processUsers(a, b);
});

// The bug is silent: no error, just wasted network calls and
// potential race conditions if the API returns different results
```

---

## The Right Way

```typescript
import { ajax } from 'rxjs/ajax';
import { combineLatest } from 'rxjs';
import { shareReplay, retry } from 'rxjs/operators';

// ✓ Share before composing — one HTTP request, result cached for late subscribers
const data$ = ajax.getJSON<User[]>('/api/users').pipe(
  shareReplay(1), // hot: multicasts the response; replays 1 value to late joiners
);

combineLatest([data$, data$]).subscribe(([a, b]) => {
  processUsers(a, b); // same object reference — one request
});

// ✓ Leave cold intentionally when re-execution is desired
// retry() needs a fresh subscription side effect to re-issue the request
const resilient$ = ajax.getJSON<User[]>('/api/users').pipe(
  retry({ count: 3 }), // cold required: each retry re-subscribes, re-fetches
);
```

---

## Key Rule
> **An Observable is cold if subscribing triggers side effects beyond observer registration, and hot if it does not — apply `shareReplay(1)` the moment you need to share a cold source across multiple consumers.**