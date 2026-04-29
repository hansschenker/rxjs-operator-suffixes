// src/marble/configs/publish.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const publishConfig: FirstOrderDiagramConfig = {
	title: 'publish — use with connect()',
	operatorName: 'publish',
	totalTime: 8,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: true },
		],
		completedAt: 8,
	},
	result: { completedAt: 8 },
}
