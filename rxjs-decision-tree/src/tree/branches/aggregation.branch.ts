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
