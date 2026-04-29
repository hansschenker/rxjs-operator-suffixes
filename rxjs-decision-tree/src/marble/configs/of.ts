// src/marble/configs/of.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const ofConfig: FirstOrderDiagramConfig = {
	operatorName: 'of',
	totalTime: 5,
	source: {
		values: [
			{ time: 1, label: '1', color: '#a78bfa', active: true },
			{ time: 2, label: '2', color: '#34d399', active: true },
			{ time: 3, label: '3', color: '#fb923c', active: true },
		],
		completedAt: 3.5,
	},
	result: { completedAt: 3.5 },
}
