# cold vs hot — two subscriptions, one producer or two?

```ascii
── cold Observable ───────────────────────────────────────────
const cold$ = interval(100);

sub1 (subscribes at t=0):  --0--1--2--3--4--...
sub2 (subscribes at t=150): --------0--1--2--...
                            (independent producer; starts from 0)

── hot Observable ────────────────────────────────────────────
const hot$ = cold$.pipe(share());

sub1 (subscribes at t=0):  --0--1--2--3--4--...
sub2 (subscribes at t=150): --------2--3--4--...
                            (shared producer; sub2 misses 0 and 1)
```

**Read it:**
- **Cold**: each subscriber gets its own independent producer. The producer starts fresh for each subscription. `interval` starts from 0 for sub1 and 0 again for sub2. Two subscriptions = two independent clocks.
- **Hot**: a single shared producer is multicast to all subscribers. Sub2 subscribes after the producer has already emitted 0 and 1 — it never sees those values. Late subscribers miss past emissions.

**Use when:**
- Cold: the default. Each subscription is isolated — HTTP requests, timers, computed sequences.
- Hot: multiple consumers need the same stream — `share()` for reference counting, `shareReplay(1)` to also replay the last value to late subscribers.

```typescript
import { interval } from 'rxjs';
import { share, shareReplay } from 'rxjs/operators';

// Cold — each subscriber gets its own interval
const cold$ = interval(100);

// Hot — one interval, shared across all subscribers
const hot$ = cold$.pipe(share());

// Hot with replay — late subscribers get the last emitted value immediately
const hotWithReplay$ = cold$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
```
