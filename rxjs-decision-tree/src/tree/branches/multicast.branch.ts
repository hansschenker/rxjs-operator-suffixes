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
