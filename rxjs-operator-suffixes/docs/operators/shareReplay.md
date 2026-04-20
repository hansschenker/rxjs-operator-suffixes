---
operator: shareReplay
family: Multicasting
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `shareReplay(bufferSize?, windowTime?, scheduler?)`

> Multicasts a source Observable to multiple subscribers and replays the last `bufferSize` emissions to any new subscriber — combining multicasting with a replay buffer so late arrivals get caught up immediately.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — it does not react to *when* values arrive relative to each other; the optional `windowTime` only evicts stale buffer entries by age |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | No — all source values are forwarded to current subscribers; late subscribers get the buffered values replayed |
| **Completion required** | No — emits on every source value; works continuously on infinite streams |

**Completion behaviour** — `shareReplay` forwards every source value to all current subscribers as it arrives and also stores up to `bufferSize` values in its internal buffer for replay. When the source completes, that completion is forwarded to all current subscribers and the buffer remains intact for any future subscriber. If the source never completes, `shareReplay` works normally — the buffer just keeps the most recent N values and replays them to late subscribers.

**Lossy behaviour** — `shareReplay` is not lossy in the traditional sense: every emitted value reaches all currently-subscribed consumers, and late subscribers receive a replay of the last `bufferSize` values. The only "loss" is that values older than the buffer window are evicted — a subscriber that arrives after many emissions only sees the most recent N, not the full history.

---

#### Marble Diagram

```
source:  --a--b--c-----------d--|
         shareReplay(2)

sub1 (t=0): --a--b--c-----------d--|
sub2 (t=3):       (bc replayed)--d--|
                   ^^ buffer replay on subscribe
```

Buffer eviction with `windowTime`:
```
source:  --a--b--[300ms]--c--|
         shareReplay({ bufferSize: 2, windowTime: 200 })

sub2 subscribes at t=400:
  buffer: b was emitted at t=100 — now 300ms old — evicted (> 200ms)
  replay: only c
```

---

#### Signature

```typescript
// Shorthand overloads
shareReplay(bufferSize?: number): MonoTypeOperatorFunction<T>
shareReplay(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>

// Config object overload (RxJS 7.4+)
shareReplay<T>(config: ShareReplayConfig): MonoTypeOperatorFunction<T>

interface ShareReplayConfig {
  bufferSize?: number;
  windowTime?: number;
  refCount: boolean;       // default: false in RxJS 7 (was true in RxJS 6)
  scheduler?: SchedulerLike;
}
```

---

#### When to Use

- Cache the result of an HTTP request so all subscribers — including those that subscribe after the response arrives — receive the same data without triggering a second network call.
- Derive current application state from a stream and share it across multiple components that may render at different times.
- Share expensive computed streams (e.g. large `combineLatest` derivations) in an MVU architecture where multiple view layers subscribe independently.
- Replay the most recent config/feature-flag value to any component that subscribes after the initial fetch.
- Provide synchronous-like access to the "current value" of a stream without switching to `BehaviorSubject` — late subscribers get the last emission immediately on subscribe.

---

#### Code Example

```typescript
import { HttpClient } from '@angular/common/http'
import { shareReplay, map } from 'rxjs'
import type { Observable } from 'rxjs'

interface User {
	id: number
	name: string
}

// Service layer — one HTTP call shared across all consumers
class UserService {
	private readonly currentUser$: Observable<User>

	constructor(private http: HttpClient) {
		this.currentUser$ = this.http.get<User>('/api/me').pipe(
			shareReplay(1)
		)
	}

	getUser(): Observable<User> {
		return this.currentUser$
	}

	getDisplayName(): Observable<string> {
		return this.currentUser$.pipe(
			map((user: User): string => user.name)
		)
	}
}
```

MVU context — sharing derived state across multiple view streams:

```typescript
import { Subject, combineLatest, shareReplay, map, scan } from 'rxjs'
import type { Observable } from 'rxjs'

interface AppState {
	items: string[]
	filter: string
}

type Action =
	| { type: 'ADD_ITEM'; payload: string }
	| { type: 'SET_FILTER'; payload: string }

function reducer(state: AppState, action: Action): AppState {
	switch (action.type) {
		case 'ADD_ITEM':
			return { ...state, items: [...state.items, action.payload] }
		case 'SET_FILTER':
			return { ...state, filter: action.payload }
		default:
			return state
	}
}

const initialState: AppState = { items: [], filter: '' }
const action$ = new Subject<Action>()

// Shared state stream — computed once, replayed to every new subscriber
const state$: Observable<AppState> = action$.pipe(
	scan(reducer, initialState),
	shareReplay(1)
)

// Multiple derived streams — each subscribes to state$ independently
// shareReplay(1) ensures they all get the current state immediately
const items$: Observable<string[]> = state$.pipe(
	map((s: AppState): string[] => s.items)
)

const filteredItems$: Observable<string[]> = state$.pipe(
	map((s: AppState): string[] =>
		s.items.filter((item: string) => item.includes(s.filter))
	)
)
```

---

#### Gotchas

1. **`refCount: false` (RxJS 7 default) keeps the source alive forever** — in RxJS 7, `shareReplay(1)` uses `refCount: false` by default, meaning the source subscription is never torn down even when all subscribers unsubscribe. This is intentional for caching but causes memory/connection leaks for infinite sources like WebSockets. Use `shareReplay({ bufferSize: 1, refCount: true })` if you want automatic teardown when no subscribers remain.

2. **RxJS 6 vs RxJS 7 `refCount` default flipped** — RxJS 6 `shareReplay(1)` implicitly used `refCount: true` (source subscription torn down on zero subscribers). RxJS 7 flipped this to `refCount: false`. Upgrading without checking this is a common source of resource leaks or unexpected re-subscriptions. Always be explicit: pass the config object rather than the shorthand.

3. **`shareReplay` vs `BehaviorSubject` for mutable state** — `shareReplay(1)` replays the last emission to late subscribers but offers no `.value` synchronous accessor and no imperative `.next()`. If you need to both read the current value synchronously and push new values imperatively, `BehaviorSubject` is the right tool. `shareReplay(1)` is for turning a cold Observable into a shared, cached hot one.

4. **Placing `shareReplay` in the wrong position** — like `share()`, operators placed before `shareReplay` run once (in the shared execution); operators placed after run once per subscriber. A common mistake is placing `tap` for logging after `shareReplay` and wondering why it fires multiple times.

5. **`retry` upstream will replay error then re-execute** — if you have `retry()` before `shareReplay(1)` and an error occurs, the retry re-subscribes to the source. Any subscriber that subscribed after the error but before the retry completes will receive the replayed error from the buffer. Always verify your error-handling order when combining `shareReplay` with `retry` or `catchError`.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `share()` | No replay buffer; lossy for late subscribers; always uses refcounting | You only need multicasting with no cache — e.g. UI events where history is irrelevant |
| `BehaviorSubject` | Synchronous `.value` accessor; imperative `.next()` push; always replays 1 value | You own and drive the source imperatively and need synchronous current-value reads |
| `ReplaySubject(n)` | Imperative push with configurable replay buffer; Subject subclass | You need a hot source you push to manually with N-value replay |
| `publishReplay(n) + refCount()` | RxJS 6 equivalent; explicit `connect()` step | Migrating RxJS 6 code; need manual connect control |
| `connectable()` + `ReplaySubject` | RxJS 7 low-level equivalent with full lifecycle control | Need precise control over when the multicast starts and stops |

---

#### Decision Rule

> Use `shareReplay(1)` when you have a cold Observable (HTTP request, expensive derivation) that multiple consumers must share, and late subscribers must receive the most recent value immediately. Use `share()` instead when there is no need to replay past values and you want refcounting to tear down the source automatically.
