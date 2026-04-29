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
