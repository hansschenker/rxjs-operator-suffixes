// src/marble/configs/iif.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const iifConfig: FirstOrderDiagramConfig = {
	title: 'iif — condition selects Observable at subscribe time',
	operatorName: 'iif',
	totalTime: 6,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true },
		],
		completedAt: 1.5,
	},
	result: { completedAt: 1.5 },
}
