// src/marble/configs/find.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const findConfig: FirstOrderDiagramConfig = {
	operatorName: 'find',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: false },
			{ time: 5, label: 'b', color: '#34d399', active: true  },
			{ time: 8, label: 'c', color: '#fb923c', active: false },
		],
	},
	result: { completedAt: 5.5 },
}
