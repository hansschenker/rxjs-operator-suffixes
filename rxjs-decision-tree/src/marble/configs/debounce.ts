// src/marble/configs/debounce.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const debounceConfig: FirstOrderDiagramConfig = {
	operatorName: 'debounce',
	totalTime: 14,
	source: {
		values: [
			{ time: 1,  label: 'a', color: '#a78bfa', active: false },
			{ time: 2,  label: 'b', color: '#34d399', active: false },
			{ time: 3,  label: 'c', color: '#fb923c', active: true, resultTime: 6  },
			{ time: 9,  label: 'd', color: '#38bdf8', active: false },
			{ time: 10, label: 'e', color: '#f87171', active: true, resultTime: 13 },
		],
	},
	result: {},
}
