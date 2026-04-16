# merge vs concat vs race — three timing strategies

```ascii
── merge ─────────────────────────────────────────────────────
a$:      --1--2-----3--|
b$:      ----A--B------|

merge([a$, b$]):
output$: --1-A2-B---3--|
         (all sources subscribed immediately, output interleaves)

── concat ────────────────────────────────────────────────────
a$:      --1--2--|
b$:      -------A--B--|

concat([a$, b$]):
output$: --1--2--A--B--|
         (b$ not subscribed until a$ completes)

── race ──────────────────────────────────────────────────────
fast$:   --F--|
slow$:   -----S--S--|

race([fast$, slow$]):
output$: --F--|
         (fast$ wins; slow$ is unsubscribed immediately)
```

**Read it:**
- `merge`: subscribes to all sources immediately, forwards every emission as it arrives. No waiting, no ordering.
- `concat`: subscribes to sources one at a time, in order. The second source only starts after the first completes. Every value from every source is delivered.
- `race`: subscribes to all sources simultaneously, but as soon as the first source emits, all others are unsubscribed. Winner takes all.

**Use when:**
- `merge`: independent streams that should all be active simultaneously (multiple event sources, parallel side effects)
- `concat`: sequences that must run in order (loading screens, step-by-step initialisation)
- `race`: cache-or-network fallback pattern — race the cache against the network, whichever responds first wins

```typescript
import { race, of, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface Data { source: string; value: unknown; }

declare function getCached(): import('rxjs').Observable<Data | null>;

// Cache-or-network: whichever responds first wins
const data$ = race([
	getCached().pipe(
		switchMap((cached: Data | null) =>
			cached ? of(cached) : new Promise<never>(() => {}),
		),
	),
	ajax.getJSON<Data>('/api/data'),
]);
```
