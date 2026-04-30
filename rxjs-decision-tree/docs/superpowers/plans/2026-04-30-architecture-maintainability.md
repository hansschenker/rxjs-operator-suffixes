# Architecture / Maintainability Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic tree config into per-branch files, add typed derived state streams to eliminate unnecessary re-renders, and extract a single operator-detail facade.

**Architecture:** The tree config helpers move to `tree.builders.ts`; each of the 10 top-level branches becomes its own file under `src/tree/branches/`. `tree.state.ts` gains `SidebarSlice`, `PanelSlice`, `sidebarState$`, and `panelState$` so UI modules subscribe only to the slice they need. A new `getOperatorDetail(wikiPath)` function in `src/data/operator-detail.ts` encapsulates both registry lookups behind one call.

**Tech Stack:** TypeScript 5.9 (`satisfies` not needed — explicit annotations suffice), RxJS 7.8 (`map`, `distinctUntilChanged`), Vitest 4.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/tree/tree.builders.ts` | `op()`, `leaf()`, `WIKI_BASE` |
| **Create** | `src/tree/branches/create.branch.ts` | CREATE node (8 leaves) |
| **Create** | `src/tree/branches/one.branch.ts` | ONE sub-tree (ONE, ONE_QUERY, ONE_VALUES, ONE_TIMING, LIFECYCLE) |
| **Create** | `src/tree/branches/many.branch.ts` | MANY node (7 leaves) |
| **Create** | `src/tree/branches/nested.branch.ts` | NESTED node (4 leaves) |
| **Create** | `src/tree/branches/error.branch.ts` | ERROR node (4 leaves) |
| **Create** | `src/tree/branches/multicast.branch.ts` | MULTICAST node (2 leaves) |
| **Create** | `src/tree/branches/aggregation.branch.ts` | AGGREGATION node (2 leaves) |
| **Create** | `src/tree/branches/conditional.branch.ts` | CONDITIONAL node (4 leaves) |
| **Create** | `src/tree/branches/hot-cold.branch.ts` | HOT_COLD node (4 leaves) |
| **Create** | `src/tree/branches/inspection.branch.ts` | INSPECTION node (4 leaves) |
| **Create** | `src/data/operator-detail.ts` | `getOperatorDetail()` facade |
| **Create** | `src/data/operator-detail.test.ts` | Tests for the facade |
| **Rewrite** | `src/tree/tree.config.ts` | ROOT assembly + 10 branch imports only |
| **Extend** | `src/state/tree.state.ts` | Add slice types and derived streams |
| **Update** | `src/ui/sidebar.ts` | Accept `SidebarSlice` instead of `TreeState` |
| **Update** | `src/ui/panel.ts` | Accept `PanelSlice` instead of `TreeState` |
| **Update** | `src/ui/detail.ts` | Call `getOperatorDetail()` |
| **Update** | `src/main.ts` | Two independent subscriptions |

---

## Task 1: Extract tree builders

**Files:**
- Create: `src/tree/tree.builders.ts`

- [ ] **Step 1: Create `src/tree/tree.builders.ts`**

```typescript
// src/tree/tree.builders.ts
import type { LeafNode, OperatorResult } from './tree.types'

export const WIKI_BASE = 'http://localhost:5174'  // local VitePress wiki; update for prod

export function leaf(id: string, operators: OperatorResult[]): LeafNode {
	return { kind: 'leaf', id, operators }
}

export function op(name: string, oneliner: string, wikiPath: string, primary = true): OperatorResult {
	return { name, oneliner, wikiPath, primary }
}
```

- [ ] **Step 2: Run build — expect no errors**

```bash
npm run build
```

Expected: exits 0 with no TypeScript errors (tree.builders.ts is unused so far — that is fine).

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.builders.ts
git commit -m "refactor: extract op(), leaf(), WIKI_BASE into tree.builders"
```

---

## Task 2: Create branch files

**Files:**
- Create: `src/tree/branches/create.branch.ts`
- Create: `src/tree/branches/one.branch.ts`
- Create: `src/tree/branches/many.branch.ts`
- Create: `src/tree/branches/nested.branch.ts`
- Create: `src/tree/branches/error.branch.ts`
- Create: `src/tree/branches/multicast.branch.ts`
- Create: `src/tree/branches/aggregation.branch.ts`
- Create: `src/tree/branches/conditional.branch.ts`
- Create: `src/tree/branches/hot-cold.branch.ts`
- Create: `src/tree/branches/inspection.branch.ts`

- [ ] **Step 1: Create `src/tree/branches/create.branch.ts`**

```typescript
// src/tree/branches/create.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const CREATE: QuestionNode = {
	kind: 'question',
	id: 'create',
	question: 'What is your source?',
	hint: 'The nature of the data source determines the creation operator.',
	branches: [
		{
			label: 'Single or multiple static values',
			next: leaf('create-of', [
				op('of', 'Emit a fixed sequence of values then complete.', '/operators/of'),
				op('from', 'Convert an array, iterable, or Promise into an Observable.', '/operators/from', false),
			]),
		},
		{
			label: 'Array, iterable, or Promise',
			next: leaf('create-from', [
				op('from', 'Convert an array, iterable, or Promise into an Observable.', '/operators/from'),
			]),
		},
		{
			label: 'DOM event or Node.js EventEmitter',
			next: leaf('create-fromEvent', [
				op('fromEvent', 'Create an Observable from DOM or Node.js events.', '/operators/fromEvent'),
			]),
		},
		{
			label: 'Repeating timer or interval',
			next: leaf('create-interval', [
				op('interval', 'Emit an incrementing number on a fixed time interval.', '/operators/interval'),
				op('timer', 'Emit after an initial delay, then optionally on an interval.', '/operators/timer', false),
			]),
		},
		{
			label: 'Custom subscribe / unsubscribe logic',
			next: leaf('create-observable', [
				op('new Observable()', 'Define custom subscribe logic from scratch.', '/operators/Observable'),
			]),
		},
		{
			label: 'Condition or deferred factory (different Observable per subscriber)',
			next: leaf('create-defer', [
				op('defer', 'Create a fresh Observable for each subscriber via a factory function.', '/operators/defer'),
				op('iif', 'Subscribe to one of two Observables based on a boolean condition.', '/operators/iif', false),
			]),
		},
		{
			label: 'Completes immediately without emitting any value',
			next: leaf('create-empty', [
				op('EMPTY', 'An Observable that completes immediately without emitting.', '/operators/EMPTY'),
			]),
		},
		{
			label: 'Never emits, errors, or completes',
			next: leaf('create-never', [
				op('NEVER', 'An Observable that never emits, errors, or completes.', '/operators/NEVER'),
			]),
		},
	],
}
```

- [ ] **Step 2: Create `src/tree/branches/one.branch.ts`**

```typescript
// src/tree/branches/one.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

const ONE_VALUES_NONLOSSY: QuestionNode = {
	kind: 'question',
	id: 'one-values-nonlossy',
	question: 'What transformation do you need?',
	branches: [
		{
			label: 'Change the shape or type of each value',
			next: leaf('one-values-map', [
				op('map', 'Apply a projection function to each emitted value.', '/operators/map'),
			]),
		},
		{
			label: 'Accumulate state and emit each intermediate result',
			next: leaf('one-values-scan', [
				op('scan', 'Apply an accumulator and emit the running result after each value.', '/operators/scan'),
			]),
		},
		{
			label: 'Reduce all values to one, emitted when the source completes',
			next: leaf('one-values-reduce', [
				op('reduce', 'Apply an accumulator and emit a single result on completion.', '/operators/reduce'),
				op('toArray', 'Collect all values into a single array emitted on completion.', '/operators/toArray', false),
				op('count', 'Emit the total count of values when the source completes.', '/operators/count', false),
			]),
		},
		{
			label: 'Expand each value into multiple inner emissions',
			next: leaf('one-values-expand', [
				op('mergeMap', 'Map each value to an inner Observable and merge all emissions.', '/operators/mergeMap'),
				op('concatMap', 'Map each value to an inner Observable, concat in order.', '/operators/concatMap', false),
			]),
		},
	],
}

const ONE_VALUES: QuestionNode = {
	kind: 'question',
	id: 'one-values',
	question: 'Lossy (filter / drop) or non-lossy (transform all values)?',
	hint: 'Lossy: some emitted values are discarded. Non-lossy: every value is kept and transformed.',
	branches: [
		{
			label: 'Lossy — pass only values that match a predicate',
			next: leaf('one-values-filter', [
				op('filter', 'Pass only values that satisfy a predicate — others are dropped.', '/operators/filter'),
				op('distinctUntilChanged', 'Drop consecutive duplicates — emit only when the value changes.', '/operators/distinctUntilChanged', false),
				op('distinct', 'Drop all previously-seen values — emit only new ones.', '/operators/distinct', false),
			]),
		},
		{
			label: 'Non-lossy — transform or accumulate all values',
			next: ONE_VALUES_NONLOSSY,
		},
	],
}

const ONE_TIMING_LOSSY: QuestionNode = {
	kind: 'question',
	id: 'one-timing-lossy',
	question: 'What timing strategy? (all drop some values)',
	branches: [
		{
			label: 'Wait for silence — emit the last value after a quiet period',
			next: leaf('one-timing-debounce', [
				op('debounceTime', 'Emit only after the source has been silent for a specified duration.', '/operators/debounceTime'),
				op('debounce', 'Like debounceTime but silence duration is controlled by an Observable.', '/operators/debounce', false),
			]),
		},
		{
			label: 'First value in a time window wins, ignore the rest',
			next: leaf('one-timing-throttle', [
				op('throttleTime', 'Emit the first value then ignore further values for a time window.', '/operators/throttleTime'),
				op('throttle', 'Like throttleTime but the window is controlled by an Observable.', '/operators/throttle', false),
			]),
		},
		{
			label: 'Last value in a time window wins (trailing edge)',
			next: leaf('one-timing-audit', [
				op('auditTime', 'Emit the most recent value after a time window elapses.', '/operators/auditTime'),
				op('sampleTime', 'Emit the most recent value at regular time intervals.', '/operators/sampleTime', false),
				op('sample', 'Emit the most recent value whenever a notifier Observable emits.', '/operators/sample', false),
			]),
		},
	],
}

const ONE_TIMING_NONLOSSY: QuestionNode = {
	kind: 'question',
	id: 'one-timing-nonlossy',
	question: 'Buffer into arrays, window into Observables, or delay all?',
	branches: [
		{
			label: 'Collect values into arrays at regular intervals',
			next: leaf('one-timing-buffer', [
				op('bufferTime', 'Collect values into arrays emitted at regular time intervals.', '/operators/bufferTime'),
				op('bufferCount', 'Collect values into arrays of a fixed size.', '/operators/bufferCount', false),
				op('buffer', 'Collect into arrays, closing each when a notifier emits.', '/operators/buffer', false),
			]),
		},
		{
			label: 'Window values into inner Observables',
			next: leaf('one-timing-window', [
				op('windowTime', 'Emit inner Observables containing values from a time window.', '/operators/windowTime'),
				op('windowCount', 'Emit inner Observables containing a fixed number of values.', '/operators/windowCount', false),
			]),
		},
		{
			label: 'Delay all emissions by a fixed amount',
			next: leaf('one-timing-delay', [
				op('delay', 'Shift all emissions forward in time by a fixed duration.', '/operators/delay'),
				op('delayWhen', 'Delay each emission by a duration determined by a per-value Observable.', '/operators/delayWhen', false),
			]),
		},
	],
}

const ONE_TIMING: QuestionNode = {
	kind: 'question',
	id: 'one-timing',
	question: 'Lossy (rate-limit, drop some) or non-lossy (buffer / delay all)?',
	branches: [
		{ label: 'Lossy — only some values survive the time constraint', next: ONE_TIMING_LOSSY },
		{ label: 'Non-lossy — keep all values, reshape their timing', next: ONE_TIMING_NONLOSSY },
	],
}

const ONE_QUERY: QuestionNode = {
	kind: 'question',
	id: 'one-query',
	question: 'Query on the VALUES emitted, or on the TIMING of emissions?',
	hint: 'Values: you care about what is emitted. Timing: you care about when it is emitted.',
	branches: [
		{ label: 'Values — what is emitted', next: ONE_VALUES },
		{ label: 'Timing — when it is emitted', next: ONE_TIMING },
	],
}

const LIFECYCLE: QuestionNode = {
	kind: 'question',
	id: 'lifecycle',
	question: 'How should the subscription end or be bounded?',
	hint: 'Control when to stop receiving values — completion, condition, or notifier.',
	branches: [
		{
			label: 'After a fixed number of values',
			next: leaf('lifecycle-take', [
				op('take(n)', 'Complete after emitting exactly n values.', '/operators/take'),
				op('first', 'Take only the first value (or first matching value) then complete.', '/operators/first', false),
				op('last', 'Emit only the last value when the source completes.', '/operators/last', false),
			]),
		},
		{
			label: 'While a condition holds true',
			next: leaf('lifecycle-takeWhile', [
				op('takeWhile', 'Emit values while a predicate returns true, then complete.', '/operators/takeWhile'),
			]),
		},
		{
			label: 'Until a notifier Observable emits',
			next: leaf('lifecycle-takeUntil', [
				op('takeUntil', 'Complete when a notifier Observable emits its first value.', '/operators/takeUntil'),
			]),
		},
		{
			label: 'Skip values at the start of the stream',
			next: leaf('lifecycle-skip', [
				op('skip(n)', 'Ignore the first n values then pass all subsequent values through.', '/operators/skip'),
				op('skipWhile', 'Skip values while a predicate returns true, then pass all through.', '/operators/skipWhile', false),
				op('skipUntil', 'Skip values until a notifier emits, then pass all through.', '/operators/skipUntil', false),
			]),
		},
	],
}

export const ONE: QuestionNode = {
	kind: 'question',
	id: 'one',
	question: 'What kind of operation on the single Observable?',
	branches: [
		{ label: 'Query or transform values / timing', next: ONE_QUERY },
		{ label: 'Control subscription lifecycle (take, skip, complete when…)', next: LIFECYCLE },
	],
}
```

- [ ] **Step 3: Create `src/tree/branches/many.branch.ts`**

```typescript
// src/tree/branches/many.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const MANY: QuestionNode = {
	kind: 'question',
	id: 'many',
	question: 'What matters most about combining them?',
	hint: 'Think about whether completion, emission order, or latest values is the goal.',
	branches: [
		{
			label: 'Wait for all to complete, then emit their combined last values',
			next: leaf('many-forkJoin', [
				op('forkJoin', 'Wait for all Observables to complete and emit their last values as a combined array.', '/operators/forkJoin'),
			]),
		},
		{
			label: 'Emit combined latest values whenever any source emits',
			next: leaf('many-combineLatest', [
				op('combineLatest', 'Emit the latest value from each source whenever any source emits.', '/operators/combineLatest'),
			]),
		},
		{
			label: 'Emit from whichever source emits, interleaved',
			next: leaf('many-merge', [
				op('merge', 'Subscribe to all sources and emit values as they arrive from any of them.', '/operators/merge'),
			]),
		},
		{
			label: 'Strict sequence — each starts only when the previous completes',
			next: leaf('many-concat', [
				op('concat', 'Subscribe to sources in order — next one starts only when previous completes.', '/operators/concat'),
			]),
		},
		{
			label: 'Race — use only the fastest source, ignore the rest',
			next: leaf('many-race', [
				op('race', 'Subscribe to the first source to emit and unsubscribe from all others.', '/operators/race'),
			]),
		},
		{
			label: 'Pair values by index position (like a zip file)',
			next: leaf('many-zip', [
				op('zip', 'Emit arrays pairing the nth value from each source by emission index.', '/operators/zip'),
			]),
		},
		{
			label: 'Sample primary stream using secondary stream\'s timing',
			next: leaf('many-withLatestFrom', [
				op('withLatestFrom', 'When the primary emits, combine its value with the latest from a secondary stream.', '/operators/withLatestFrom'),
			]),
		},
	],
}
```

- [ ] **Step 4: Create `src/tree/branches/nested.branch.ts`**

```typescript
// src/tree/branches/nested.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const NESTED: QuestionNode = {
	kind: 'question',
	id: 'nested',
	question: 'Lossy (cancel or ignore some inner Observables) or non-lossy (process all)?',
	hint: 'Lossy strategies discard inner Observables. Non-lossy strategies process every one.',
	branches: [
		{
			label: 'Lossy — cancel the current inner when a new outer value arrives',
			next: leaf('nested-switchMap', [
				op('switchMap', 'Cancel the current inner Observable when a new outer value arrives — only the latest inner runs.', '/operators/switchMap'),
			]),
		},
		{
			label: 'Lossy — ignore new outer values while an inner Observable is still active',
			next: leaf('nested-exhaustMap', [
				op('exhaustMap', 'Ignore new outer values while an inner Observable is still running.', '/operators/exhaustMap'),
			]),
		},
		{
			label: 'Non-lossy — queue each inner and process them in strict order',
			next: leaf('nested-concatMap', [
				op('concatMap', 'Map each outer value to an inner Observable and concatenate — next inner starts only when previous completes.', '/operators/concatMap'),
			]),
		},
		{
			label: 'Non-lossy — run all inner Observables concurrently',
			next: leaf('nested-mergeMap', [
				op('mergeMap', 'Map each outer value to an inner Observable and merge all emissions concurrently.', '/operators/mergeMap'),
			]),
		},
	],
}
```

- [ ] **Step 5: Create `src/tree/branches/error.branch.ts`**

```typescript
// src/tree/branches/error.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const ERROR: QuestionNode = {
	kind: 'question',
	id: 'error',
	question: 'What should happen when the stream errors?',
	branches: [
		{
			label: 'Recover by switching to a fallback Observable',
			next: leaf('error-catchError', [
				op('catchError', 'Intercept an error and replace the failed Observable with a fallback.', '/operators/catchError'),
			]),
		},
		{
			label: 'Retry the source Observable',
			next: leaf('error-retry', [
				op('retry(n)', 'Resubscribe to the source Observable up to n times on error.', '/operators/retry'),
				op('retryWhen', 'Resubscribe when a notifier Observable emits — enables delay-based retry.', '/operators/retryWhen', false),
			]),
		},
		{
			label: 'Continue seamlessly with the next Observable on error',
			next: leaf('error-onErrorResumeNext', [
				op('onErrorResumeNextWith', 'On error (or completion), continue seamlessly with the next provided Observable.', '/operators/onErrorResumeNextWith'),
			]),
		},
		{
			label: 'Throw if no value arrives within a time limit',
			next: leaf('error-timeout', [
				op('timeout', 'Throw a TimeoutError if the source does not emit within the specified duration.', '/operators/timeout'),
			]),
		},
	],
}
```

- [ ] **Step 6: Create `src/tree/branches/multicast.branch.ts`**

```typescript
// src/tree/branches/multicast.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const MULTICAST: QuestionNode = {
	kind: 'question',
	id: 'multicast',
	question: 'Do late subscribers need to receive a cached value immediately on subscription?',
	hint: 'Sharing makes multiple subscribers share one source execution instead of each triggering a new one.',
	branches: [
		{
			label: 'Yes — replay the last emitted value to late subscribers',
			next: leaf('multicast-shareReplay', [
				op('shareReplay(1)', 'Share the source execution and replay the last emitted value to new subscribers.', '/operators/shareReplay'),
			]),
		},
		{
			label: 'No — share execution only, no replay needed',
			next: leaf('multicast-share', [
				op('share', 'Share the source execution among multiple subscribers — no value replay.', '/operators/share'),
			]),
		},
	],
}
```

- [ ] **Step 7: Create `src/tree/branches/aggregation.branch.ts`**

```typescript
// src/tree/branches/aggregation.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const AGGREGATION: QuestionNode = {
	kind: 'question',
	id: 'aggregation',
	question: 'Emit each accumulated step, or one final result when the stream completes?',
	branches: [
		{
			label: 'Emit each accumulated intermediate result (stream stays open)',
			next: leaf('aggregation-scan', [
				op('scan', 'Apply an accumulator and emit the running result after each source value.', '/operators/scan'),
			]),
		},
		{
			label: 'Emit a single final result when the source completes',
			next: leaf('aggregation-reduce', [
				op('reduce', 'Apply an accumulator and emit a single result when the source completes.', '/operators/reduce'),
				op('toArray', 'Collect all values and emit them as a single array on completion.', '/operators/toArray', false),
				op('count', 'Emit the total count of emitted values when the source completes.', '/operators/count', false),
			]),
		},
	],
}
```

- [ ] **Step 8: Create `src/tree/branches/conditional.branch.ts`**

```typescript
// src/tree/branches/conditional.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const CONDITIONAL: QuestionNode = {
	kind: 'question',
	id: 'conditional',
	question: 'What yes/no question do you want to ask about the stream?',
	branches: [
		{
			label: 'Does every emitted value satisfy a condition?',
			next: leaf('conditional-every', [
				op('every', 'Emit true if all values pass the predicate, false as soon as one fails.', '/operators/every'),
			]),
		},
		{
			label: 'Find the first value that matches a condition',
			next: leaf('conditional-find', [
				op('find', 'Emit the first value satisfying the predicate, then complete.', '/operators/find'),
				op('findIndex', 'Emit the index of the first value satisfying the predicate, then complete.', '/operators/findIndex', false),
			]),
		},
		{
			label: 'Did the stream complete without emitting anything?',
			next: leaf('conditional-isEmpty', [
				op('isEmpty', 'Emit true if the source completes without emitting any values.', '/operators/isEmpty'),
				op('defaultIfEmpty', 'Emit a default value if the source completes without emitting.', '/operators/defaultIfEmpty', false),
			]),
		},
		{
			label: 'Choose between two Observables based on a runtime condition',
			next: leaf('conditional-iif', [
				op('iif', 'Subscribe to one of two Observables based on a boolean condition at subscribe time.', '/operators/iif'),
			]),
		},
	],
}
```

- [ ] **Step 9: Create `src/tree/branches/hot-cold.branch.ts`**

```typescript
// src/tree/branches/hot-cold.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const HOT_COLD: QuestionNode = {
	kind: 'question',
	id: 'hotcold',
	question: 'What do you need from the Subject?',
	hint: 'Subjects are both Observables and Observers — they bridge imperative and reactive code.',
	branches: [
		{
			label: 'Dispatch values imperatively with no initial value',
			next: leaf('hotcold-Subject', [
				op('Subject', 'A multicast Observable that allows imperative dispatch via next().', '/subjects/Subject'),
			]),
		},
		{
			label: 'Late subscribers need the current value immediately',
			next: leaf('hotcold-BehaviorSubject', [
				op('BehaviorSubject', 'Holds the current value and replays it immediately to new subscribers.', '/subjects/BehaviorSubject'),
			]),
		},
		{
			label: 'Late subscribers need the last N emitted values',
			next: leaf('hotcold-ReplaySubject', [
				op('ReplaySubject(n)', 'Replay the last n emissions to any new subscriber.', '/subjects/ReplaySubject'),
			]),
		},
		{
			label: 'Convert a cold Observable into a hot shared one',
			next: leaf('hotcold-share', [
				op('share()', 'Make a cold Observable hot by sharing one execution among all current subscribers.', '/operators/share'),
				op('shareReplay(1)', 'Make hot and replay the last value to late subscribers.', '/operators/shareReplay', false),
				op('publish', 'Multicast to a Subject — use with connect() for manual control.', '/operators/publish', false),
			]),
		},
	],
}
```

- [ ] **Step 10: Create `src/tree/branches/inspection.branch.ts`**

```typescript
// src/tree/branches/inspection.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const INSPECTION: QuestionNode = {
	kind: 'question',
	id: 'inspection',
	question: 'What do you need to inspect or intercept in the stream?',
	branches: [
		{
			label: 'Log or trigger a side effect without changing values',
			next: leaf('inspection-tap', [
				op('tap', 'Run a side effect (logging, debugging) at any point in the pipe without altering values.', '/operators/tap'),
			]),
		},
		{
			label: 'Convert next/error/complete notifications into value objects',
			next: leaf('inspection-materialize', [
				op('materialize', 'Wrap each notification (next, error, complete) into a Notification<T> value object.', '/operators/materialize'),
			]),
		},
		{
			label: 'Unwrap Notification objects back into stream signals',
			next: leaf('inspection-dematerialize', [
				op('dematerialize', 'Convert a stream of Notification objects back into a regular Observable stream.', '/operators/dematerialize'),
			]),
		},
		{
			label: 'Run cleanup code when the stream ends for any reason',
			next: leaf('inspection-finalize', [
				op('finalize', 'Run a callback when the source completes, errors, or is unsubscribed — like try/finally for streams.', '/operators/finalize'),
			]),
		},
	],
}
```

- [ ] **Step 11: Run build — all 10 branch files are new and unused, expect no errors**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 12: Commit**

```bash
git add src/tree/branches/
git commit -m "refactor: split tree config into per-branch files"
```

---

## Task 3: Rewrite tree.config.ts

**Files:**
- Modify: `src/tree/tree.config.ts`

- [ ] **Step 1: Replace the entire contents of `src/tree/tree.config.ts`**

```typescript
// src/tree/tree.config.ts
import type { QuestionNode } from './tree.types'
import { CREATE }      from './branches/create.branch'
import { ONE }         from './branches/one.branch'
import { MANY }        from './branches/many.branch'
import { NESTED }      from './branches/nested.branch'
import { ERROR }       from './branches/error.branch'
import { MULTICAST }   from './branches/multicast.branch'
import { AGGREGATION } from './branches/aggregation.branch'
import { CONDITIONAL } from './branches/conditional.branch'
import { HOT_COLD }    from './branches/hot-cold.branch'
import { INSPECTION }  from './branches/inspection.branch'

export { WIKI_BASE } from './tree.builders'

export const ROOT: QuestionNode = {
	kind: 'question',
	id: 'root',
	question: 'How many Observables do you have?',
	hint: 'The number of streams shapes every operator choice. Choose a concern on the left if none of the first four apply.',
	branches: [
		{ label: 'None — I need to create an Observable',                          next: CREATE      },
		{ label: 'One Observable',                                                  next: ONE         },
		{ label: 'Many Observables to combine',                                     next: MANY        },
		{ label: 'One that emits Observables (nested / higher-order)',              next: NESTED      },
		{ label: 'Error handling',                                                  next: ERROR       },
		{ label: 'Multicasting — share one source among subscribers',              next: MULTICAST   },
		{ label: 'Aggregation — fold or accumulate values',                        next: AGGREGATION },
		{ label: 'Conditional — boolean query about the stream',                   next: CONDITIONAL },
		{ label: 'Hot vs Cold — Subjects and sharing',                             next: HOT_COLD    },
		{ label: 'Inspection — tap into the stream without changing it',           next: INSPECTION  },
	],
}
```

- [ ] **Step 2: Run build and tests**

```bash
npm run build && npm run test
```

Expected: build exits 0, all existing tests pass (reducer tests and marble render tests are unaffected by config changes).

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.config.ts
git commit -m "refactor: tree.config.ts reduced to ROOT assembly + imports"
```

---

## Task 4: Add derived state streams

**Files:**
- Modify: `src/state/tree.state.ts`

- [ ] **Step 1: Replace the contents of `src/state/tree.state.ts`**

Add `SidebarSlice`, `PanelSlice`, `sidebarState$`, and `panelState$`. The existing `action$`, `initial`, and `state$` exports are unchanged.

```typescript
// src/state/tree.state.ts
import { Subject, scan, startWith, shareReplay, map, distinctUntilChanged } from 'rxjs'
import { ROOT } from '../tree/tree.config'
import { makeReducer } from './tree.reducer'
import type { Action, TreeState, TreeNode, BreadcrumbStep, DetailView } from '../tree/tree.types'

export const action$ = new Subject<Action>()

export const initial: TreeState = {
	currentNode: ROOT,
	history:     [],
	breadcrumb:  [],
	detailView:  null,
}

const treeReducer = makeReducer(initial)

export const state$ = action$.pipe(
	scan(treeReducer, initial),
	startWith(initial),
	shareReplay(1),
)

export interface SidebarSlice {
	currentNode: TreeNode
	breadcrumb:  BreadcrumbStep[]
}

export interface PanelSlice {
	currentNode: TreeNode
	breadcrumb:  BreadcrumbStep[]
	historyLen:  number
	detailView:  DetailView | null
}

export const sidebarState$ = state$.pipe(
	map(({ currentNode, breadcrumb }): SidebarSlice => ({ currentNode, breadcrumb })),
	distinctUntilChanged((a, b) =>
		a.currentNode === b.currentNode && a.breadcrumb === b.breadcrumb
	),
)

export const panelState$ = state$.pipe(
	map(({ currentNode, breadcrumb, history, detailView }): PanelSlice => ({
		currentNode,
		breadcrumb,
		historyLen: history.length,
		detailView,
	})),
	distinctUntilChanged((a, b) =>
		a.currentNode === b.currentNode &&
		a.historyLen  === b.historyLen  &&
		a.detailView  === b.detailView
	),
)
```

- [ ] **Step 2: Run build and tests**

```bash
npm run build && npm run test
```

Expected: build exits 0, all tests pass. The new exports are unused by UI modules yet — TypeScript does not error on unused exports.

- [ ] **Step 3: Commit**

```bash
git add src/state/tree.state.ts
git commit -m "feat: add SidebarSlice, PanelSlice, sidebarState$, panelState$ to tree.state"
```

---

## Task 5: Operator detail facade

**Files:**
- Create: `src/data/operator-detail.ts`
- Create: `src/data/operator-detail.test.ts`

- [ ] **Step 1: Write the failing test in `src/data/operator-detail.test.ts`**

```typescript
// src/data/operator-detail.test.ts
import { describe, test, expect } from 'vitest'
import { getOperatorDetail } from './operator-detail'

describe('getOperatorDetail', () => {
	test('returns marbleSVG string and explanation for a known operator', () => {
		const result = getOperatorDetail('/operators/map')
		expect(result.marbleSVG).toBeTypeOf('string')
		expect(result.marbleSVG).toMatch(/^<svg/)
		expect(result.explanation).not.toBeNull()
	})

	test('returns null marbleSVG and null explanation for an unknown path', () => {
		const result = getOperatorDetail('/operators/__nonexistent__')
		expect(result.marbleSVG).toBeNull()
		expect(result.explanation).toBeNull()
	})

	test('extracts key from the last path segment', () => {
		// switchMap is in both registries
		const result = getOperatorDetail('/operators/switchMap')
		expect(result.marbleSVG).toMatch(/switchMap/)
		expect(result.explanation).not.toBeNull()
	})

	test('works for subject paths (/subjects/BehaviorSubject)', () => {
		const result = getOperatorDetail('/subjects/BehaviorSubject')
		expect(result.marbleSVG).toBeTypeOf('string')
	})
})
```

- [ ] **Step 2: Run the test — expect it to fail**

```bash
npm run test -- src/data/operator-detail.test.ts
```

Expected: FAIL with `Cannot find module './operator-detail'`.

- [ ] **Step 3: Create `src/data/operator-detail.ts`**

```typescript
// src/data/operator-detail.ts
import { getMarbleSVG } from '../marble/configs/index'
import { explanations } from './explanations'
import type { OperatorExplanation } from './explanations'

export interface OperatorDetail {
	marbleSVG:   string | null
	explanation: OperatorExplanation | null
}

export function getOperatorDetail(wikiPath: string): OperatorDetail {
	const key = wikiPath.split('/').pop() ?? ''
	return {
		marbleSVG:   getMarbleSVG(wikiPath),
		explanation: explanations[key] ?? null,
	}
}
```

- [ ] **Step 4: Run the test — expect all to pass**

```bash
npm run test -- src/data/operator-detail.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/operator-detail.ts src/data/operator-detail.test.ts
git commit -m "feat: add getOperatorDetail facade; tests"
```

---

## Task 6: Update UI renderers

**Files:**
- Modify: `src/ui/sidebar.ts`
- Modify: `src/ui/panel.ts`
- Modify: `src/ui/detail.ts`

- [ ] **Step 1: Update `src/ui/sidebar.ts` — accept `SidebarSlice` instead of `TreeState`**

```typescript
// src/ui/sidebar.ts
import { ROOT } from '../tree/tree.config'
import { action$ } from '../state/tree.state'
import type { SidebarSlice } from '../state/tree.state'
import type { TreeNode } from '../tree/tree.types'

export function renderSidebar(container: HTMLElement, state: SidebarSlice): void {
	const activeIds = new Set(state.breadcrumb.map(s => s.nodeId))

	container.innerHTML = `
		<div class="sidebar-tree">
			${renderNode(ROOT, 0, activeIds, state.currentNode)}
		</div>
		<div class="sidebar-reset">
			<button class="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelector('.reset-btn')!.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}

function truncate(text: string, max: number): string {
	return text.length > max ? text.slice(0, max) + '…' : text
}

function renderNode(
	node: TreeNode,
	depth: number,
	activeIds: Set<string>,
	current: TreeNode,
): string {
	const isCurrent = node === current
	const isOnPath  = activeIds.has(node.id)
	const style     = `style="--indent: ${depth}"`

	if (node.kind === 'leaf') {
		const cls = `sidebar-item leaf${isCurrent ? ' active-leaf' : ''}`
		const label = node.operators[0].name
		return `<div class="${cls}" ${style}>● ${label}</div>`
	}

	const expanded = depth === 0 || isOnPath || isCurrent
	const arrow    = expanded ? '▼' : '▷'
	const label    = truncate(node.question, 30)
	const cls      = [
		'sidebar-item question',
		isCurrent ? 'active' : '',
		isOnPath  ? 'on-path' : '',
	].filter(Boolean).join(' ')

	const children = expanded
		? node.branches.map(b => renderNode(b.next, depth + 1, activeIds, current)).join('')
		: ''

	return `<div class="${cls}" ${style}>${arrow} ${label}</div>${children}`
}
```

- [ ] **Step 2: Update `src/ui/panel.ts` — accept `PanelSlice` instead of `TreeState`**

```typescript
// src/ui/panel.ts
import { action$ } from '../state/tree.state'
import type { PanelSlice } from '../state/tree.state'
import { renderDetail } from './detail'
import { escHtml } from './utils'
import type { LeafNode, QuestionNode, OperatorResult, BreadcrumbStep } from '../tree/tree.types'

export function renderPanel(container: HTMLElement, state: PanelSlice): void {
	if (state.detailView) {
		renderDetail(container, state.detailView)
		return
	}

	const { currentNode, breadcrumb, historyLen } = state
	if (currentNode.kind === 'question') {
		renderQuestion(container, currentNode, breadcrumb, historyLen)
	} else {
		renderLeaf(container, currentNode, breadcrumb, historyLen)
	}
}

function renderBreadcrumb(
	breadcrumb: BreadcrumbStep[],
	terminalLabel: string,
	terminalClass: string,
): string {
	const chips = breadcrumb.map(step =>
		`<span class="bc-chip">${step.label}</span><span class="bc-sep">›</span>`
	).join('')
	return `<div class="breadcrumb">${chips}<span class="bc-chip ${terminalClass}">${terminalLabel}</span></div>`
}

function renderQuestion(
	container: HTMLElement,
	node: QuestionNode,
	breadcrumb: BreadcrumbStep[],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, node.question, 'current')
	const hint = node.hint ? `<p class="q-hint">${node.hint}</p>` : ''
	const buttons = node.branches.map((branch, i) =>
		`<button class="answer-btn" data-branch="${i}">${branch.label}</button>`
	).join('')

	container.innerHTML = `
		${bc}
		<h1 class="q-heading">${node.question}</h1>
		${hint}
		<div class="answer-list">${buttons}</div>
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
		</div>
	`

	container.querySelectorAll('.answer-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const i = Number((btn as HTMLButtonElement).dataset['branch'])
			const branch = node.branches[i]
			action$.next({ kind: 'answer', next: branch.next, label: branch.label })
		})
	})

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})
}

function renderOperator(op: OperatorResult): string {
	const detailBtn = `<button class="op-detail-btn"
		data-name="${op.name}"
		data-oneliner="${escHtml(op.oneliner)}"
		data-wiki="${op.wikiPath}">
		${op.primary ? '★ ' : ''}${op.name}
	</button>`

	if (op.primary) {
		return `
			<div class="result-primary">
				${detailBtn}
				<div class="op-oneliner">${op.oneliner}</div>
			</div>`
	}
	return `
		<div class="result-alt">
			${detailBtn}
			<span class="alt-desc">— ${op.oneliner}</span>
		</div>`
}

function renderLeaf(
	container: HTMLElement,
	node: LeafNode,
	breadcrumb: BreadcrumbStep[],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, '✓ Result', 'result')
	const ops = node.operators.map(op => renderOperator(op)).join('')

	container.innerHTML = `
		${bc}
		${ops}
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
			<button class="nav-btn" id="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelectorAll('.op-detail-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const el = btn as HTMLButtonElement
			action$.next({
				kind:         'open-detail',
				operatorName: el.dataset['name']     ?? '',
				oneliner:     el.dataset['oneliner'] ?? '',
				wikiPath:     el.dataset['wiki']     ?? '',
			})
		})
	})

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})

	container.querySelector('#reset-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}
```

- [ ] **Step 3: Update `src/ui/detail.ts` — use `getOperatorDetail()` facade**

```typescript
// src/ui/detail.ts
import { action$ } from '../state/tree.state'
import { getOperatorDetail } from '../data/operator-detail'
import { WIKI_BASE } from '../tree/tree.config'
import { escHtml } from './utils'
import type { DetailView } from '../tree/tree.types'

export function renderDetail(container: HTMLElement, detail: DetailView): void {
	const { operatorName, oneliner, wikiPath } = detail
	const { marbleSVG, explanation } = getOperatorDetail(wikiPath)

	const marbleSection = marbleSVG
		? `<div class="detail-marble">${marbleSVG}</div>`
		: ''

	const codeSection = explanation?.code
		? `<pre class="detail-code"><code>${escHtml(explanation.code)}</code></pre>`
		: ''

	const gotchasSection = explanation?.gotchas?.length
		? `<details class="detail-section">
			<summary class="detail-summary">Gotchas (${explanation.gotchas.length})</summary>
			<ol class="detail-gotchas">
				${explanation.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('\n')}
			</ol>
		</details>`
		: ''

	const relatedSection = explanation?.related
		? `<details class="detail-section">
			<summary class="detail-summary">Related operators</summary>
			<div class="detail-related">${markdownTable(explanation.related)}</div>
		</details>`
		: ''

	const ruleSection = explanation?.rule
		? `<p class="detail-rule">${escHtml(explanation.rule)}</p>`
		: ''

	const wikiLink = `<a class="detail-wiki-link" href="${WIKI_BASE}${wikiPath}" target="_blank" rel="noopener">
		Full documentation →
	</a>`

	container.innerHTML = `
		<div class="detail-header">
			<button class="nav-btn" id="detail-back-btn">← Back to results</button>
			<span class="detail-op-name">${escHtml(operatorName)}</span>
		</div>
		<p class="detail-oneliner">${escHtml(oneliner)}</p>
		${marbleSection}
		${codeSection}
		${gotchasSection}
		${relatedSection}
		${ruleSection}
		${wikiLink}
	`

	container.querySelector('#detail-back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'close-detail' })
	})
}

function markdownTable(md: string): string {
	const lines = md.trim().split('\n').filter(l => !l.match(/^\|[-| ]+\|$/))
	if (lines.length < 2) return `<pre>${escHtml(md)}</pre>`
	const header = lines[0]
	if (!header) return `<pre>${escHtml(md)}</pre>`
	const rows = lines.slice(1)
	const th = header.split('|').filter(Boolean).map(c => `<th>${escHtml(c.trim())}</th>`).join('')
	const trs = rows.map(r =>
		`<tr>${r.split('|').filter(Boolean).map(c => `<td>${escHtml(c.trim())}</td>`).join('')}</tr>`
	).join('\n')
	return `<table class="detail-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}
```

- [ ] **Step 4: Commit**

Do NOT run the build here — `main.ts` still passes `TreeState` to the updated renderer signatures and will fail `tsc` until Task 7 updates it.

```bash
git add src/ui/sidebar.ts src/ui/panel.ts src/ui/detail.ts
git commit -m "refactor: UI renderers accept slice types; detail uses getOperatorDetail facade"
```

---

## Task 7: Wire up main.ts and final verification

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Replace the contents of `src/main.ts`**

```typescript
// src/main.ts
import './style.css'
import { action$, sidebarState$, panelState$ } from './state/tree.state'
import { renderSidebar } from './ui/sidebar'
import { renderPanel } from './ui/panel'

const sidebar  = document.getElementById('sidebar')!
const panel    = document.getElementById('panel')!
const navReset = document.getElementById('nav-reset')!

sidebarState$.subscribe(state => renderSidebar(sidebar, state))
panelState$.subscribe(state => renderPanel(panel, state))

navReset.addEventListener('click', e => {
	e.preventDefault()
	action$.next({ kind: 'reset' })
})
```

- [ ] **Step 2: Run build and full test suite**

```bash
npm run build && npm run test
```

Expected: build exits 0, all tests pass (reducer tests + marble render tests + new operator-detail tests).

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:
1. Navigate a path (e.g. One Observable → Values → Lossy) — breadcrumb and sidebar update correctly
2. Click an operator result to open the detail panel — sidebar does NOT re-render (no flicker)
3. Click "← Back to results" — panel returns to leaf view, no sidebar flicker
4. Click "← Back" — navigates back through the tree correctly
5. Click "↺ Start over" — returns to root

- [ ] **Step 4: Final commit**

```bash
git add src/main.ts
git commit -m "refactor: wire sidebarState$ and panelState$ in main.ts — completes maintainability refactor"
```
