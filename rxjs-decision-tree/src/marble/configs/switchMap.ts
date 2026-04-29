// src/marble/configs/switchMap.ts
import type { MarbleDiagramConfig } from '../marble.types'

export const switchMapConfig: MarbleDiagramConfig = {
	operatorName: 'switchMap',
	totalTime: 9,
	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 3, label: 'B', color: '#fb923c' },
			{ time: 6, label: 'C', color: '#34d399' },
		],
		completedAt: 9,
	},
	inners: [
		{
			color: '#a78bfa', startTime: 1, cancelledAt: 3,
			values: [
				{ time: 2,   label: 'a1', active: true  },
				{ time: 3.5, label: 'a2', active: false },
			],
		},
		{
			color: '#fb923c', startTime: 3, cancelledAt: 6,
			values: [
				{ time: 4,   label: 'b1', active: true  },
				{ time: 5,   label: 'b2', active: true  },
				{ time: 6.5, label: 'b3', active: false },
			],
		},
		{
			color: '#34d399', startTime: 6, completedAt: 9,
			values: [
				{ time: 7, label: 'c1', active: true },
				{ time: 8, label: 'c2', active: true },
			],
		},
	],
	result: {
		values: [
			{ time: 2, label: 'a1', color: '#a78bfa' },
			{ time: 4, label: 'b1', color: '#fb923c' },
			{ time: 5, label: 'b2', color: '#fb923c' },
			{ time: 7, label: 'c1', color: '#34d399' },
			{ time: 8, label: 'c2', color: '#34d399' },
		],
		completedAt: 9,
	},
}
