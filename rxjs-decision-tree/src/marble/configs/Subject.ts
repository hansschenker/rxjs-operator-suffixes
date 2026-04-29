// src/marble/configs/Subject.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const subjectConfig: FirstOrderDiagramConfig = {
	operatorName: 'Subject',
	totalTime: 8,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: true },
			{ time: 7, label: 'c', color: '#fb923c', active: true },
		],
	},
	result: {},
}
