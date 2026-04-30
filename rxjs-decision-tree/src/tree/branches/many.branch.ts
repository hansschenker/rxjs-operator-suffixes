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
