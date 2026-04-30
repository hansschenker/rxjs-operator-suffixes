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
