// src/marble/configs/isEmpty.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const isEmptyConfig: FirstOrderDiagramConfig = {
	operatorName: 'isEmpty',
	title: 'isEmpty — emits true when source completes with no values',
	totalTime: 6,
	source: {
		values: [],
		completedAt: 3,
	},
	result: { completedAt: 3 },
}
