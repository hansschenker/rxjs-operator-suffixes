// src/marble/configs/defaultIfEmpty.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const defaultIfEmptyConfig: FirstOrderDiagramConfig = {
	operatorName: 'defaultIfEmpty',
	totalTime: 6,
	source: {
		values: [
			{ time: 3, label: 'default', color: '#34d399', active: true, resultTime: 3 },
		],
		completedAt: 3,
	},
	result: { completedAt: 3 },
}
