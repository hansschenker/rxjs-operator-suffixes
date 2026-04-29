// src/marble/configs/finalize.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const finalizeConfig: FirstOrderDiagramConfig = {
	operatorName: 'finalize',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: true },
			{ time: 8, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
