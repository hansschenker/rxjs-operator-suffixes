// src/marble/configs/onErrorResumeNextWith.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const onErrorResumeNextWithConfig: FirstOrderDiagramConfig = {
	title: 'onErrorResumeNextWith — continues after error',
	operatorName: 'onErrorResumeNextWith',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 4, label: '✗', color: '#f87171', active: true, resultLabel: 'b', resultTime: 6 },
			{ time: 8, label: 'c', color: '#34d399', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
