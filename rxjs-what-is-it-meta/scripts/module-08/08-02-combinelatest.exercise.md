---
module: 8
lesson: "8.2"
title: combineLatest
exercise: Fix a combineLatest pipeline that never emits because one source is a slow HTTP call, using startWith to unblock it.
difficulty: intermediate
---

## Scenario

A dashboard derives its display state from three sources: user profile (HTTP, slow ~2s), feature flags (HTTP, medium ~500ms), and a local clock tick (fast, every second). `combineLatest` never emits during the first two seconds because the user profile hasn't loaded yet, so the entire dashboard stays blank even though the clock and flags are ready.

## Starter Code

```typescript
import { combineLatest, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface UserProfile { name: string; plan: string; }
interface FeatureFlags { darkMode: boolean; betaSearch: boolean; }
interface DashboardState {
	user: UserProfile | null;
	flags: FeatureFlags | null;
	tick: number;
}

const user$ = ajax.getJSON<UserProfile>('/api/profile');    // slow — may take 2s
const flags$ = ajax.getJSON<FeatureFlags>('/api/flags');    // medium — ~500ms
const tick$ = interval(1000).pipe(take(60));                // fast — emits every second

// BUG: combineLatest never emits until ALL three sources have emitted at least once
const dashboard$: Observable<DashboardState> = combineLatest([
	user$,
	flags$,
	tick$,
]).pipe(
	map(([user, flags, tick]: [UserProfile, FeatureFlags, number]) => ({
		user, flags, tick,
	})),
);

dashboard$.subscribe((state: DashboardState) => renderDashboard(state));
declare function renderDashboard(state: DashboardState): void;
```

## Task

1. Explain why `combineLatest` produces no output on first render even though `tick$` emits every second.
2. Add `startWith(null)` to `user$` and `flags$` so the dashboard renders immediately with loading states.
3. Update `DashboardState` types and the `map` to handle `null` values, and add a `filter` downstream to skip rendering until at least the tick has emitted once.

## Hint

`combineLatest` requires every source to have emitted at least once before it produces output. `startWith(null)` gives each source an immediate first value, unblocking the combination.
