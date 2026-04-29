// src/marble/configs/race.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const raceConfig: FirstOrderDiagramConfig = {
	title: 'race — winner takes all',
	operatorName: 'race',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: true  },
			{ time: 3, label: 'b', color: '#34d399', active: false },
			{ time: 5, label: 'c', color: '#fb923c', active: false },
		],
	},
	result: {},
}
