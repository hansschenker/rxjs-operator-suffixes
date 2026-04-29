// src/marble/configs/combineLatest.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const combineLatestConfig: FirstOrderDiagramConfig = {
	title: 'combineLatest — simplified (2 sources)',
	operatorName: 'combineLatest',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'A', color: '#a78bfa', active: true },
			{ time: 4, label: 'B', color: '#34d399', active: true },
			{ time: 7, label: 'C', color: '#fb923c', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
