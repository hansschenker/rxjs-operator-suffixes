// src/marble/configs/defer.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const deferConfig: FirstOrderDiagramConfig = {
	operatorName: 'defer',
	totalTime: 6,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true },
			{ time: 3, label: 'b', color: '#34d399', active: true },
			{ time: 5, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 5.5,
	},
	result: { completedAt: 5.5 },
}
