// src/marble/configs/first.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const firstConfig: FirstOrderDiagramConfig = {
	operatorName: 'first',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 5, label: 'b', color: '#34d399', active: false },
			{ time: 8, label: 'c', color: '#fb923c', active: false },
		],
	},
	result: { completedAt: 2.5 },
}
