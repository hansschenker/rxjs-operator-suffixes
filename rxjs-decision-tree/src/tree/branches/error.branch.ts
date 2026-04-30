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
