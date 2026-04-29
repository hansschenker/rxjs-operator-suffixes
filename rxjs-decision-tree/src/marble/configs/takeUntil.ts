// src/marble/configs/takeUntil.ts
import type { FirstOrderDiagramConfig } from '../marble.types'
export const takeUntilConfig: FirstOrderDiagramConfig = {
	operatorName: 'takeUntil',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 4, label: 'b', color: '#34d399', active: true  },
			{ time: 6, label: 'c', color: '#fb923c', active: false },
			{ time: 8, label: 'd', color: '#38bdf8', active: false },
		],
	},
	result: { completedAt: 5.5 },
}
