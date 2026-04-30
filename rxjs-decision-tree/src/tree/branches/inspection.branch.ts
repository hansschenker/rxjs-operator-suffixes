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
