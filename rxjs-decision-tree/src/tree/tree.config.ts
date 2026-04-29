// src/tree/tree.config.ts
import type { QuestionNode, LeafNode, OperatorResult } from './tree.types'

export const WIKI_BASE = 'http://localhost:5174'  // local VitePress wiki; update for prod

// ── Helper ─────────────────────────────────────────────────────────────────
function leaf(id: string, operators: OperatorResult[]): LeafNode {
	return { kind: 'leaf', id, operators }
}

function op(name: string, oneliner: string, wikiPath: string, primary = true): OperatorResult {
	return { name, oneliner, wikiPath, primary }
}

// ── ① Create ───────────────────────────────────────────────────────────────
const CREATE: QuestionNode = {
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

// ── ② One Observable — value query sub-nodes ───────────────────────────────
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
		{
			label: 'Lossy — only some values survive the time constraint',
			next: ONE_TIMING_LOSSY,
		},
		{
			label: 'Non-lossy — keep all values, reshape their timing',
			next: ONE_TIMING_NONLOSSY,
		},
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

// ── ③ One Observable — Lifecycle ───────────────────────────────────────────
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

// ── One Observable — top-level branch ─────────────────────────────────────
const ONE: QuestionNode = {
	kind: 'question',
	id: 'one',
	question: 'What kind of operation on the single Observable?',
	branches: [
		{ label: 'Query or transform values / timing', next: ONE_QUERY },
		{ label: 'Control subscription lifecycle (take, skip, complete when…)', next: LIFECYCLE },
	],
}

// ── ④ Many Observables ─────────────────────────────────────────────────────
const MANY: QuestionNode = {
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

// ── ⑤ Nested Observable (Observable of Observables) ───────────────────────
const NESTED: QuestionNode = {
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

// ── ⑥ Error Handling ───────────────────────────────────────────────────────
const ERROR: QuestionNode = {
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

// ── ⑦ Multicasting / Sharing ───────────────────────────────────────────────
const MULTICAST: QuestionNode = {
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
