---
module: 8
lesson: "8.4"
title: zip and forkJoin
exercise: Replace a fragile forkJoin with individual catchError handlers so one failed API call doesn't prevent the others from completing.
difficulty: intermediate
---

## Scenario

A page initialisation loads user profile, permissions, and feature flags in parallel using `forkJoin`. When the permissions endpoint is temporarily down, the entire page fails to load — even though user profile and flags loaded successfully. The fix is to let each source handle its own errors independently.

## Starter Code

```typescript
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface UserProfile { id: number; name: string; }
interface Permissions { canEdit: boolean; canDelete: boolean; }
interface FeatureFlags { darkMode: boolean; }
interface PageData {
	profile: UserProfile;      // BUG: does not handle degraded mode
	permissions: Permissions;  // BUG: does not handle degraded mode
	flags: FeatureFlags;       // BUG: does not handle degraded mode
}

// BUG: one failed source kills the entire forkJoin
const pageData$ = forkJoin({
	profile: ajax.getJSON<UserProfile>('/api/profile'),
	permissions: ajax.getJSON<Permissions>('/api/permissions'),  // may fail
	flags: ajax.getJSON<FeatureFlags>('/api/flags'),
}).pipe(
	map(({ profile, permissions, flags }) => ({ profile, permissions, flags })),
);

pageData$.subscribe({
	next: (data: PageData) => renderPage(data),
	error: (err: unknown) => console.error('Page load failed:', err),
});
declare function renderPage(data: PageData): void;
```

## Task

1. Add individual `catchError(() => of(null))` handlers to each of the three `ajax.getJSON` calls so a failed source returns `null` instead of propagating an error.
2. Update `PageData` types so each field accepts `null` as a valid value.
3. Add a `tap` after the `map` that logs which fields are `null` so engineers can monitor degraded-mode page loads.

## Hint

`forkJoin` errors if any source errors — unless each source handles its own error first. Wrap each source independently so one failure degrades gracefully instead of taking down the whole combination.
