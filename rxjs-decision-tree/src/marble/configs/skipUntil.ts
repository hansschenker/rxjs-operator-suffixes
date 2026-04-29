// src/marble/configs/skipUntil.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const skipUntilConfig: FirstOrderDiagramConfig = {
	operatorName: 'skipUntil',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: false },
			{ time: 4, label: 'b', color: '#34d399', active: false },
			{ time: 6, label: 'c', color: '#fb923c', active: true  },
			{ time: 8, label: 'd', color: '#38bdf8', active: true  },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
