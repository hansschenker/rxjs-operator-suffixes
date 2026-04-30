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
