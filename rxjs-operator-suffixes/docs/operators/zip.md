---
operator: zip
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `zip<T>(...sources: ObservableInput<T>[])`

> Combines multiple Observables by pairing their emissions **positionally** — the nth emission from each source is combined into a tuple emitted as the nth output value; it waits for all sources to have emitted their nth value before emitting.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — pairing is positional (by index), not by when values arrive |
| **Value-sensitive** | No — does not inspect value content; all values are forwarded as-is into tuples |
| **Lossy** | No — every value from every source is paired and emitted; nothing is dropped |
| **Completion required** | No — emits on each positional match; completes as soon as the shortest source completes |

**Completion behaviour** — `zip` buffers emissions from faster sources, waiting until all sources have emitted their nth value before emitting the nth tuple. The output completes as soon as **any** source completes — the remaining buffered values from longer sources are discarded at that point. If all sources are infinite, `zip` runs indefinitely.

**Lossy behaviour** — `zip` is not lossy during operation: every nth emission from every source is used exactly once. However, when the shortest source completes, any buffered surplus values from other sources are discarded. This "end-of-stream" discard is by design, not a bug.

---

#### Marble Diagram

```
source1: --a---------b---------c--|
source2: ------1--2-----3---------|
         zip(source1$, source2$)
output:  ------[a,1]--[b,2]--[b... wait for c...
                              [c,3]--|
```

More concise view:
```
source1: -a----b----c----|
source2: --1--2--3-------|
         zip()
output:  --[a,1]-[b,2]-[c,3]-|
```

Completes when the shorter source completes:
```
source1: -a--b--c--|
source2: -1--2--3--4--5--|
         zip()
output:  -[a,1]-[b,2]-[c,3]-|   (source2 values 4,5 discarded)
```

---

#### Signature

```typescript
// Static creation function
zip<A extends readonly unknown[]>(
	...sources: [...ObservableInputTuple<A>]
): Observable<A>

// With result selector (project function)
zip<A extends readonly unknown[], R>(
	...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]
): Observable<R>
```

**RxJS 7 note:** in RxJS 6, `zip` accepted a `resultSelector` as a final argument. In RxJS 7 this still works but the preferred pattern is to pipe a `map` after `zip` instead.

---

#### When to Use

- Pair requests and responses that are guaranteed to arrive in matching order (e.g. a stream of file names and a stream of their contents).
- Combine two streams of equal length where positional correspondence is meaningful (e.g. pairing questions with answers).
- Animate two parallel sequences step by step, advancing both only when both have produced their next frame.
- Test scenarios: pair expected values with actual values emitted by a stream under test.

---

#### Code Example

```typescript
import { zip, of, interval } from 'rxjs'
import { map, take } from 'rxjs/operators'

interface LabelledTick {
	index: number
	label: string
}

const labels$ = of('alpha', 'beta', 'gamma', 'delta')
const ticks$ = interval(1000)

// Pair each label with the corresponding tick index
const labelled$ = zip(labels$, ticks$).pipe(
	map(([label, index]: [string, number]): LabelledTick => ({ label, index }))
)

labelled$.subscribe((item: LabelledTick) => {
	console.log(`${item.index}: ${item.label}`)
})
// 0: alpha  (after 1s)
// 1: beta   (after 2s)
// 2: gamma  (after 3s)
// 3: delta  (after 4s) — completes because labels$ exhausted
```

Pairing parallel API responses that correspond positionally:

```typescript
import { zip, from } from 'rxjs'
import { map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface UserWithScore {
	user: { id: number; name: string }
	score: { userId: number; value: number }
}

const userIds = [1, 2, 3]

// Two parallel streams of equal length — pair by position
const users$ = from(userIds.map((id) => ajax.getJSON<{ id: number; name: string }>(`/api/users/${id}`)))
const scores$ = from(userIds.map((id) => ajax.getJSON<{ userId: number; value: number }>(`/api/scores/${id}`)))

const combined$ = zip(users$, scores$).pipe(
	map(([user, score]): UserWithScore => ({ user, score }))
)
```

---

#### Gotchas

1. **`zip` is positional, not temporal** — unlike `combineLatest` which emits on every new value using the latest from each source, `zip` strictly pairs the 1st with the 1st, 2nd with the 2nd, etc. If one source is much faster, its values are buffered indefinitely until the slower source catches up — this can grow memory unboundedly.

2. **Completes on the shortest source** — surplus values from longer sources are silently discarded when any source completes. If this is unexpected, `combineLatest` with a `take` may be more appropriate.

3. **Memory growth with mismatched rates** — if sources emit at very different rates (e.g. a fast Subject and a slow HTTP poll), `zip` buffers the fast source's excess values. This is rarely what you want in production streams — use `withLatestFrom` or `combineLatest` instead.

4. **`zip` vs `forkJoin`** — `forkJoin` waits for all sources to complete and emits one tuple of their last values. `zip` emits a tuple for every positional match as values arrive. Use `zip` for ongoing streams; use `forkJoin` for one-shot parallel requests.

5. **Static function, not pipeable** — use `zipWith` for the pipeable equivalent inside a `pipe()` chain.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `combineLatest` | Emits on every new value using the latest from each source (not positional) | You want the current value of each source combined, not strict pairing |
| `forkJoin` | Waits for all sources to complete; emits one final tuple | One-shot parallel requests where you need all final values |
| `withLatestFrom` | Samples other sources on each source emission (not positional) | You want to attach the latest value of side streams to a primary stream |
| `zipWith` | Pipeable instance version of `zip` | You need to zip inside a `pipe()` chain |

---

#### Decision Rule

> Use `zip` when sources have **matching lengths and positional correspondence is meaningful**. Prefer `combineLatest` when you want the latest value from each source on every emission, and `forkJoin` when you need the final value of parallel one-shot Observables.
