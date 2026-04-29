// src/marble/configs/every.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const everyConfig: FirstOrderDiagramConfig = {
	operatorName: 'every',
	title: 'every — result emits single boolean at completion (simplified)',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: '1', color: '#a78bfa', active: false },
			{ time: 5, label: '2', color: '#34d399', active: false },
			{ time: 8, label: '3', color: '#fb923c', active: true, resultLabel: 'true', resultTime: 10 },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
