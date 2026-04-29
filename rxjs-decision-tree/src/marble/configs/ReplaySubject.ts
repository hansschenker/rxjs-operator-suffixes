// src/marble/configs/ReplaySubject.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const replaySubjectConfig: FirstOrderDiagramConfig = {
	title: 'ReplaySubject — replays last N values',
	operatorName: 'ReplaySubject(2)',
	totalTime: 8,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 4, label: 'b', color: '#34d399', active: true },
			{ time: 6, label: 'c', color: '#fb923c', active: true },
		],
	},
	result: {},
}
