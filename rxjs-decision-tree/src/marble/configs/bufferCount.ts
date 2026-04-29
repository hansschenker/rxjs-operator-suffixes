// src/marble/configs/bufferCount.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const bufferCountConfig: FirstOrderDiagramConfig = {
	title: 'bufferCount — simplified (result is an array)',
	operatorName: 'bufferCount(2)',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 3, label: 'b', color: '#34d399', active: true, resultLabel: '[a,b]' },
			{ time: 5, label: 'c', color: '#fb923c', active: false },
			{ time: 7, label: 'd', color: '#38bdf8', active: true, resultLabel: '[c,d]' },
			{ time: 9, label: 'e', color: '#f87171', active: true, resultLabel: '[e]', resultTime: 10 },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
