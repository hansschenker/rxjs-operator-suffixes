// src/marble/configs/take.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const takeConfig: FirstOrderDiagramConfig = {
	operatorName: 'take(2)',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 5, label: 'b', color: '#34d399', active: true  },
			{ time: 7, label: 'c', color: '#fb923c', active: false },
			{ time: 9, label: 'd', color: '#38bdf8', active: false },
		],
	},
	result: { completedAt: 5.5 },
}
