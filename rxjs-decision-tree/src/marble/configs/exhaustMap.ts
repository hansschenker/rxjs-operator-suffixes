// src/marble/configs/exhaustMap.ts
import type { MarbleDiagramConfig } from '../marble.types'

export const exhaustMapConfig: MarbleDiagramConfig = {
	operatorName: 'exhaustMap',
	totalTime: 9,

	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa', spawnsInnerIndex: 0 },
			{ time: 2, label: 'B', color: '#34d399', spawnsInnerIndex: null },
			{ time: 3, label: 'C', color: '#38bdf8', spawnsInnerIndex: null },
			{ time: 6, label: 'D', color: '#fb923c', spawnsInnerIndex: 1 },
			{ time: 7, label: 'E', color: '#fbbf24', spawnsInnerIndex: null },
		],
		completedAt: 9,
	},

	inners: [
		{
			color: '#a78bfa',
			startTime: 1,
			completedAt: 5,
			values: [
				{ time: 2.5, label: 'a1', active: true },
				{ time: 4,   label: 'a2', active: true },
			],
		},
		{
			color: '#fb923c',
			startTime: 6,
			completedAt: 9,
			values: [
				{ time: 7.5, label: 'b1', active: true },
				{ time: 8.5, label: 'b2', active: true },
			],
		},
	],

	result: {
		values: [
			{ time: 2.5, label: 'a1', color: '#a78bfa' },
			{ time: 4,   label: 'a2', color: '#a78bfa' },
			{ time: 7.5, label: 'b1', color: '#fb923c' },
			{ time: 8.5, label: 'b2', color: '#fb923c' },
		],
		completedAt: 9,
	},
}
