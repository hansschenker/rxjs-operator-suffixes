// src/marble/configs/distinct.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const distinctConfig: FirstOrderDiagramConfig = {
	operatorName: 'distinct',
	totalTime: 12,
	source: {
		values: [
			{ time: 1,  label: 'a', color: '#a78bfa', active: true  },
			{ time: 3,  label: 'b', color: '#34d399', active: true  },
			{ time: 5,  label: 'a', color: '#fb923c', active: false },
			{ time: 8,  label: 'c', color: '#38bdf8', active: true  },
			{ time: 10, label: 'b', color: '#f87171', active: false },
		],
		completedAt: 12,
	},
	result: { completedAt: 12 },
}
