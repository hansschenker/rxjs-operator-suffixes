---
marp: true
theme: uncover
title: "The router as a shared hot stream"
---

# The router as a shared hot stream
> Every component subscribes to route params separately — without multicasting, each subscription re-runs navigation logic and late-mounting components miss the current route entirely.

---

## Core Concept

- A router fires navigation events **independently of subscribers** — it is already hot by definition
- > **"Hot = does not cause subscription side effects; subscribing just registers an observer."**
- Multiple consumers (breadcrumb, data-fetch effect, auth guard) must share **one** route execution
- `shareReplay(1)` = hot multicast **plus** a one-value replay buffer — late subscribers get the current route without triggering a new navigation
- Without sharing, a cold-wrapped route source runs once **per subscriber**, not per navigation — duplicate HTTP requests, duplicate guard evaluations

---

## How It Works

```
NavigationEnd source (hot — fires regardless of active subscribers)
  │
  ▼
route$ = router.events.pipe(filter, map, shareReplay(1))
         ┌──────────────────────────────────────────┐
         │         One shared execution             │
         └────────┬────────────────┬────────────────┘
                  ▼                ▼
           breadcrumb$        pageData$
           (subscribes now)   (subscribes 200 ms later)
                                   │
                                   └─ replays /dashboard immediately
                                      from the 1-value buffer
```

```
source:      ──/home──────/dashboard──────/settings──▶
shareReplay: ──/home──────/dashboard──────/settings──▶
late sub:                      └─/dashboard──/settings──▶
                                 ↑ replayed from buffer
```

---

## Common Mistake

```typescript
// ✗ WRONG — factory returns a new cold Observable on every call
function getPageData$(router: Router): Observable<PageData> {
	return router.events.pipe(
		filter((e): e is NavigationEnd => e instanceof NavigationEnd),
		switchMap(e => fetchPageData(e.url)), // HTTP call fires once per subscriber!
	);
}

// Component A
getPageData$(router).subscribe(data => renderHeader(data));

// Component B — triggers a SECOND fetchPageData for every NavigationEnd
getPageData$(router).subscribe(data => renderSidebar(data));

// Why it fails: each call creates an independent subscription to router.events.
// Two subscribers = two parallel HTTP requests per navigation, not one.
```

---

## The Right Way

```typescript
import { filter, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';

// Build once at the app root — shared across every consumer
const route$ = router.events.pipe(
	filter((e): e is NavigationEnd => e instanceof NavigationEnd),
	map(e => e.urlAfterRedirects),
	shareReplay(1), // ← one shared execution; buffer=1 replays current URL to late subscribers
);

// All consumers reference the same hot stream — zero duplicate side effects
const breadcrumb$ = route$.pipe(map(url => buildBreadcrumb(url)));

const pageData$: Observable<PageData> = route$.pipe(
	switchMap(url => fetchPageData(url)), // one HTTP call per navigation, regardless of subscriber count
);

// Component mounted after first navigation — gets /dashboard instantly from buffer
route$.pipe(take(1)).subscribe(url => console.log('current route:', url));
```

---

## Key Rule
> **A router stream is already hot — wrap it in `shareReplay(1)` once at the app root so every consumer shares one navigation execution and late subscribers replay the current route without triggering a new side effect.**