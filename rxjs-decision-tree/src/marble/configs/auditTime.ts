// src/marble/configs/auditTime.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const auditTimeConfig: FirstOrderDiagramConfig = {
	operatorName: 'auditTime(300)',
	totalTime: 12,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 2, label: 'b', color: '#34d399', active: false },
			{ time: 3, label: 'c', color: '#fb923c', active: true, resultTime: 4 },
			{ time: 6, label: 'd', color: '#38bdf8', active: false },
			{ time: 7, label: 'e', color: '#f87171', active: true, resultTime: 8 },
		],
	},
	result: {},
}
