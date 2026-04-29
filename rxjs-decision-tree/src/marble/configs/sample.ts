// src/marble/configs/sample.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const sampleConfig: FirstOrderDiagramConfig = {
	operatorName: 'sample',
	totalTime: 12,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 2, label: 'b', color: '#34d399', active: true, resultTime: 3 },
			{ time: 5, label: 'c', color: '#fb923c', active: false },
			{ time: 6, label: 'd', color: '#38bdf8', active: true, resultTime: 6 },
			{ time: 9, label: 'e', color: '#f87171', active: true, resultTime: 9 },
		],
	},
	result: {},
}
