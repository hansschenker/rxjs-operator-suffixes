// src/marble/configs/timeout.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const timeoutConfig: FirstOrderDiagramConfig = {
	title: 'timeout — throws if no emission within limit',
	operatorName: 'timeout(5000)',
	totalTime: 8,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: '✗', color: '#f87171', active: true, resultLabel: 'TimeoutError', resultTime: 5 },
		],
	},
	result: {},
}
