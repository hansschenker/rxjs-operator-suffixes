# share vs shareReplay — what does a late subscriber see?

```ascii
source$: --1--2--3--4--5--|

── share() ───────────────────────────────────────────────────
sub1 (t=0):   --1--2--3--4--5--|
sub2 (t=2.5): ------3--4--5--|
sub3 (t=6):   (subscribes after completion — gets nothing, source re-executed)

── shareReplay(1) ────────────────────────────────────────────
sub1 (t=0):   --1--2--3--4--5--|
sub2 (t=2.5): ----[3]--4--5--|   ([3] = replayed immediately on subscribe)
sub3 (t=6):   (subscribes after completion — gets [5] replayed immediately)
```

**Read it:**
- `share()`: no buffer. Late subscribers only see values emitted after they subscribe. After the source completes, a new subscriber triggers a new source execution (reference count drops to zero on complete).
- `shareReplay(1)`: buffers the last 1 value. A late subscriber receives that buffered value immediately on subscription, even after the source has completed. With `refCount: false` (the default), the source stays alive indefinitely — a potential memory leak.

**Use when:**
- `share()`: when late subscribers can afford to miss past values and you want the source to re-run when all subscribers disconnect
- `shareReplay({ bufferSize: 1, refCount: true })`: when late subscribers must receive the most recent value (user profile, config, auth state)

```typescript
import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

interface UserProfile { id: number; name: string; role: string; }

// HTTP request made once; all subscribers get the same response;
// late subscribers get the cached value immediately
const profile$ = ajax.getJSON<UserProfile>('/api/me').pipe(
	shareReplay({ bufferSize: 1, refCount: true }),
);
```
