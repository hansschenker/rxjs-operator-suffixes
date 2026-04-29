// src/marble/configs/windowCount.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const windowCountConfig: FirstOrderDiagramConfig = {
	title: 'windowCount — simplified (result is an inner Observable)',
	operatorName: 'windowCount(2)',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: false },
			{ time: 4, label: 'b', color: '#34d399', active: true, resultLabel: 'win1' },
			{ time: 6, label: 'c', color: '#fb923c', active: false },
			{ time: 8, label: 'd', color: '#38bdf8', active: true, resultLabel: 'win2' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
