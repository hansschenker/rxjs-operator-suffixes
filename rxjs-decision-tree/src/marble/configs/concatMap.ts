import type { MarbleDiagramConfig } from '../marble.types'

export const concatMapConfig: MarbleDiagramConfig = {
	operatorName: 'concatMap',
	totalTime: 10,

	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 2, label: 'B', color: '#fb923c' },
			{ time: 3, label: 'C', color: '#34d399' },
		],
		completedAt: 3,
	},

	inners: [
		{
			color: '#a78bfa',
			startTime: 1,
			completedAt: 4,
			values: [
				{ time: 2, label: 'a1', active: true },
				{ time: 3, label: 'a2', active: true },
			],
		},
		{
			color: '#fb923c',
			startTime: 4,
			completedAt: 7,
			values: [
				{ time: 5, label: 'b1', active: true },
				{ time: 6, label: 'b2', active: true },
			],
		},
		{
			color: '#34d399',
			startTime: 7,
			completedAt: 10,
			values: [
				{ time: 8, label: 'c1', active: true },
				{ time: 9, label: 'c2', active: true },
			],
		},
	],

	result: {
		values: [
			{ time: 2, label: 'a1', color: '#a78bfa' },
			{ time: 3, label: 'a2', color: '#a78bfa' },
			{ time: 5, label: 'b1', color: '#fb923c' },
			{ time: 6, label: 'b2', color: '#fb923c' },
			{ time: 8, label: 'c1', color: '#34d399' },
			{ time: 9, label: 'c2', color: '#34d399' },
		],
		completedAt: 10,
	},
}
