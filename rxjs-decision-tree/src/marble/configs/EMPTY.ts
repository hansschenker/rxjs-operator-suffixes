// src/marble/configs/EMPTY.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const emptyConfig: FirstOrderDiagramConfig = {
	operatorName: 'EMPTY',
	totalTime: 3,
	source: {
		values: [],
		completedAt: 1,
	},
	result: { completedAt: 1 },
}
