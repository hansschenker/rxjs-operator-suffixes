---
operator: combineLatestWith
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `combineLatestWith<T, A>(...otherSources): OperatorFunction<T, [T, ...A]>`

> The pipeable form of `combineLatest`: combines the source Observable with one or more other sources, emitting a tuple of the latest value from each whenever any source emits — after all sources have emitted at least once.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — reacts to *which* source emits, not *when* |
| **Value-sensitive** | No — emits regardless of value content |
| **Lossy** | No — same slot-overwrite semantics as `combineLatest` |
| **Completion required** | No — emits continuously; completes when all sources complete |

**Completion behaviour** — Identical to `combineLatest`: no source needs to complete before emissions begin. Each source completing freezes its slot at the last value; the combined Observable only completes once every source has completed. An infinite source (e.g. `interval`) will keep the combined stream alive indefinitely.

**Lossy behaviour** — Not lossy in the traditional sense. Rapid successive emissions from the same source overwrite its slot — you never see every intermediate combination — but this is the intended "current snapshot" behaviour, not data loss.

---

#### Marble Diagram

```
source$: --A-----------C---E--|
other$:  ------1---2------3--|
         combineLatestWith(other$)
output:  ------[A,1]-[A,2]-[C,2]-[C,3]-[E,3]--|
```

The first emission `[A,1]` waits until both streams have emitted at least once.

---

#### Signature

```typescript
// RxJS 7+
combineLatestWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, Readonly<[T, ...A]>>
```

The return type is a **readonly tuple** — positionally typed. The source Observable's type occupies index `0`; each additional source occupies subsequent positions.

---

#### When to Use

- Inside an existing `pipe()` chain where you need to combine the current stream with one or more other streams without breaking the pipeline.
- Keeping derived-state logic co-located with the stream that drives it rather than hoisting everything into a top-level `combineLatest([...])` call.
- Combining a user-action stream with current application state inside an effect pipeline.
- Anywhere you'd use `combineLatest` but already have a source Observable in hand and want to stay in operator composition style.

---

#### Code Example

```typescript
import { fromEvent, BehaviorSubject } from 'rxjs'
import { combineLatestWith, map, distinctUntilChanged } from 'rxjs/operators'

interface AppState { theme: 'light' | 'dark'; locale: string }

const state$ = new BehaviorSubject<AppState>({ theme: 'light', locale: 'en' })
const windowResize$ = fromEvent<UIEvent>(window, 'resize')

// Stays in pipe() — no need to lift out to a top-level combineLatest
const layout$ = windowResize$.pipe(
	combineLatestWith(state$),
	map(([event, state]: [UIEvent, AppState]) => ({
		width: (event.target as Window).innerWidth,
		theme: state.theme,
		locale: state.locale,
	})),
	distinctUntilChanged(
		(a, b) => a.width === b.width && a.theme === b.theme && a.locale === b.locale
	)
)

layout$.subscribe(layout => render(layout))
```

MVU context — combining an actions stream with a state slice inside an effect:

```typescript
import { Subject } from 'rxjs'
import { filter, combineLatestWith, exhaustMap, map } from 'rxjs/operators'

const actions$ = new Subject<Action>()
const currentUser$ = new BehaviorSubject<User | null>(null)

const saveProfileEffect$ = actions$.pipe(
	filter((a): a is SaveProfileAction => a.type === 'SAVE_PROFILE'),
	combineLatestWith(currentUser$),
	// combineLatestWith re-emits on every currentUser$ change too —
	// use withLatestFrom here if that behaviour is unwanted
	exhaustMap(([action, user]: [SaveProfileAction, User | null]) =>
		user ? saveProfile(user.id, action.payload) : EMPTY
	),
	map(() => ({ type: 'SAVE_PROFILE_SUCCESS' } as const))
)
```

---

#### Gotchas

1. **Re-emits on every source change, including non-trigger sources** — Unlike `withLatestFrom`, `combineLatestWith` fires whenever *any* of its sources emits. If `currentUser$` above emits mid-effect, a duplicate pipeline run starts. Use `withLatestFrom` when you have a clear primary trigger and want to only *read* the other streams.

2. **Tuple type is readonly** — The emitted `[T, ...A]` is `Readonly<[T, ...A]>`. Destructuring works fine, but passing it to a function expecting a mutable tuple requires casting. This is a RxJS 7 type-safety improvement — don't fight it.

3. **Added in RxJS 7 — not available in RxJS 6** — Projects still on RxJS 6 must use the static `combineLatest([source$, other$])` form and then `.pipe(map(...))`. Check your version before reaching for this.

4. **Same startup-stall gotcha as `combineLatest`** — If any combined source never emits (e.g. a cold HTTP Observable that errors), the combined stream produces nothing. Use `startWith` on optional sources.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `combineLatest` | Static creation form — takes an array of sources | You're composing sources at the top level, not inside a `pipe()` chain |
| `withLatestFrom` | Only emits when the **primary** source emits; others are sampled | You have a clear trigger stream and want to read state from others |
| `combineLatestAll` | Flattens a higher-order Observable of sources | The number of sources is dynamic / not known at composition time |
| `zip` | Pairs emissions positionally | Strict 1:1 synchronisation between sources is required |

---

#### Decision Rule

> Use `combineLatestWith` when you're already inside a `pipe()` chain and need to merge in additional streams reactively. Prefer `withLatestFrom` when only one stream should trigger emissions and the rest are state to be sampled.
