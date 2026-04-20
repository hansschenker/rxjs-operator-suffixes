---
operator: zipWith
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `zipWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>])`

> The pipeable instance version of `zip` — pairs the source Observable's emissions with those of other Observables **positionally** inside a `pipe()` chain, emitting a tuple for each positional match.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — pairing is positional (by index), not by when values arrive |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — every nth emission from every source is used; completes on shortest source (surplus discarded at end) |
| **Completion required** | No — emits on each positional match; completes when any source completes |

**Completion behaviour** — identical to `zip`: buffers emissions from faster sources until all have their nth value, then emits the nth tuple. Completes as soon as any source completes; surplus buffered values from longer sources are discarded.

**Lossy behaviour** — same as `zip`: not lossy during operation, but surplus values from longer sources are discarded when the shortest source completes.

---

#### Marble Diagram

```
source:    -a----b----c----|
other1$:   --1--2--3-------|
           zipWith(other1$)
output:    --[a,1]-[b,2]-[c,3]-|
```

---

#### Signature

```typescript
zipWith<T, A extends readonly unknown[]>(
	...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, Cons<T, A>>
```

**RxJS 7 note:** `zipWith` was added in RxJS 7. In RxJS 6 the pipeable pattern required using the static `zip` function outside the pipe chain.

---

#### When to Use

- Zip two streams together inside an existing pipeline without breaking out of `pipe()`.
- Pair the source stream's emissions with a corresponding sequence mid-pipeline.
- Use inside operator compositions where the source is already mid-chain.

---

#### Code Example

```typescript
import { interval, of } from 'rxjs'
import { zipWith, map, take } from 'rxjs/operators'

const labels$ = of('first', 'second', 'third')

// Pair each interval tick with a label, inside a pipe chain
const annotated$ = interval(500).pipe(
	take(3),
	zipWith(labels$),
	map(([tick, label]: [number, string]) => `Tick ${tick}: ${label}`)
)

annotated$.subscribe((msg: string) => console.log(msg))
// Tick 0: first   (after 500ms)
// Tick 1: second  (after 1000ms)
// Tick 2: third   (after 1500ms)
```

---

#### Gotchas

1. **RxJS 7+ only** — `zipWith` does not exist in RxJS 6. For RxJS 6 compatibility, use the static `zip(source$, other$)` creation function.

2. **Same positional-pairing caveats as `zip`** — mismatched emission rates cause buffering; the shortest source determines when the output completes. See the `zip` entry for full details.

3. **Output type is a tuple** — the result type is `[T, A[0], A[1], ...]`. If you need a flat merged stream rather than paired tuples, use `mergeWith` instead.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `zip` (static) | Static creation function — not pipeable | Combining streams at the top level outside an existing pipeline |
| `combineLatestWith` | Pipeable — emits on every new value using latest from each source | You want reactive combination, not strict positional pairing |
| `mergeWith` | Pipeable — flat union of all emissions | You want all values interleaved, not paired into tuples |
| `withLatestFrom` | Pipeable — samples other sources on each primary emission | You want to attach the latest side-stream value, not pair by position |

---

#### Decision Rule

> Use `zipWith` when you need **positional pairing inside a `pipe()` chain** (RxJS 7+). Prefer the static `zip` when combining at the top level or supporting RxJS 6.
