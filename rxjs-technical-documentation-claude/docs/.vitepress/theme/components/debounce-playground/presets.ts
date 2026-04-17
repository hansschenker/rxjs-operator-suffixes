// docs/.vitepress/theme/components/debounce-playground/presets.ts

import type { Preset } from './types'

export const PRESETS: readonly Preset[] = [
	{
		name: 'Typing burst',
		description: 'Rapid inputs collapse into a single trailing emission.',
		marbles: [
			{ label: 'a', time: 200 },
			{ label: 'b', time: 350 },
			{ label: 'c', time: 500 },
			{ label: 'd', time: 650 },
			{ label: 'e', time: 800 },
		],
	},
	{
		name: 'Steady typing',
		description: 'Spacing greater than debounceMs — every input emits.',
		marbles: [
			{ label: 'a', time: 200 },
			{ label: 'b', time: 700 },
			{ label: 'c', time: 1200 },
			{ label: 'd', time: 1700 },
			{ label: 'e', time: 2200 },
		],
	},
	{
		name: 'Two bursts',
		description: 'Bursts separated by silence — one emission per burst.',
		marbles: [
			{ label: 'a', time: 150 },
			{ label: 'b', time: 300 },
			{ label: 'c', time: 1200 },
			{ label: 'd', time: 1350 },
		],
	},
	{
		name: 'Firehose',
		description: 'Continuous input never fires until it stops.',
		marbles: Array.from({ length: 15 }, (_, i: number): { label: string; time: number } => ({
			label: String.fromCharCode(97 + i),
			time: 100 + i * 150,
		})),
	},
	{
		name: 'Lone click',
		description: 'Single input — standard deadline semantics.',
		marbles: [{ label: 'a', time: 1000 }],
	},
	{
		name: 'Emit on complete',
		description: 'Source completion flushes any pending value, bypassing the silence wait.',
		marbles: [
			{ label: 'a', time: 2500 },
			{ label: 'b', time: 2700 },
		],
	},
]

export const DEFAULT_PRESET_INDEX = 0
