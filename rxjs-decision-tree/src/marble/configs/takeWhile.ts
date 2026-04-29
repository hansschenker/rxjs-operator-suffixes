// src/marble/configs/takeWhile.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const takeWhileConfig: FirstOrderDiagramConfig = {
	operatorName: 'takeWhile',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 4, label: 'b', color: '#34d399', active: true  },
			{ time: 6, label: 'c', color: '#fb923c', active: false },
			{ time: 8, label: 'd', color: '#38bdf8', active: false },
		],
	},
	result: { completedAt: 6.5 },
}
