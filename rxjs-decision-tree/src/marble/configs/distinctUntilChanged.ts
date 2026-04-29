// src/marble/configs/distinctUntilChanged.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const distinctUntilChangedConfig: FirstOrderDiagramConfig = {
	operatorName: 'distinctUntilChanged',
	totalTime: 12,
	source: {
		values: [
			{ time: 1,  label: '1', color: '#a78bfa', active: true  },
			{ time: 3,  label: '1', color: '#34d399', active: false },
			{ time: 5,  label: '2', color: '#fb923c', active: true  },
			{ time: 7,  label: '2', color: '#38bdf8', active: false },
			{ time: 10, label: '3', color: '#f87171', active: true  },
		],
		completedAt: 12,
	},
	result: { completedAt: 12 },
}
