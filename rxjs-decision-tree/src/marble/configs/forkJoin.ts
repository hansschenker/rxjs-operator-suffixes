// src/marble/configs/forkJoin.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const forkJoinConfig: FirstOrderDiagramConfig = {
	title: 'forkJoin — waits for all to complete',
	operatorName: 'forkJoin',
	totalTime: 10,
	source: {
		values: [
			{ time: 3, label: 'A', color: '#a78bfa', active: true, resultTime: 9 },
			{ time: 6, label: 'B', color: '#34d399', active: true, resultTime: 9 },
			{ time: 8, label: 'C', color: '#fb923c', active: true, resultTime: 9 },
		],
		completedAt: 9,
	},
	result: { completedAt: 9 },
}
