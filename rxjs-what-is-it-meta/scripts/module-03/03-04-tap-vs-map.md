---
module: 3
lesson: "3.4"
title: tap vs map — declaring side effects without breaking the pipeline
key_insight: map() must return a transformed value and must be pure. tap() declares a side effect that runs later without altering the emitted value. Confusing the two breaks referential transparency silently — no compiler error, no runtime exception.
---

## Hook

There is no TypeScript compiler error, no ESLint warning by default, and no runtime exception when you put a side effect inside `map()`. The pipeline appears to work correctly. But you have just made your pipeline non-deterministic — running it twice produces the same output but doubles the side effects, breaking the guarantee that the pipe is a description of work rather than an execution of it.

## Insight

`map(fn)` has a contract: `fn` receives a value, must return a transformed value, and must have no observable side effects. The return value replaces the emission in the stream. The operator exists to transform data — it is a pure function applied to each emitted value.

`tap(fn)` has a different contract: `fn` receives the value, its return value is unconditionally ignored, and the original value passes through the stream unchanged. `tap` exists for side effects: logging, dispatching Redux actions, sending metrics, updating external state, writing to a debug overlay. The declaration of a side effect inside `tap` is still pure — you are describing when the side effect will happen, not executing it yet. Execution happens at `subscribe()`.

The distinction matters because a `map` function that produces a side effect ties the pipeline to the number of times it is subscribed or replayed. A pipeline with `shareReplay(1)` subscribed twice may fire its `map` side effect twice. A pipeline replayed for a new late subscriber fires it again. `tap`, by contrast, is the declared and expected side-effect slot — it communicates intent clearly, it composes cleanly, and it does not corrupt the transformation semantics of `map`.

## Example

The anti-pattern is easy to write and impossible to detect from the outside until it causes a bug:

```typescript
import { map, tap } from 'rxjs/operators';

interface User { id: number; name: string; loaded?: boolean; }

// Anti-pattern: side effect inside map breaks referential transparency
const broken$ = user$.pipe(
	map((value: User) => {
		console.log(value);  // side effect inside a transformation — wrong
		return value;
	}),
);

// Correct: tap declares the side effect, map stays pure
const correct$ = user$.pipe(
	tap((value: User) => console.log(value)),
	map((value: User): User => ({ ...value, loaded: true })),
);
```

The refactored version separates concerns clearly: `tap` owns side effects, `map` owns transformation. Each operator does exactly one job, and the pipeline as a whole remains a valid description of work that can be composed and replayed without unexpected consequences.

## Summary

- `map` must be pure and return a transformed value — side effects inside `map` are a silent correctness bug
- `tap` declares a side effect that runs without altering the emitted value — it is the correct operator for logging, metrics, and dispatching
- Putting side effects in `map` compiles and runs but silently breaks referential transparency, especially under `shareReplay` or multiple subscriptions
