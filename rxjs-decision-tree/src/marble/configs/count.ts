// src/marble/configs/count.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const countConfig: FirstOrderDiagramConfig = {
	operatorName: 'count',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: false },
			{ time: 5, label: 'b', color: '#34d399', active: false },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultLabel: '3', resultTime: 10 },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
