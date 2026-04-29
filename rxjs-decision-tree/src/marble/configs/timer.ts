// src/marble/configs/timer.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const timerConfig: FirstOrderDiagramConfig = {
	operatorName: 'timer(3000)',
	totalTime: 6,
	source: {
		values: [
			{ time: 3, label: '0', color: '#a78bfa', active: true },
		],
		completedAt: 3.5,
	},
	result: { completedAt: 3.5 },
}
