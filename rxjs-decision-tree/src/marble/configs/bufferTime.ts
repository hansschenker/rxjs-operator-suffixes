// src/marble/configs/bufferTime.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const bufferTimeConfig: FirstOrderDiagramConfig = {
	title: 'bufferTime — simplified (result is an array)',
	operatorName: 'bufferTime(3000)',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 2, label: 'b', color: '#34d399', active: true, resultTime: 3, resultLabel: '[a,b]' },
			{ time: 5, label: 'c', color: '#fb923c', active: false },
			{ time: 6, label: 'd', color: '#38bdf8', active: true, resultTime: 6, resultLabel: '[c,d]' },
			{ time: 9, label: 'e', color: '#f87171', active: true, resultTime: 9, resultLabel: '[e]'   },
		],
	},
	result: {},
}
