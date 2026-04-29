// src/marble/configs/merge.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const mergeConfig: FirstOrderDiagramConfig = {
	title: 'merge — interleaves all sources',
	operatorName: 'merge',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 4, label: 'b', color: '#34d399', active: true },
			{ time: 7, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
