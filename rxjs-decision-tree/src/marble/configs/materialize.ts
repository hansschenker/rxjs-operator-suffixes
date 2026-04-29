// src/marble/configs/materialize.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const materializeConfig: FirstOrderDiagramConfig = {
	operatorName: 'materialize',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultLabel: 'N(a)' },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultLabel: 'N(b)' },
		],
		completedAt: 8,
	},
	result: { completedAt: 8 },
}
