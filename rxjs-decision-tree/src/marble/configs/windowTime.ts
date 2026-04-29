// src/marble/configs/windowTime.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const windowTimeConfig: FirstOrderDiagramConfig = {
	title: 'windowTime — simplified (result is an inner Observable)',
	operatorName: 'windowTime(3000)',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 2, label: 'b', color: '#34d399', active: true, resultTime: 3, resultLabel: 'win1' },
			{ time: 5, label: 'c', color: '#fb923c', active: false },
			{ time: 6, label: 'd', color: '#38bdf8', active: true, resultTime: 6, resultLabel: 'win2' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
