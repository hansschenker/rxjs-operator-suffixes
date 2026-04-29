// src/marble/configs/dematerialize.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const dematerializeConfig: FirstOrderDiagramConfig = {
	operatorName: 'dematerialize',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'N(a)', color: '#a78bfa', active: true, resultLabel: 'a' },
			{ time: 5, label: 'N(b)', color: '#34d399', active: true, resultLabel: 'b' },
		],
		completedAt: 8,
	},
	result: { completedAt: 8 },
}
