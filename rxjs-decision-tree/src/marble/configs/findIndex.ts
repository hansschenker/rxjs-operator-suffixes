// src/marble/configs/findIndex.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const findIndexConfig: FirstOrderDiagramConfig = {
	operatorName: 'findIndex',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: false },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultLabel: '1' },
			{ time: 8, label: 'c', color: '#fb923c', active: false },
		],
	},
	result: { completedAt: 5.5 },
}
