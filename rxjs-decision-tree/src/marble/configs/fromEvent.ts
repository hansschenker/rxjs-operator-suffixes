// src/marble/configs/fromEvent.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const fromEventConfig: FirstOrderDiagramConfig = {
	operatorName: 'fromEvent',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'click', color: '#a78bfa', active: true },
			{ time: 5, label: 'click', color: '#34d399', active: true },
			{ time: 8, label: 'click', color: '#fb923c', active: true },
		],
	},
	result: {},
}
