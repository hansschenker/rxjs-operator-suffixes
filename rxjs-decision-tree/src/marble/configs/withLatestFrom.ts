// src/marble/configs/withLatestFrom.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const withLatestFromConfig: FirstOrderDiagramConfig = {
	operatorName: 'withLatestFrom',
	totalTime: 10,
	source: {
		values: [
			{ time: 3, label: 'a', color: '#a78bfa', active: true, resultLabel: '[a,B]' },
			{ time: 7, label: 'b', color: '#34d399', active: true, resultLabel: '[b,C]' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
