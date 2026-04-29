// src/marble/configs/BehaviorSubject.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const behaviorSubjectConfig: FirstOrderDiagramConfig = {
	title: 'BehaviorSubject — replays current value',
	operatorName: 'BehaviorSubject',
	totalTime: 8,
	source: {
		values: [
			{ time: 0, label: 'init', color: '#64748b', active: true },
			{ time: 3, label: 'a',    color: '#a78bfa', active: true },
			{ time: 6, label: 'b',    color: '#34d399', active: true },
		],
	},
	result: {},
}
