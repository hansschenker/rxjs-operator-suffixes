// src/marble/configs/map.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const mapConfig: FirstOrderDiagramConfig = {
	operatorName: 'map',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultLabel: 'A' },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultLabel: 'B' },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultLabel: 'C' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
