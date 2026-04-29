// src/marble/configs/from.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const fromConfig: FirstOrderDiagramConfig = {
	operatorName: 'from',
	totalTime: 5,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true },
			{ time: 2, label: 'b', color: '#34d399', active: true },
			{ time: 3, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 3.5,
	},
	result: { completedAt: 3.5 },
}
