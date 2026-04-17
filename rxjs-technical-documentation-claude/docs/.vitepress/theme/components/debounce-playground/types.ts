// docs/.vitepress/theme/components/debounce-playground/types.ts

export interface SourceMarble {
	readonly id: string
	readonly label: string
	readonly time: number
}

export interface OutputMarble {
	readonly id: string
	readonly sourceLabel: string
	readonly time: number
}

export interface GhostMarble {
	readonly sourceLabel: string
	readonly firesAt: number
}

export interface Preset {
	readonly name: string
	readonly description: string
	readonly marbles: readonly { label: string; time: number }[]
}
