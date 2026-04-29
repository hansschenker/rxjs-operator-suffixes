// src/marble/configs/zip.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const zipConfig: FirstOrderDiagramConfig = {
	title: 'zip — pairs values by index',
	operatorName: 'zip',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultLabel: '[a,1]' },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultLabel: '[b,2]' },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultLabel: '[c,3]' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
