// src/marble/configs/throttleTime.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const throttleTimeConfig: FirstOrderDiagramConfig = {
	operatorName: 'throttleTime(300)',
	totalTime: 12,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true  },
			{ time: 2, label: 'b', color: '#34d399', active: false },
			{ time: 3, label: 'c', color: '#fb923c', active: false },
			{ time: 6, label: 'd', color: '#38bdf8', active: true  },
			{ time: 7, label: 'e', color: '#f87171', active: false },
		],
		completedAt: 12,
	},
	result: { completedAt: 12 },
}
