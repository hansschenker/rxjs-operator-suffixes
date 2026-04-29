// src/marble/configs/scan.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const scanConfig: FirstOrderDiagramConfig = {
	operatorName: 'scan',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: '1', color: '#a78bfa', active: true, resultLabel: '1' },
			{ time: 5, label: '2', color: '#34d399', active: true, resultLabel: '3' },
			{ time: 8, label: '3', color: '#fb923c', active: true, resultLabel: '6' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
