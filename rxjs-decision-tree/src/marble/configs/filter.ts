// src/marble/configs/filter.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const filterConfig: FirstOrderDiagramConfig = {
	operatorName: 'filter',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: '1', color: '#a78bfa', active: false },
			{ time: 3, label: '2', color: '#34d399', active: true  },
			{ time: 5, label: '3', color: '#fb923c', active: false },
			{ time: 7, label: '4', color: '#38bdf8', active: true  },
			{ time: 9, label: '5', color: '#f87171', active: false },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
