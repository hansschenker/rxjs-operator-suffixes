// src/marble/configs/share.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const shareConfig: FirstOrderDiagramConfig = {
	title: 'share — shared execution, no replay',
	operatorName: 'share',
	totalTime: 8,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: true },
		],
		completedAt: 8,
	},
	result: { completedAt: 8 },
}
