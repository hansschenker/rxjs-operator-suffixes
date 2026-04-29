// src/marble/marble.types.ts

// ── First-order (single source → result) ──────────────────────────────────

export interface FirstOrderValue {
	time:         number
	label:        string
	color:        string
	active:       boolean       // true → solid + drop line + result; false → dimmed (filtered)
	resultTime?:  number        // where result circle lands (defaults to same time)
	resultLabel?: string        // label in result circle (defaults to same label)
}

export interface FirstOrderDiagramConfig {
	title?:       string
	operatorName: string
	totalTime:    number
	source: {
		values:       FirstOrderValue[]
		completedAt?: number
	}
	result: {
		completedAt?: number
	}
}

// ── Higher-order (source spawns inner Observables) ────────────────────────

export interface SourceEmission {
	time:              number
	label:             string
	color:             string
	spawnsInnerIndex?: number | null
}

export interface InnerValue {
	time:   number
	label:  string
	active: boolean
}

export interface InnerObservable {
	color:        string
	startTime:    number
	cancelledAt?: number
	completedAt?: number
	values:       InnerValue[]
}

export interface ResultValue {
	time:  number
	label: string
	color: string
}

export interface MarbleDiagramConfig {
	title?:       string
	operatorName: string
	totalTime:    number
	source: {
		emissions:    SourceEmission[]
		completedAt?: number
	}
	inners:  InnerObservable[]
	result: {
		values:       ResultValue[]
		completedAt?: number
	}
}
