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
