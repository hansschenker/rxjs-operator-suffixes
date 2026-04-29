// src/marble/configs/interval.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const intervalConfig: FirstOrderDiagramConfig = {
	operatorName: 'interval(2000)',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: '0', color: '#a78bfa', active: true },
			{ time: 4, label: '1', color: '#34d399', active: true },
			{ time: 6, label: '2', color: '#fb923c', active: true },
			{ time: 8, label: '3', color: '#38bdf8', active: true },
		],
	},
	result: {},
}
