// src/marble/configs/delay.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const delayConfig: FirstOrderDiagramConfig = {
	operatorName: 'delay(200)',
	totalTime: 12,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultTime: 4  },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultTime: 7  },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultTime: 10 },
		],
		completedAt: 9,
	},
	result: { completedAt: 11 },
}
