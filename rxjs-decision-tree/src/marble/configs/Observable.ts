// src/marble/configs/Observable.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const observableConfig: FirstOrderDiagramConfig = {
	operatorName: 'new Observable()',
	totalTime: 8,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true },
			{ time: 4, label: 'b', color: '#34d399', active: true },
			{ time: 7, label: 'c', color: '#fb923c', active: true },
		],
	},
	result: {},
}
