# zip vs forkJoin — positional pairing vs parallel completion

```ascii
── zip ──────────────────────────────────────────────────────
a$:       --1--------3--------5--|
b$:       -----2--4-----------|

zip([a$, b$]):
output$:  -----[1,2]--[3,4]--|
          (pairs by index: 1st with 1st, 2nd with 2nd)
          (5 never emits — b$ completed with only 2 values)

── forkJoin ──────────────────────────────────────────────────
profile$: -----------profile--|
perms$:   ----perms------------|
flags$:   ----------------flags--|

forkJoin([profile$, perms$, flags$]):
output$:  ----------------[profile, perms, flags]--|
          (emits once — when all three complete, using their final values)
```

**Read it:**
- `zip` pairs the nth emission from each source together. It will not emit until all sources have produced at least n values. If one source completes early, zip completes.
- `forkJoin` waits for all sources to complete, then emits a single array of their last values. Correct for parallel one-shot operations (page load, parallel API calls).

**Use when:**
- `zip`: pairing two streams where each value has a positional relationship — a question stream and an answer stream that should be matched by index
- `forkJoin`: waiting for multiple independent async operations to all finish before proceeding

```typescript
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

interface UserProfile { id: number; name: string; }
interface Permissions { canEdit: boolean; }
interface FeatureFlags { darkMode: boolean; }
interface PageData {
	profile: UserProfile | null;
	permissions: Permissions | null;
	flags: FeatureFlags | null;
}

const pageData$ = forkJoin({
	profile: ajax.getJSON<UserProfile>('/api/profile').pipe(
		catchError(() => of(null)),
	),
	permissions: ajax.getJSON<Permissions>('/api/permissions').pipe(
		catchError(() => of(null)),
	),
	flags: ajax.getJSON<FeatureFlags>('/api/flags').pipe(
		catchError(() => of(null)),
	),
});
```
