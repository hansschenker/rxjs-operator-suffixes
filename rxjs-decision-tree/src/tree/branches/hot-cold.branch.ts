// src/tree/branches/hot-cold.branch.ts
import { op, leaf } from '../tree.builders'
import type { QuestionNode } from '../tree.types'

export const HOT_COLD: QuestionNode = {
	kind: 'question',
	id: 'hotcold',
	question: 'What do you need from the Subject?',
	hint: 'Subjects are both Observables and Observers — they bridge imperative and reactive code.',
	branches: [
		{
			label: 'Dispatch values imperatively with no initial value',
			next: leaf('hotcold-Subject', [
				op('Subject', 'A multicast Observable that allows imperative dispatch via next().', '/subjects/Subject'),
			]),
		},
		{
			label: 'Late subscribers need the current value immediately',
			next: leaf('hotcold-BehaviorSubject', [
				op('BehaviorSubject', 'Holds the current value and replays it immediately to new subscribers.', '/subjects/BehaviorSubject'),
			]),
		},
		{
			label: 'Late subscribers need the last N emitted values',
			next: leaf('hotcold-ReplaySubject', [
				op('ReplaySubject(n)', 'Replay the last n emissions to any new subscriber.', '/subjects/ReplaySubject'),
			]),
		},
		{
			label: 'Convert a cold Observable into a hot shared one',
			next: leaf('hotcold-share', [
				op('share()', 'Make a cold Observable hot by sharing one execution among all current subscribers.', '/operators/share'),
				op('shareReplay(1)', 'Make hot and replay the last value to late subscribers.', '/operators/shareReplay', false),
				op('publish', 'Multicast to a Subject — use with connect() for manual control.', '/operators/publish', false),
			]),
		},
	],
}
