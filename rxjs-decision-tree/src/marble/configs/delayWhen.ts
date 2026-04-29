// src/marble/configs/delayWhen.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const delayWhenConfig: FirstOrderDiagramConfig = {
	operatorName: 'delayWhen',
	totalTime: 12,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultTime: 5  },
			{ time: 4, label: 'b', color: '#34d399', active: true, resultTime: 6  },
			{ time: 7, label: 'c', color: '#fb923c', active: true, resultTime: 11 },
		],
		completedAt: 8,
	},
	result: { completedAt: 12 },
}
