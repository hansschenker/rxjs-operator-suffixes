// src/marble/configs/isEmpty.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const isEmptyConfig: FirstOrderDiagramConfig = {
	operatorName: 'isEmpty',
	totalTime: 6,
	source: {
		values: [
			{ time: 3, label: 'true', color: '#34d399', active: true, resultTime: 3 },
		],
		completedAt: 3,
	},
	result: { completedAt: 3 },
}
