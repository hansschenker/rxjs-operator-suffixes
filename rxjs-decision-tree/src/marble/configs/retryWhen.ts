// src/marble/configs/retryWhen.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const retryWhenConfig: FirstOrderDiagramConfig = {
	title: 'retry — resubscribes on error',
	operatorName: 'retryWhen',
	totalTime: 12,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 4, label: '✗', color: '#f87171', active: true, resultLabel: 'retry', resultTime: 6 },
			{ time: 8, label: 'b', color: '#34d399', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
