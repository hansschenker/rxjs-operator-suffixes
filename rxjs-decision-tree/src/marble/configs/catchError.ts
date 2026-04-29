// src/marble/configs/catchError.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const catchErrorConfig: FirstOrderDiagramConfig = {
	title: 'catchError — switches to fallback on error',
	operatorName: 'catchError',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a',  color: '#a78bfa', active: true },
			{ time: 4, label: 'b',  color: '#34d399', active: true },
			{ time: 6, label: '✗',  color: '#f87171', active: true, resultLabel: 'fallback', resultTime: 7 },
		],
	},
	result: { completedAt: 9 },
}
